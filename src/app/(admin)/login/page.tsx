"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#392D2B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-display text-[32px] italic text-[#EEE9E3] mb-1">
            Cloud Stone
          </h1>
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#EEE9E3]/30 font-sans">
            Admin
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-[#EEE9E3]/40 font-sans mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[#EEE9E3]/20 py-2.5 text-[14px] text-[#EEE9E3] placeholder:text-[#EEE9E3]/20 font-sans focus:outline-none focus:border-[#EEE9E3]/60 transition-[border-color] duration-[250ms]"
              placeholder="admin@cloudstonestudio.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-[#EEE9E3]/40 font-sans mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[#EEE9E3]/20 py-2.5 text-[14px] text-[#EEE9E3] placeholder:text-[#EEE9E3]/20 font-sans focus:outline-none focus:border-[#EEE9E3]/60 transition-[border-color] duration-[250ms]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-400 font-sans">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#EEE9E3] text-[#392D2B] text-[11px] uppercase tracking-[0.1em] font-medium font-sans transition-opacity duration-[250ms] hover:opacity-85 disabled:opacity-50 active:scale-[0.97]"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
