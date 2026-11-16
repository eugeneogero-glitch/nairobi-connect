import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNotices() {
      try {
        const q = query(
          collection(db, "notices"),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotices(list);
      } catch (err) {
        console.error("Error fetching notices: ", err);
      }
    }
    fetchNotices();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  }

  const filteredNotices = notices.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.category?.toLowerCase().includes(search.toLowerCase()) ||
      n.location?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Nairobi Connect 🇰🇪</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/post"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Post Notice
          </Link>
          {currentUser ? (
            <button
              onClick={handleLogout}
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
            placeholder="🔍 Search notices by title, category, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-4">
          {filteredNotices.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No notices found. Be the first to post one!
            </p>
          ) : (
            filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {notice.category || "General"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {notice.location || "Nairobi"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {notice.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {notice.description}
                </p>
                <div className="text-xs text-gray-400">
                  Posted by: {notice.authorEmail || "Anonymous"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
