"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await login(email, password);

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">

        <div className="text-center mb-8">

          <div className="w-20 h-20 bg-blue-700 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
            HQ
          </div>

          <h1 className="text-xl font-bold text-gray-800 mt-4">
            BANRDB-9
          </h1>

          <h2 className="text-lg font-semibold text-green-700 mt-2">
            Task Management System
          </h2>

        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>

            <label className="block mb-2 text-black font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />

          </div>

          <div>

            <label className="block mb-2 text-black font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} Unit Management System
        </p>

      </div>
    </main>
  );
}