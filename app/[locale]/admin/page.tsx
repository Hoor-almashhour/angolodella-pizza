"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_de: string;
  description_ar: string | null;
  description_de: string | null;
  image: string | null;
  sort_order: number;
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameAr, setNameAr] = useState("");
  const [nameDe, setNameDe] = useState("");

  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionDe, setDescriptionDe] = useState("");

  const [file, setFile] = useState<File | null>(null);


  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/ar/login");
        return;
      }

      setAuthorized(true);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (error) {
        console.error(error);
        return;
      }

      setCategories(data || []);
    };

    if (authorized) {
      fetchCategories();
    }
}, [authorized]);

    

  const addCategory = async () => {
    if (!nameAr || !nameDe) {
      alert("يرجى إدخال الاسم العربي والألماني");
      return;
    }

    setLoading(true);

    let imageUrl = "";

    try {
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          alert("فشل رفع الصورة");
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const slug = nameDe
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const { error } = await supabase
        .from("categories")
        .insert([
          {
            slug,
            name_ar: nameAr,
            name_de: nameDe,
            description_ar: descriptionAr,
            description_de: descriptionDe,
            image: imageUrl,
            sort_order: 0,
          },
        ]);

      if (error) {
        console.error(error);
        alert(error.message);
        setLoading(false);
        return;
      }

      setNameAr("");
      setNameDe("");
      setDescriptionAr("");
      setDescriptionDe("");
      setFile(null);

      alert("تمت إضافة التصنيف بنجاح");

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإضافة");
    }

    setLoading(false);
  };


   return (
    <div className="flex items-center justify-center">
      <div className=" mx-4 mb-6 rounded-xl border bg-black/50 p-4 shadow w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">
        إضافة صنف جديد
      </h2>

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
        rows={3}
      />

      <textarea
        placeholder="German Description"
        value={descriptionDe}
        onChange={(e) => setDescriptionDe(e.target.value)}
        className="mb-3 w-full rounded border p-2"
        rows={3}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="mb-4 w-full"
      />

      <button
        onClick={addCategory}
        disabled={loading}
        className="rounded-lg bg-green-600 px-5 py-2 text-white disabled:opacity-50"
      >
        {loading ? "جاري الحفظ..." : "إضافة التصنيف"}
      </button>
    </div>
    </div>
  
  );

}