# Riva Collections storefront design guidelines

Riva is a general store for practical finds across home, gadgets, beauty, and wellness. Use real product imagery and plain language. Give shoppers a clear next action on every screen.

## Color and typography

| Role | Value | Use |
| --- | --- | --- |
| Ivory | `#FCF8F2` | Default canvas and text on plum |
| Sand | `#F0E6DC` | Hero and alternate section backgrounds |
| Ink | `#282027` | Body text and the inverse footer |
| Plum | `#4E2948` | Primary buttons, links, and emphasis |
| Berry | `#763D59` | Secondary accent |

Manage scheme colors in Shopify Theme settings. Shared theme styles should read the existing color variables. Use the Georgia display stack for editorial headlines and page titles. Keep the configured Shopify body font for navigation, forms, prices, and product metadata. Hero headlines scale from 40 to 88px, and primary page titles start at 32px. Body copy should generally start at 16px on new sections.

## Composition and commerce

- Use the theme's `.page-width` container and space major sections in multiples of 8px. Use 16px mobile grid gaps and 24px desktop grid gaps for editorial cards.
- Use the homepage's split hero at 750px and above. Stack the copy above the image on smaller screens. Keep the featured finds grid at two columns on phones and switch to four at 990px.
- Prefer a 5:4 hero image area and square featured-find cards. Use Shopify's responsive image filters. Preserve the full product silhouette in editorial image slots.
- Give primary actions concrete labels such as “Shop all products” or the product name. Keep links underlined when their purpose needs visual emphasis.
- Use 44px touch targets for primary navigation controls and visible focus rings. Confirm 4.5:1 contrast for normal text and 3:1 for large text. Keep product price, availability, and purchase controls easy to scan.

## Surfaces

Buttons, badges and quantity selectors are pills. Cards and media use 16px corners, feature panels 24–32px. Theme settings hold these radii, so change them in Theme settings rather than in CSS. Cards sit on Sand with a soft shadow and lift on hover. The header, dropdowns, predictive search and sticky add-to-cart bar use warm glass: the scheme background at high opacity with a backdrop blur.

## Homepage sections

| Section | File | Purpose |
| --- | --- | --- |
| Riva editorial hero | `sections/riva-editorial-hero.liquid` | Headline, primary action, store promises and the featured product with its live price |
| Riva store promises | `sections/riva-promise.liquid` | Up to four promises (shipping, COD, returns, offers). Use only claims the store already makes |
| Riva featured finds | `sections/riva-shop-edits.liquid` | Up to eight category or product cards |
| Riva product story | `sections/riva-product-story.liquid` | Scroll story for one product: intended use, details, then price and the purchase link |

## Motion

| Effect | Timing and distance | Where to use it |
| --- | --- | --- |
| Button press | 160ms, 2% scale | All theme buttons |
| Directional arrow | 160ms, 0.25em shift | Editorial links and featured-find arrows on hover |
| Card hover | 420ms lift of 4px, image zoom up to 6% over 700ms | Product, collection and featured-find cards on fine pointers |
| Pointer spotlight and magnetic pull | Follows the pointer; magnetic pull of up to 6px | Featured-find cards; hero and story buttons (`.riva-magnetic`) |
| Hero entrance | Headline rises word by word over 900ms with a 60ms stagger; copy follows at 480ms | Homepage hero. The image paints at rest |
| Price chip | 700ms rise, then two slow 6px floats | Hero product price. Pauses on hover and focus |
| Scroll reveal | 800ms fade and 32px rise, 80ms stagger | `[data-riva-reveal]` elements and Shrine's load animations |
| Scroll-linked drift | Tied to scroll position | Hero image and glow as the hero exits; image-with-text media settling in |
| Product story | ScrollTrigger: active step at the viewport centre, 600ms image crossfade, scrubbed progress rail | Desktop (990px and up) only |
| Page transition | 180ms fade out, 320ms fade in | Same-origin storefront navigation. Checkout does not opt in |
| Scroll progress | 3px bar tied to page scroll | Every template except home and cart |
| Cart count | 560ms pop | When the cart count changes |

Use the easing and timing variables in `assets/riva-storefront.css`. Animate transforms, `translate`, `scale` and opacity, and give each property one owner: CSS for hover, press and entrances, GSAP only for the product story. Shrine's load animation transitions every element marked `.animate-item`, so put hover effects on an inner element rather than on the animated item.

`assets/riva-motion.js` holds the reveals, pointer effects, cart feedback and product story, and it handles theme editor section events. An inline script at the top of `layout/theme.liquid` adds `.riva-motion` before first paint and removes it if the motion script has not started within three seconds. The page-transition opt-in sits in the same place, because app markup in the head can make browsers close `<head>` early. GSAP (`assets/riva-gsap.min.js`, `assets/riva-scrolltrigger.min.js`) loads only when a product story is near the viewport on a wide screen with motion allowed.

Put new effects behind `prefers-reduced-motion: no-preference`, and keep keyboard-focused content at rest. Reduced motion shows every element at rest, and the product story becomes a static grid. Avoid movement during checkout or form completion apart from brief action feedback. Keep `scroll-behavior` off while ScrollTrigger is active; smooth scrolling skews its measurements.

## Review before publishing

Preview the homepage, a product, a collection, search, and cart at 360px, 768px, and desktop widths. Check a long product title, a missing image, and sold-out and sale states. Navigate by keyboard, enable reduced motion, and check that menus, product variants, cart actions, and links still work in Shopify’s preview. On the homepage, scroll through the product story in both directions and confirm the image and step number match the step in the middle of the screen.
