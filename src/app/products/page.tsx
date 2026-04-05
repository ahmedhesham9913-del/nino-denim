import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Shop All | NINO JEANS",
  description: "Browse our full collection of premium denim — jeans for men, women, kids, and unisex styles.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
