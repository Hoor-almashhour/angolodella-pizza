"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";


type Category = {
  id: string;
  name_ar: string;
  slug: string;
};

type MenuItem = {
  id: string;
  name_ar: string;
  price: number;
};

type AdminMenuItem = {
  id: string;
  category_id: string;
  name_ar: string;
  name_de: string;
  description_ar: string;
  description_de: string;
  image: string;
  price: number;
  featured: boolean;
  sort_order: number;
};

export default function AdminItemsPage() {

 const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
 const [categorySlug, setCategorySlug] = useState("");

  const [nameAr, setNameAr] = useState("");
  const [nameDe, setNameDe] = useState("");

  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionDe, setDescriptionDe] = useState("");

  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const categoryFromUrl =searchParams.get("category") || "";

  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categoryFromUrl);
   const [sortOrder, setSortOrder] = useState("0");

 const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name_ar");

  if (error) {
    console.error(error);
    return;
  }

  setCategories(data || []);
 };

  
 const fetchItems = async () => {
  if (!categoryId) return;

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order");

  if (error) {
    console.error(error);
    return;
  }

  setItems(data || []);
};

    useEffect(() => {
    const loadData = async () => {
        await fetchCategories();
        await fetchItems();
    };

    loadData();
    }, []);
   

  const saveItem = async () => {
    if (!nameAr || !nameDe || !categoryId) {
      alert("أكمل البيانات");
      return;
    }

    setLoading(true);

    let imageUrl = "";

    try {
      if (file) {
       const fileName =
         `${crypto.randomUUID()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(fileName, file);

        if (uploadError) {
          alert("فشل رفع الصورة");
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      if (editingId) {
        await supabase
          .from("menu_items")
          .update({
            category_id: categoryId,
            name_ar: nameAr,
            name_de: nameDe,
            description_ar: descriptionAr,
            description_de: descriptionDe,
            price: Number(price),
            sort_order: Number(sortOrder),
            ...(imageUrl && { image: imageUrl }),
            
          })
          .eq("id", editingId);

        alert("تم التعديل");
          
          router.push(`/menu/${categorySlug}`);
      } else {
        await supabase
          .from("menu_items")
          .insert([
            {
              category_id: categoryId,
              name_ar: nameAr,
              name_de: nameDe,
              description_ar: descriptionAr,
              description_de: descriptionDe,
              price: Number(price),
              image: imageUrl,
              featured: false,
              sort_order: Number(sortOrder),
            },
          ]);

        alert("تمت الإضافة");
         const { data: category } = await supabase
            .from("categories")
            .select("slug")
            .eq("id", categoryId)
            .single();

        if (category) {
            router.push(`/menu/${category.slug}`);
            return;
        }
         
      }

      clearForm();
      fetchItems();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    const confirmed = confirm("حذف الصنف؟");

    if (!confirmed) return;

    await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    fetchItems();
  };



const editItem = async (id: string) => {
  console.log("EDIT:", id);

  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return;

  setEditingId(data.id);
  setCategoryId(data.category_id);

  const { data: category } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", data.category_id)
    .single();

  if (category) {
    setCategorySlug(category.slug);
  }

  setNameAr(data.name_ar || "");
  setNameDe(data.name_de || "");

  setDescriptionAr(data.description_ar || "");
  setDescriptionDe(data.description_de || "");
  setPreview(data.image || "");
  setPrice(String(data.price || ""));
  setSortOrder(String(data.sort_order || 0));
};

    const editId = searchParams.get("edit");

        useEffect(() => {
        if (!editId) return;

        const loadItem = async () => {
            await editItem(editId);
        };

        loadItem();
     }, [editId]);


  const clearForm = () => {
    setEditingId(null);

    setCategoryId("");

    setNameAr("");
    setNameDe("");

    setDescriptionAr("");
    setDescriptionDe("");

    setPrice("");
    setSortOrder("0");
    setPreview("");
    setFile(null);
  };

  return (
    <div className="mx-auto max-w-5xl p-4">

      <div className="rounded-xl border bg-black/50 p-4">

        <h2 className="mb-4 text-2xl font-bold">
          {editingId ? "تعديل صنف" : "إضافة صنف"}
        </h2>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mb-3 w-full rounded border p-2 bg-black/50 text-white"
        >
          <option value="" className="">اختر التصنيف</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_ar}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="الاسم العربي"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        />

        <input
          type="text"
          placeholder="German Name"
          value={nameDe}
          onChange={(e) => setNameDe(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        />

        <textarea
          placeholder="الوصف العربي"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        />

        <textarea
          placeholder="German Description"
          value={descriptionDe}
          onChange={(e) => setDescriptionDe(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        />

        <input
          type="number"
          placeholder="السعر"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        />
        <input
                type="number"
                placeholder="ترتيب الصنف"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mb-3 w-full rounded border p-2"
                />
        <input
            type="file"
            accept="image/*"
            onChange={(e) => {
                const selectedFile = e.target.files?.[0];

                if (!selectedFile) return;

                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
            }}
          className="mb-4 w-full"
        />  
            {preview && (
        <img
            src={preview}
            alt="Preview"
            className="mb-4 h-40 w-full rounded-lg object-cover border"
        />
        )}
                <button
          onClick={saveItem}
          disabled={loading}
          className="rounded bg-green-600 px-6 py-2 text-white"
        >
          {editingId ? "حفظ التعديل" : "إضافة الصنف"}
        </button>
      </div>

    </div>
  );
}