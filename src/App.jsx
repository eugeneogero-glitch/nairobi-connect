import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SessionProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PostNotice from "./pages/PostNotice";

const App = () => {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <PostNotice />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </SessionProvider>
  );
};

export default App;
