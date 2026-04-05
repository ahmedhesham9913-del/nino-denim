export interface Product {
  id: number;
  name: string;
  category: "Men" | "Women" | "Kids" | "Unisex";
  style: string;
  price: number;
  originalPrice: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  tag?: "New" | "Sale" | "Bestseller" | "Limited" | "Trending";
  image: string;
  rating: number;
  reviews: number;
}

const images = [
  "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/17745134/pexels-photo-17745134.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/6786614/pexels-photo-6786614.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/17630811/pexels-photo-17630811.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80",
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80",
  "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
  "https://images.pexels.com/photos/18591712/pexels-photo-18591712.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/8991032/pexels-photo-8991032.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
  "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
];

const styles = [
  "Slim Fit",
  "Straight",
  "Skinny",
  "Relaxed",
  "Wide Leg",
  "Tapered",
  "Bootcut",
  "Cargo",
  "Flare",
  "High Rise",
  "Mom Fit",
  "Dad Fit",
];

const colorOptions = [
  { name: "Indigo", hex: "#2563eb" },
  { name: "Dark Wash", hex: "#1e293b" },
  { name: "Stone", hex: "#78716c" },
  { name: "Black", hex: "#1c1917" },
  { name: "Light Wash", hex: "#93c5fd" },
  { name: "White", hex: "#f5f5f4" },
  { name: "Grey", hex: "#6b7280" },
  { name: "Olive", hex: "#4d7c0f" },
];

const nameAdjectives = [
  "Classic", "Modern", "Heritage", "Essential", "Premium", "Urban",
  "Vintage", "Studio", "Weekend", "Signature", "Raw", "Washed",
  "Original", "Artisan", "Street", "Coastal", "Alpine", "Eclipse",
];

const tags: (Product["tag"] | undefined)[] = [
  "New", "Sale", "Bestseller", "Limited", "Trending",
  undefined, undefined, undefined, undefined, undefined,
];

const categories: Product["category"][] = ["Men", "Women", "Kids", "Unisex"];

const menSizes = ["28", "30", "32", "34", "36", "38"];
const womenSizes = ["24", "26", "28", "30", "32", "34"];
const kidsSizes = ["XS", "S", "M", "L", "XL"];
const unisexSizes = ["XS", "S", "M", "L", "XL", "XXL"];

function getSizes(category: Product["category"]) {
  switch (category) {
    case "Men": return menSizes;
    case "Women": return womenSizes;
    case "Kids": return kidsSizes;
    case "Unisex": return unisexSizes;
  }
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => seededRandom(seed + arr.indexOf(a)) - seededRandom(seed + arr.indexOf(b)));
  return shuffled.slice(0, n);
}

export const products: Product[] = Array.from({ length: 52 }, (_, i) => {
  const id = i + 1;
  const s = id * 7;
  const category = categories[i % 4];
  const style = pick(styles, s + 1);
  const adj = pick(nameAdjectives, s + 2);
  const basePrice = 49 + Math.floor(seededRandom(s + 3) * 110);
  const discount = seededRandom(s + 4) > 0.5 ? Math.floor(basePrice * (0.15 + seededRandom(s + 5) * 0.25)) : 0;
  const numColors = 2 + Math.floor(seededRandom(s + 6) * 3);
  const colors = pickN(colorOptions, numColors, s + 7);

  return {
    id,
    name: `${adj} ${style}`,
    category,
    style,
    price: basePrice - discount,
    originalPrice: basePrice,
    colors,
    sizes: getSizes(category),
    tag: pick(tags, s + 8),
    image: images[i % images.length],
    rating: 3.8 + seededRandom(s + 9) * 1.2,
    reviews: 5 + Math.floor(seededRandom(s + 10) * 280),
  };
});

export const allStyles = [...new Set(products.map((p) => p.style))].sort();
export const allColors = colorOptions;
export const priceRange = {
  min: Math.min(...products.map((p) => p.price)),
  max: Math.max(...products.map((p) => p.originalPrice)),
};
