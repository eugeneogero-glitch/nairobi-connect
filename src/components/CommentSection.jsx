import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export default function CommentSection({ noticeId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "notices", noticeId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentList);
    });

    return () => unsubscribe();
  }, [noticeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, "notices", noticeId, "comments"), {
        text: newComment,
        authorName: currentUser?.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  return (
    <div className="mt-4 border-t pt-3">
      <h4 className="font-semibold text-sm mb-2">Discussion</h4>
      
      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
            <span className="font-bold text-xs text-gray-700 block">
              {comment.authorName}
            </span>
            <p className="text-gray-900">{comment.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
        >
          Post
        </button>
      </form>
    </div>
  );
}