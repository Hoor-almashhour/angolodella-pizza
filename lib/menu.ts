import "server-only";

import { supabase } from "./supabase";
import { MENU_CATEGORIES, MENU_ITEMS } from "./menu-data";

export type LocalizedText = { ar: string; de: string };

export interface MenuCategory {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  image: string;
  featured: boolean;
  order: number;
}

export { t, formatPrice } from "./menu-utils";




export async function getMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order");

  if (error) throw error;

  return data;
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;

  return (data || []).map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: {
      ar: cat.name_ar,
      de: cat.name_de,
    },
    description: {
      ar: cat.description_ar || "",
      de: cat.description_de || "",
    },
    image: cat.image || "",
    order: cat.sort_order || 0,
  }));
}

export async function getItemsByCategory(
  categoryId: string
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order");

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    categoryId: item.category_id,
    name: {
      ar: item.name_ar,
      de: item.name_de,
    },
    description: {
      ar: item.description_ar || "",
      de: item.description_de || "",
    },
    price: item.price,
    image: item.image || "",
    featured: item.featured || false,
    order: item.sort_order || 0,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<MenuCategory | undefined> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    slug: data.slug,
    name: {
      ar: data.name_ar,
      de: data.name_de,
    },
    description: {
      ar: data.description_ar || "",
      de: data.description_de || "",
    },
    image: data.image || "",
    order: data.sort_order || 0,
  };
}
