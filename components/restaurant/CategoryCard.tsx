"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { supabase } from "@/lib/supabase";
import type { MenuCategory } from "@/lib/menu-types";
import { t } from "@/lib/menu-utils";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
  category: MenuCategory;
  locale: string;
}

export function CategoryCard({
  category,
  locale,
}: CategoryCardProps) {

  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user?.email === "admin@angolo.com") {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, []);

  const deleteCategory = async () => {
    const confirmed = confirm("حذف الصنف؟");

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  };

  return (
    <Link
      href={`/menu/${category.slug}`}
      className="relative group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/55 backdrop-blur-sm"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={category.image}
          alt={t(category.name, locale)}
          fill
          className="object-cover"
        />
      </div>

      <p className="py-3 text-center text-sm font-semibold text-white">
        {t(category.name, locale)}
      </p>

      {isAdmin && (
         <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteCategory();
              }}
              className="absolute right-2 top-2 z-20 rounded bg-red-600 px-2 py-1 text-xs text-white cursor-pointer"
            >
              حذف
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                router.push(
                  `/ar/admin/menu-items?category=${category.id}`
                );
              }}
              className="absolute left-2 top-2 z-20 rounded bg-blue-600 px-2 py-1 text-xs text-white cursor-pointer"
            >
              إدارة
           </button>
         </>
      )}
      

    </Link>
  );
}