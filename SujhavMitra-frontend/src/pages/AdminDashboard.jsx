import React, { useEffect, useState, useCallback } from "react";
import { Users, Shield, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { API_BASE } from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Function to handle token expiration
  const handleTokenExpiration = useCallback((error) => {
    console.error('Authentication error:', error);
    // Don't show alert here to prevent multiple popups
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Fetch users when component mounts and token is available
  useEffect(() => {
    console.log('AdminDashboard mounted or token changed, token:', token ? 'exists' : 'not found');
    
    if (token) {
      console.log('Token found, fetching users...');
      fetchUsers();
    } else {
      // Check if we should be loading or redirecting
      const storedToken = localStorage.getItem('token');
      if (!storedToken && !loading) {
        console.log('No stored token found, redirecting to login...');
        handleTokenExpiration('No token found');
      } else if (storedToken && !token) {
        console.log('Token in localStorage but not in state, waiting for auth check...');
        // Wait for auth check to complete
      } else {
        console.log('No token available, setting loading to false');
        setLoading(false);
      }
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/user/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      
      if (response.status === 401) {
        throw new Error('Token expired or invalid');
      }
      
      if (response.ok) {
        setUsers(Array.isArray(data) ? data : (data.users || []));
        setError("");
      } else {
        throw new Error(data.ERROR || data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      if (error.message.includes('Token') || error.message.includes('token')) {
        handleTokenExpiration(error.message);
      } else {
        setError(error.message || "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleTokenExpiration]);

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    if (!token) {
      handleTokenExpiration('No authentication token found');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/user/deleteprofile/${userId}`, {
        method: "DELETE",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Token expired or invalid');
      }

      const data = await response.json();
      
      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        // Don't show alert as it might interfere with the page reload
      } else {
        throw new Error(data.ERROR || data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      if (error.message.includes('Token') || error.message.includes('token')) {
        handleTokenExpiration(error.message);
      } else {
        alert(error.message || "An error occurred while deleting the user. Please try again.");
      }
    }
  };

  const getRoleName = (roleId) => {
    const roles = {
      1: "Admin",
      2: "Moderator",
      3: "User",
    };
    return roles[roleId] || "Unknown";
  };

  if (loading) {
    console.log('Rendering loading state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    console.log('No token found, redirecting to login...');
    // Show a brief message before redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              User Management
            </h2>
            <p className="text-gray-600">Manage all users in the system</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Users Table */}
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
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-indigo-600" />
                            </div>
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

            {users.length === 0 && !error && (
              <div className="px-6 py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
