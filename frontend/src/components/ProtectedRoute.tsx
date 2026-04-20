import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken, getRefreshToken } from "../api/auth";

export default function ProtectedRoute() {
  const location = useLocation();
  const authed = Boolean(getAccessToken() || getRefreshToken());
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return (
      <Outlet />
  );
}
