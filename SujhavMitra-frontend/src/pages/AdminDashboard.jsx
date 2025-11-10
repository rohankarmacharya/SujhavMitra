import React, { useEffect, useState, useCallback } from "react";
import { Users, Activity, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { API_BASE } from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleTokenExpiration = useCallback(
    (error) => {
      console.error("Authentication error:", error);
      logout();
      navigate("/login");
    },
    [logout, navigate]
  );

  // Helper function to get user info by ID
  const getUserById = useCallback(
    (userId) => {
      return users.find((u) => u.id === userId) || null;
    },
    [users]
  );

  useEffect(() => {
    if (token) {
      if (activeTab === "users") {
        fetchUsers();
      } else {
        // Fetch users first if not already loaded, then fetch activities
        if (users.length === 0) {
          fetchUsers().then(() => fetchActivities());
        } else {
          fetchActivities();
        }
      }
    } else {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) handleTokenExpiration("No token found");
    }
  }, [token, activeTab]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.status === 401) throw new Error("Token expired or invalid");

      if (response.ok) {
        const usersList = Array.isArray(data) ? data : data.users || [];
        setUsers(usersList);
        setError("");
        return usersList; // Return users for chaining
      } else {
        throw new Error(data.ERROR || data.message || "Failed to fetch users");
      }
    } catch (error) {
      if (error.message.includes("Token")) handleTokenExpiration(error.message);
      else setError(error.message || "Network error. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, handleTokenExpiration]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/activity?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.status === 401) throw new Error("Token expired or invalid");

      if (response.ok) {
        setActivities(data.activities || data || []);
        setError("");
      } else {
        throw new Error(
          data.ERROR || data.message || "Failed to fetch activity"
        );
      }
    } catch (error) {
      if (error.message.includes("Token")) handleTokenExpiration(error.message);
      else setError(error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, handleTokenExpiration]);

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`${API_BASE}/user/deleteprofile/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) throw new Error("Token expired or invalid");
      const data = await response.json();

      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        throw new Error(data.ERROR || data.message || "Failed to delete user");
      }
    } catch (error) {
      if (error.message.includes("Token")) handleTokenExpiration(error.message);
      else alert(error.message || "An error occurred while deleting user.");
    }
  };

  const getRoleName = (roleId) => {
    const roles = { 1: "Admin", 2: "Moderator", 3: "User" };
    return roles[roleId] || "Unknown";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {activeTab}...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b pb-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-t-md font-medium ${
              activeTab === "users"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-1" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-2 rounded-t-md font-medium ${
              activeTab === "activity"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Activity className="w-4 h-4 inline-block mr-1" />
            Activity
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Users ({users.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role_id === 1
                              ? "bg-purple-100 text-purple-800"
                              : user.role_id === 2
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {getRoleName(user.role_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent User Activity ({activities.length})
              </h3>
            </div>

            {activities.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No recent activities found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((act, i) => {
                      const user = getUserById(act.user_id);
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {user ? user.name : "Unknown User"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {act.action}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(act.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
