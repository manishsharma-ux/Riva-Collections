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

## Motion

| Effect | Timing and distance | Where to use it |
| --- | --- | --- |
| Button press | 160ms, 2% scale | Primary shopping actions |
| Directional arrow | 160ms, 0.25em shift | Editorial links on hover |
| Image hover | 320ms, up to 4.5% zoom | Featured-find cards on fine pointers |
| Hero entrance | 480ms, 8px rise, up to 120ms stagger | Homepage headline and supporting copy |
| Scroll reveal | Entry through the first 25% of the card’s cover range | Featured-find cards |

Use the easing and timing variables in `assets/riva-storefront.css`. Animate transforms and opacity, and keep the hero image still on initial paint. Scroll reveals should use CSS view timelines with a static fallback. Put new effects behind `prefers-reduced-motion: no-preference`, and keep keyboard-focused content at rest. Use motion once per entrance and avoid movement during checkout or form completion apart from brief action feedback.

## Review before publishing

Preview the homepage, a product, a collection, search, and cart at 360px, 768px, and desktop widths. Check a long product title, a missing image, and sold-out and sale states. Navigate by keyboard, enable reduced motion, and check that menus, product variants, cart actions, and links still work in Shopify’s preview.
