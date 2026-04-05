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

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Marquee />
        <ProductCards />
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
