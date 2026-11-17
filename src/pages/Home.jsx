import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useSession } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const [communityNotices, setCommunityNotices] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
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

  const matchingNotices = communityNotices.filter((item) => {
    const queryTerm = searchFilter.toLowerCase();
    return (
      item.title?.toLowerCase().includes(queryTerm) ||
      item.category?.toLowerCase().includes(queryTerm) ||
      item.location?.toLowerCase().includes(queryTerm)
    );
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
          {matchingNotices.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No notices found. Be the first to post one!
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
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="text-xs text-gray-400">
                  Posted by: {item.authorEmail || "Anonymous"}
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
