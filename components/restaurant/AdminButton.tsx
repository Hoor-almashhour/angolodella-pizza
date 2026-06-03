"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminButton({
  locale,
}: {
  locale: string;
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      setIsAdmin(!!data.user);
    };

    checkUser();
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="flex items-center justify-center">
         <Link
            href={`/${locale}/admin`}
            className=" rounded-lg bg-green-600 px-4 py-3 text-white"
          >
            إضافة صنف
          </Link>
      </div>
    
  );
}