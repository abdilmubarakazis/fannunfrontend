import type { Category, Product } from "./types";

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug) ?? null;
}

export const categories: Category[] = [
  { id: 1, name: "Fashion", slug: "fashion" },
  { id: 2, name: "Elektronik", slug: "elektronik" },
  { id: 3, name: "Rumah", slug: "rumah" },
];

export const products: Product[] = [
  {
    id: 1,
    categoryId: 2,
    name: "Headphone Wireless",
    slug: "headphone-wireless",
    description: "Suara jernih, baterai awet, nyaman dipakai.",
    price: 299000,
    stock: 15,
    image: "/products/headphone.jpeg",
    isActive: true,
  },
  {
    id: 2,
    categoryId: 1,
    name: "Kaos Oversize",
    slug: "kaos-oversize",
    description: "Bahan adem, cutting modern.",
    price: 129000,
    stock: 32,
    image: "/products/kaos/1.jpg",
    isActive: true,

    // ✅ fashion extras
    colors: ["Cream", "Putih", "Hitam", "Navy"],
    sizes: ["M", "L", "XL", "2XL"],
    longDescription:
      "Bahan: cotton combed 30s...\nCutting: oversize fit...\nPerawatan: cuci terbalik...",

    // ✅ multi foto (default gallery)
    images: [
      "/products/kaos/1.jpg",
      "/products/kaos/2.jpg",
      "/products/kaos/3.jpg",
      "/products/kaos/4.jpg",
    ],

    // ✅ foto per warna (untuk ganti gallery saat pilih warna)
    colorImages: {
      Cream: ["/products/kaos/cream/1.jpg", "/products/kaos/cream/2.jpg"],
      Putih: ["/products/kaos/putih/1.jpg", "/products/kaos/putih/2.jpg"],
      Hitam: ["/products/kaos/hitam/1.jpg", "/products/kaos/hitam/2.jpg"],
      Navy: ["/products/kaos/navy/1.jpg", "/products/kaos/navy/2.jpg"],
    },

    // ✅ gambar tabel ukuran (popup)
    sizeChartImage: "/size-chart/kaos-oversize.jpg",
  },
  {
    id: 3,
    categoryId: 3,
    name: "Lampu Meja Minimalis",
    slug: "lampu-meja-minimalis",
    description: "Cocok untuk meja kerja dan kamar.",
    price: 189000,
    stock: 8,
    image: null,
    isActive: true,
  },
  {
    id: 4,
    categoryId: 2,
    name: "Mouse Gaming",
    slug: "mouse-gaming",
    description: "Sensor presisi, grip enak.",
    price: 159000,
    stock: 0,
    image: null,
    isActive: true,
  },
];
