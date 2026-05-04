import type { Metadata } from "next";
import { ShopPageClient } from "./ShopPageClient";

export const metadata: Metadata = {
  title: "Shop - Materials",
  description: "Natural stone materials, slabs, and samples available from Cloud Stone Studio.",
};

export default function ShopPage() {
  return <ShopPageClient />;
}
