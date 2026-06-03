"use client";

import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import type { MenuCategory } from "@/lib/menu-types";
import { t } from "@/lib/menu-utils";
import { useEffect, useRef } from "react";
interface CategoryTabsProps {
  categories: MenuCategory[];
  locale: string;
  activeSlug: string;
}

export function CategoryTabs({ categories, locale, activeSlug }: CategoryTabsProps) {

  const activeRef = useRef<HTMLAnchorElement | null>(null);

      useEffect(() => {
        activeRef.current?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }, [activeSlug]);


  return (
    <div className="relative  px-2">
      
    <div className="snap-x snap-mandatory 
      scroll-smooth
      scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-3 pt-2">
      {categories.map((cat) => {
        const isActive = cat.slug === activeSlug;
        return (
          <Link
              ref={isActive ? activeRef : null}
              key={cat.id}
              href={`/menu/${cat.slug}`}
              className={`
                snap-start
                flex w-[88px] shrink-0 flex-col
                overflow-hidden rounded-2xl border
                transition-all duration-300
                ${
                  isActive
                    ? "border-[#f5c518] bg-[#f5c518] scale-105 shadow-lg"
                    : "border-zinc-200 bg-white"
                }
              `}
            >

            <div className="relative h-16 w-full">
              <Image
                src={cat.image}
                alt={t(cat.name, locale)}
                fill
                className="object-cover"
                sizes="95px"
              />
            </div>
            <p
              className={`truncate px-1 py-2 text-center text-[11px] font-semibold ${
                isActive ? "text-black" : "text-zinc-800"
              }`}
            >
              {t(cat.name, locale)}
            </p>
          </Link>
        );
      })}
    </div>
    </div>
  );
}
