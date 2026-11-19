import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { useSession } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { activeUser } = useSession();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(
          collection(db, "notices"),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        setNotices(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching notices: ", error);
      }
    };
    fetchNotices();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const startEdit = (notice) => {
    setEditingId(notice.id);
    setEditTitle(notice.title);
    setEditDescription(notice.description);
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "notices", id), {
        title: editTitle,
        description: editDescription,
      });
      setNotices((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, title: editTitle, description: editDescription }
            : n,
        ),
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating notice: ", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notice: ", error);
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case "Safety Alert":
        return "bg-red-100 text-red-700 border-red-200";
      case "Lost & Found":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Community Event":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Nairobi Connects - Notice Board
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Local community updates, alerts, and lost &amp; found
            </p>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium">
            {activeUser ? (
              <>
                <Link
                  to="/post"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Post a notice
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Log in
              </Link>
            )}
          </nav>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            <option value="Community Event">Community Event</option>
            <option value="Safety Alert">Safety Alert</option>
            <option value="Lost & Found">Lost &amp; Found</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="space-y-5">
          {filteredNotices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-500 text-sm">No notices found.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const isOwner =
                Boolean(activeUser) &&
                (notice.authorId === activeUser.uid ||
                  notice.userId === activeUser.uid ||
                  notice.uid === activeUser.uid ||
                  (activeUser.email &&
                    notice.authorEmail === activeUser.email));
              const isEditing = editingId === notice.id;
              const categoryLabel = notice.category || "General";

              return (
                <article
                  key={notice.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        aria-label="Edit title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        aria-label="Edit description"
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-lg text-slate-900 leading-snug">
                          {notice.title}
                        </h3>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${getCategoryBadgeStyle(
                            categoryLabel,
                          )}`}
                        >
                          Category: {categoryLabel}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm mt-2 leading-relaxed">
                        {notice.description}
                      </p>
                    </>
                  )}

                  <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span>
                      Posted by:{" "}
                      <strong className="font-medium text-slate-700">
                        {notice.authorName || "Anonymous"}
                      </strong>
                      {notice.createdAt?.toDate && (
                        <span className="text-slate-400">
                          {" "}
                          · {notice.createdAt.toDate().toLocaleDateString()}
                        </span>
                      )}
                    </span>

                    {isOwner && (
                      <div className="flex items-center gap-3 text-xs font-medium">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(notice.id)}
                              className="text-emerald-600 hover:text-emerald-800 hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-slate-500 hover:text-slate-700 hover:underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(notice)}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(notice.id)}
                              className="text-red-600 hover:text-red-800 hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <CommentSection
                    noticeId={notice.id}
                    currentUser={activeUser}
                  />
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
