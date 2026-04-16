import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductCards from "@/components/ProductCards";
import EditorialLookbook from "@/components/EditorialLookbook";
import FeaturedCollection from "@/components/FeaturedCollection";
import DenimJourney from "@/components/DenimJourney";
import BrandStory from "@/components/BrandStory";
import SocialProof from "@/components/SocialProof";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getProducts } from "@/services/products";
import type { Product } from "@/lib/types";

export default async function Home() {
  let products: Product[] = [];
  try {
    const result = await getProducts({ pageSize: 6 });
    // Serialize Firestore Timestamps to plain objects for client components
    products = result.items.map((p) => ({
      ...p,
      created_at: JSON.parse(JSON.stringify(p.created_at)),
    }));
  } catch {
    products = [];
  }

  return (
    <>
      <main>
        <Hero />
        <Marquee />
        <ProductCards products={products} />
        <EditorialLookbook />
        <FeaturedCollection />
        <DenimJourney />
        <BrandStory />
        <SocialProof />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
