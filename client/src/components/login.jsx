import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../apis/axiosinstance";

const Login = () => {
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleUsernameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: get tokens
      const { data: tokenData } = await axiosInstance.post("/token/", {
        username: username.trim(),
        password,
      });

      localStorage.setItem("access_token", tokenData.access);
      localStorage.setItem("refresh_token", tokenData.refresh);

      // Step 2: fetch the logged-in user's profile (role, name, etc.)
      const { data: me } = await axiosInstance.get("/users/users/me/", {
        headers: { Authorization: `Bearer ${tokenData.access}` },
      });

      localStorage.setItem("username", me.username);
      localStorage.setItem("user_role", me.role);
      localStorage.setItem("user_id", me.id);
      localStorage.setItem("is_superuser", me.is_superuser);

      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Incorrect username or password.");
      } else if (err.response) {
        setError("Something went wrong. Please try again.");
      } else {
        setError("Can't reach the server. Check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Restaurant Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to manage your restaurant
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleUsernameKeyDown}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
              placeholder="admin"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-neutral-500 hover:text-neutral-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-neutral-900 text-white text-sm font-medium py-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;