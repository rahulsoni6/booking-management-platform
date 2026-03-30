import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!token.trim()) {
      alert("Please paste your API token to continue.");
      return;
    }

    localStorage.setItem("token", token.trim());
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your bearer token. This is required to fetch bookings from API.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">API Token</span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 w-full border px-2 py-2 rounded"
              placeholder="Paste token here"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Token & Continue
          </button>
        </form>
      </div>
    </div>
  );
}