export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;

  price: number;
  description?: string;

  stock?: number | null;
  image?: string | null; // nanti bisa URL/base64 dari backend
  // fashion extras
  colors?: string[];
  sizes?: string[];
  longDescription?: string;

  // ✅ gallery + size chart
  images?: (string | null)[];
  sizeChartImage?: string | null;
  colorImages?: Record<string, string[]>;
  isActive: boolean;
};
