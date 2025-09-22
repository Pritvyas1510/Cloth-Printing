import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "../Axios/AxiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize user to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [user?._id, user?.image]);

  // Fetch profile image for the user
  const fetchProfileImage = async (userId) => {
    try {
      const res = await axios.get(`/api/profile/${userId}`, { withCredentials: true });
      const profileImage = res.data.profileImage || "https://via.placeholder.com/150";
      setUser((prevUser) => ({
        ...prevUser,
        image: profileImage,
      }));
      // Update localStorage
      const storedData = JSON.parse(localStorage.getItem("userData")) || {};
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...storedData, image: profileImage })
      );
    } catch (error) {
      console.error("Error fetching profile image:", error.response?.data || error.message);
      setUser((prevUser) => ({
        ...prevUser,
        image: "https://via.placeholder.com/150",
      }));
    }
  };

  // Verify authentication with backend
useEffect(() => {
  const verifyAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/auth/verify", { withCredentials: true });
      if (response.data.success) {
        const userData = response.data.user;
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        await fetchProfileImage(userData._id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Auth verification error:", error.response?.data || error.message);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("userData");
    } finally {
      setLoading(false);
    }
  };

  verifyAuth();
}, []);


  // Login function
  const handleLogin = async (credentials, navigate) => {
    try {
      const response = await axios.post("/api/auth/login", credentials, { withCredentials: true });
      setIsAuthenticated(true);
      setUser(response.data.user);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...response.data.user,
          sessionId: response.data.sessionId || null,
        })
      );
      await fetchProfileImage(response.data.user._id);
      const redirectPath = response.data.user.role === "admin" ? "/admin" : "/";
      navigate(redirectPath);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Register function
  const handleRegister = async (data, navigate) => {
    try {
      const response = await axios.post("/api/auth/register", data, { withCredentials: true });
      setIsAuthenticated(true);
      setUser(response.data.user);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...response.data.user,
          sessionId: response.data.sessionId || null,
        })
      );
      await fetchProfileImage(response.data.user._id);
      navigate("/");
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userData");
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      return { success: false, message: "Logout failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user: memoizedUser, handleLogin, handleRegister, handleLogout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);