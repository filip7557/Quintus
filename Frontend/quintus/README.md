This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Mobile navigation

At widths of 992px and below, the hamburger opens a full-screen, scrollable
navigation menu. The page behind it cannot scroll. Use the close button or
Escape to dismiss it; choosing a link (including an account link) also closes
the menu. The Račun section expands inline without a height cap, so all permitted
account links remain reachable. Desktop navigation keeps its dropdown layout.

## Homepage cards

Service cards follow the certificate cards' portrait layout, dark image overlay,
dark theme and blue action styling. Service titles are anchored at the card's
vertical midpoint, with descriptions, keywords, and actions below them.
Both grids use four columns above
900px, two columns through 900px, and one column through 600px. Additional
services wrap into new rows. Incomplete desktop service rows are centered while
keeping the same card width as a full four-card row in multi-row layouts.
Single-row desktop sections have more heading/subtitle spacing and no forced
viewport-height whitespace. Three cards fill the row; one or two cards are
enlarged up to 420px and centered. Exactly six services use
two centered rows of three instead of four plus two. Descriptions and keywords
are shortened on cards, with the full service content available on the detail page.
Keywords appear as blue pill-shaped tags, visually separate from the description.
Service-card images load eagerly when visible or within 160px of the viewport;
off-screen cards remain lazy-loaded. Hero and service-detail featured images
retain their priority loading.
Visible service galleries rotate together. After each synchronized fade they
remain visible for 4.5 seconds, then prepare the next images in order. All active
cards retain their previous images until every next image is ready, then fade
together. Off-screen cards and cards undergoing image removal do not hold up the
group; failed images are logged and skipped.
Run the shared rotation timing tests from the frontend directory with
`node --test src/lib/serviceRotation.test.mjs`.
Service editing drafts (including newly selected images) persist through card
rotation and background re-renders. Closing and reopening the editor starts a
fresh draft; preview URLs are released when discarded or the editor unmounts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
