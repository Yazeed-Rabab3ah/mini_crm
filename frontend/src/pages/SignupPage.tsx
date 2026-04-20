import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signup(username, email, password);
      navigate("/login");
    } catch (err  : any){
      const message =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.response?.data?.username[0] ||
      err.response?.data?.email[0] ||
      err.response?.data?.password[0] ||
      "Could not create account. Try a different username or email.";

      setError(message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4FF] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-center">Sign up</h1>
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-[#0B1122] py-2 text-white font-medium hover:opacity-90"
        >
          Create account
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
