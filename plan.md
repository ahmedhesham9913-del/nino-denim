The "Editorial Scroll-Reveal" Prompt for Claude Code
"I am building a high-end fashion hero section in Next.js 18 (App Router). I need to replicate a specific motion design where a moving model is the focal point, and products are revealed via scroll.

1. The Layout Structure:

Pinned Hero Container: Create a 100vh section that is pinned using GSAP ScrollTrigger.

Background (The Model): A full-screen video or next/image of a moving model. It should have a subtle parallax or scale-up effect as the user begins to scroll.

The Product Overlay: A set of product cards (image, name, price) that are initially hidden or off-screen.

2. Scroll-Triggered Animation (The 'Classy' Reveal):

Initial State: Only the model is moving. The heading ('The New Collection') is large and centered.

Phase 1 (Scroll 0-30%): As the user scrolls, the main heading should shrink and move to the top-left corner.

Phase 2 (Scroll 30-80%): A grid of 3 product cards should 'float' into the hero area from the bottom.

Animation: Use a staggered entrance. Each card should have a y: 100 to y: 0 motion with a filter: blur(10px) to blur(0px) transition.

Interaction: The model in the background should slightly dim or blur as the products come into focus to maintain visual hierarchy.

Phase 3 (Scroll 80-100%): A 'Shop All' button appears at the center-bottom with a 'glitch' or 'shimmer' reveal.

3. Technical Requirements:

Use GSAP with the @gsap/react hook. Ensure the timeline is linked to the scroll position (scrub: 1).

Use Tailwind CSS for the 'Editorial' look: Thin borders, Serif typography (Playfair Display), and generous letter spacing.

Leverage Next.js 18 Server Components to fetch product data, but pass it to a Client Component for the GSAP orchestration.

Implement Next.js 18 View Transitions for the product cards so they can morph into a 'Product Detail' view if clicked.

Please provide the HeroSection.tsx and ProductCard.tsx components with the GSAP timeline logic included."