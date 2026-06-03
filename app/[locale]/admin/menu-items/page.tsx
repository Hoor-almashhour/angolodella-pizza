
import { Suspense } from "react";
import AdminItemsContent from "./AdminItemsContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminItemsContent />
    </Suspense>
  );
}