import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "react@hipster-inc.com",
    password: "React@123",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
        key_pass:
          "07ba959153fe7eec778361bf42079439",
      });


      /*
      Store token
      */

      const token = response.data.data.token.token ?? ""


      if (!token) {
        throw new Error("Token not found");
      }

      localStorage.setItem("token", token);

      /*
      Redirect to dashboard
      */

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);

      setError(
        "Authentication failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">

        <h1 className="text-2xl font-bold mb-4">
          Login
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Sign in to access the booking dashboard.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Email */}

          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Email
            </span>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="Enter email"
            />
          </label>

          {/* Password */}

          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Password
            </span>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="Enter password"
            />
          </label>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-600
              text-white
              py-2
              rounded
              hover:bg-blue-700
              disabled:bg-gray-400
            "
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}