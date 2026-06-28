import React, { useEffect, useState } from "react";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("kw_admin_token");
    const user = localStorage.getItem("kw_admin_user");

    if (token && user) {
      const parsedUser = JSON.parse(user);

      if (parsedUser.role === "admin") {
        setAuthToken(token);
        setAuthUser(parsedUser);
      } else {
        localStorage.removeItem("kw_admin_token");
        localStorage.removeItem("kw_admin_user");
      }
    }

    setAuthChecked(true);
  }, []);

  const handleAuthSuccess = (user, token) => {
    if (user.role !== "admin") {
      alert("This portal is only for admins. Please use the volunteer portal.");
      return;
    }

    localStorage.setItem("kw_admin_token", token);
    localStorage.setItem("kw_admin_user", JSON.stringify(user));

    setAuthUser(user);
    setAuthToken(token);
  };

  const handleSignOut = () => {
    localStorage.removeItem("kw_admin_token");
    localStorage.removeItem("kw_admin_user");
    setAuthUser(null);
    setAuthToken(null);
  };

  if (!authChecked) return null;

  if (!authUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AdminDashboard
      user={authUser}
      token={authToken}
      onSignOut={handleSignOut}
    />
  );
}