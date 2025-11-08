import React, { useState, useEffect } from "react";
import { Mail, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "../context/useAuth";

const Login = ({ onToggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();

  // Reset all form states when component mounts
  useEffect(() => {
    // Reset form immediately when component mounts
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLoading(false);
    setError("");
    
    // Also reset form when navigating to this page
    return () => {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoading(false);
      setError("");
    };
  }, []);
  
  // Handle route changes to reset form when navigating to login
  useEffect(() => {
    const handleRouteChange = () => {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoading(false);
      setError("");
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (loading) return;
    
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect to home page after successful login
        window.location.href = '/';
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <User className="w-10 h-10 text-indigo-600 mb-2" />
          <h2 className="text-xl font-bold">Sign In</h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-3 py-2 border rounded"
              placeholder="Email"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-4 pr-12 py-2 border rounded"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <button
            onClick={onToggleForm}
            className="text-indigo-600 font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
