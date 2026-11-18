import { Navigate } from "react-router-dom";
import { useSession } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { activeUser } = useSession();

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
