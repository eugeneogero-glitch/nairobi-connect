import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import { useSession } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { activeUser } = useSession();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(
          collection(db, "notices"),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const noticeList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotices(noticeList);
      } catch (error) {
        console.error("Error fetching notices: ", error);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Nairobi Connects - Notice Board
      </h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search notices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="All">All Categories</option>
          <option value="Lost & Found">Lost & Found</option>
          <option value="Events">Events</option>
          <option value="Services">Services</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <p className="text-gray-500">No notices found.</p>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <h3 className="font-bold text-lg text-gray-800">
                {notice.title}
              </h3>
              <p className="text-gray-600 mt-1">{notice.description}</p>

              <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                <span>Category: {notice.category || "General"}</span>
                <span>Posted by: {notice.authorName || "Anonymous"}</span>
              </div>

              <CommentSection noticeId={notice.id} currentUser={activeUser} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
