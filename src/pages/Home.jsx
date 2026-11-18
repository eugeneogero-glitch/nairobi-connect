import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useSession } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const [communityNotices, setCommunityNotices] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showOnlyMyNotices, setShowOnlyMyNotices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { activeUser, terminateSession } = useSession();
  const redirect = useNavigate();

  useEffect(() => {
    const loadCommunityFeed = async () => {
      try {
        const noticesQuery = query(
          collection(db, "notices"),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(noticesQuery);
        const fetchedItems = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setCommunityNotices(fetchedItems);
      } catch (fetchError) {
        console.error("Failed to load notices:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    loadCommunityFeed();
  }, []);

  const onSignOutClick = async () => {
    try {
      await terminateSession();
      redirect("/login");
    } catch (signOutError) {
      console.error("Error ending session:", signOutError);
    }
  };

  const onDeleteNotice = async (noticeId) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "notices", noticeId));
      setCommunityNotices((prev) =>
        prev.filter((item) => item.id !== noticeId),
      );
    } catch (err) {
      console.error("Failed to delete notice:", err);
      alert("Could not delete notice.");
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const onSaveEdit = async (noticeId) => {
    try {
      await updateDoc(doc(db, "notices", noticeId), {
        title: editTitle,
        description: editDescription,
      });
      setCommunityNotices((prev) =>
        prev.map((item) =>
          item.id === noticeId
            ? { ...item, title: editTitle, description: editDescription }
            : item,
        ),
      );
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update notice:", err);
      alert("Could not update notice.");
    }
  };

  const categories = [
    "All",
    "Community Event",
    "Safety Alert",
    "Lost & Found",
    "General",
  ];

  const matchingNotices = communityNotices.filter((item) => {
    const queryTerm = searchFilter.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(queryTerm) ||
      item.category?.toLowerCase().includes(queryTerm) ||
      item.location?.toLowerCase().includes(queryTerm);

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesAuthor =
      !showOnlyMyNotices || (activeUser && item.authorId === activeUser.uid);

    return matchesSearch && matchesCategory && matchesAuthor;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Nairobi Connect</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/post"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Post Notice
          </Link>
          {activeUser ? (
            <button
              onClick={onSignOutClick}
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              Log Out
            </button>
          ) : (
            <Link to="/login" className="text-blue-600 font-medium">
              Log In
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {activeUser && (
            <button
              onClick={() => setShowOnlyMyNotices(!showOnlyMyNotices)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                showOnlyMyNotices
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {showOnlyMyNotices ? "Show All Notices" : "My Notices"}
            </button>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search notices by title, category, or location..."
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
              <p className="text-gray-500 text-sm">
                Loading community notices...
              </p>
            </div>
          ) : matchingNotices.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No notices found matching your criteria.
            </p>
          ) : (
            matchingNotices.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {item.category || "General"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.location || "Nairobi"}
                  </span>
                </div>

                {editingId === item.id ? (
                  <div className="space-y-3 my-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold"
                    />
                    <textarea
                      rows="3"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSaveEdit(item.id)}
                        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {item.description}
                    </p>
                  </>
                )}

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Posted by: {item.authorName || "Anonymous"}</span>

                  {activeUser &&
                    activeUser.uid === item.authorId &&
                    editingId !== item.id && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEditing(item)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteNotice(item.id)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
