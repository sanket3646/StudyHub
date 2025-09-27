"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { user, signUp, signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");

  // Redirect if user is already signed in
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (isSignUp) {
      res = await signUp(email, password);
    } else {
      res = await signIn(email, password);
    }

    if (res.error) {
      setMessage(res.error.message);
    } else {
      setMessage(
        isSignUp
          ? "Check your email to confirm sign up!"
          : "Signed in successfully!"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-900">
          {isSignUp ? "Create Your Account" : "Welcome Back"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400 text-gray-900 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400 text-gray-900 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>

        <p className="text-center text-sm mt-4 text-gray-700">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-orange-500 font-semibold cursor-pointer hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}
      </form>
    </div>
  );
}
