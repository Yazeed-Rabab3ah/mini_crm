import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const routerLocation = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      const from = (routerLocation.state as { from?: { pathname: string; search?: string } })?.from;
      const to = from ? `${from.pathname}${from.search ?? ""}` : "/contacts";
      navigate(to, { replace: true });
    } catch (err: any){
      const message =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Login failed. Check your username and password.";

      setError(message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4FF] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-center">Log in</h1>
        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-[#0B1122] py-2 text-white font-medium hover:opacity-90"
        >
          Sign in
        </button>
        <p className="text-center text-sm text-gray-600">
          No account? <Link to="/signup" className="text-gray-900 underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
