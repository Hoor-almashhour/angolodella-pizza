"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();

  const t = useTranslations("restaurant.Login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (!error) {
      alert(t("loginSuccess"));
      router.push("/");
      router.refresh();
    } else {
      alert(t("loginError"));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    alert(t("logoutSuccess"));

    setUser(null);

    router.push("/");
    router.refresh();
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (user) {
      await logout();
    } else {
      await login();
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-black/55 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-white"
            >
              {t("email")}
            </label>

            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-white"
            >
              {t("password")}
            </label>

            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-row-reverse items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 rounded border-gray-300"
              />

              <label
                htmlFor="rememberMe"
                className="text-sm text-white"
              >
                {t("remember")}
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-white hover:text-[#C39E71]"
            >
              {t("forgot")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#f5c518] py-3 text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {user
              ? t("logout")
              : loading
              ? t("loading")
              : t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}