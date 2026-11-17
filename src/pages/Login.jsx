import { useState } from "react";
import { useSession } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const { authenticateWithEmail, authenticateWithGoogle } = useSession();
  const redirect = useNavigate();

  const onEmailFormSubmit = async (event) => {
    event.preventDefault();
    try {
      setAuthError("");
      await authenticateWithEmail(userEmail, userPassword);
      redirect("/");
    } catch (err) {
      setAuthError(`Sign-in failed: ${err.message}`);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setAuthError("");
      await authenticateWithGoogle();
      redirect("/");
    } catch (err) {
      setAuthError(`Google sign-in failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Nairobi Connect - Sign In
        </h2>
        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={onEmailFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={userPassword}
              onChange={(event) => setUserPassword(event.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={onGoogleSignIn}
            className="w-full py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
