"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import type { MenuItem } from "@/lib/menu-types";
import { formatPrice, t } from "@/lib/menu-utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface MenuItemCardProps {
  item: MenuItem;
  onSelect?: () => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
export function MenuItemCard({
  item,
  onSelect,onEdit,onDelete
}: MenuItemCardProps) {


  const locale = useLocale();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user?.email === "admin@angolo.com") {
      setIsAdmin(true);
    }
  };

  checkAdmin();
 }, []);


 
  const deleteItem = async () => {
    const confirmed = confirm("حذف الصنف؟");

    if (!confirmed) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  };
    
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      className="flex w-full cursor-pointer gap-3 rounded-2xl bg-white p-3 text-start shadow-md transition-shadow active:shadow-sm"
    >
      <div className="relative h-35 w-35 shrink-0 overflow-hidden rounded-xl">
         
        <Image
          src={item.image}
          alt={t(item.name, locale)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 85vw, 512px"
          quality={90}
        />

        {isAdmin && (
          <div className="absolute left-2 top-2 z-20 flex gap-8">
            <button
              onClick={(e) => {
                
                e.preventDefault();
                e.stopPropagation();

                router.push(
                  `/ar/admin/menu-items?edit=${item.id}`
                );
              }}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
            >
              تعديل
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteItem();
              }}
              className="rounded bg-red-600 px-2 py-1 text-xs text-white"
            >
              حذف
            </button>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="font-bold text-zinc-900">{item.order}. {t(item.name, locale)}</h3>
          
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
            {t(item.description, locale)}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-emerald-600">
            {formatPrice(item.price, locale)}
          </span>
          <span className="flex h-9 w-12 items-center justify-center rounded-lg bg-red-600 text-xl font-bold text-white">
            +
          </span>
        </div>
      </div>
    </article>
  );
}
