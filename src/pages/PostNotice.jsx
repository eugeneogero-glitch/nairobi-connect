import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useSession } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const PostNotice = () => {
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("Community Event");
  const [noticeLocation, setNoticeLocation] = useState("");
  const [noticeDetails, setNoticeDetails] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const { activeUser } = useSession();
  const redirect = useNavigate();

  const onPublishNotice = async (event) => {
    event.preventDefault();
    if (!activeUser) {
      setSubmissionError("Please log in to publish a notice.");
      return;
    }
    try {
      setSubmissionError("");
      await addDoc(collection(db, "notices"), {
        title: noticeTitle,
        category: noticeCategory,
        location: noticeLocation,
        description: noticeDetails,
        authorId: activeUser.uid,
        authorName: activeUser.displayName || activeUser.email.split("@")[0],
        createdAt: serverTimestamp(),
      });
      redirect("/");
    } catch (err) {
      setSubmissionError(`Could not publish notice: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Post Community Notice
          </h2>
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Back to Feed
          </Link>
        </div>

        {submissionError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {submissionError}
          </div>
        )}

        <form onSubmit={onPublishNotice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notice Title
            </label>
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={(event) => setNoticeTitle(event.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Westlands Community Clean-Up"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={noticeCategory}
              onChange={(event) => setNoticeCategory(event.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Community Event">Community Event</option>
              <option value="Safety Alert">Safety Alert</option>
              <option value="Lost & Found">Lost &amp; Found</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              required
              value={noticeLocation}
              onChange={(event) => setNoticeLocation(event.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Westlands, Nairobi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              required
              rows="4"
              value={noticeDetails}
              onChange={(event) => setNoticeDetails(event.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide details about the notice..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Publish Notice
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostNotice;
