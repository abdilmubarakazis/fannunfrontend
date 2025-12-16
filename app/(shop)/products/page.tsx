import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ProductsClient />
    </Suspense>
  );
}
