import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
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
          <option value="Community Event">Community Event</option>
          <option value="Safety Alert">Safety Alert</option>
          <option value="Lost & Found">Lost & Found</option>
          <option value="General">General</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <p className="text-gray-500">No notices found.</p>
        ) : (
          filteredNotices.map((notice) => {
            const isOwner = activeUser && notice.authorId === activeUser.uid;
            const isEditing = editingId === notice.id;

            return (
              <div
                key={notice.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      aria-label="Edit title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                    <textarea
                      aria-label="Edit description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg text-gray-800">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{notice.description}</p>
                  </>
                )}

                <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                  <span>Category: {notice.category || "General"}</span>
                  <span>Posted by: {notice.authorName || "Anonymous"}</span>
                </div>

                {isOwner && (
                  <div className="flex gap-2 mt-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(notice.id)}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(notice)}>Edit</button>
                        <button onClick={() => handleDelete(notice.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}

                <CommentSection noticeId={notice.id} currentUser={activeUser} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
