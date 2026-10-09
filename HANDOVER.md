# Run your website

1. Install Node.js 24 or newer.
2. Extract the ZIP and open a terminal inside `khawja-site`.
3. Run:

```sh
npm ci
npm run build
npm start
```

4. Open `http://localhost:3000` on your own computer. Keep the terminal running.

## Included

- Responsive desktop and mobile pages, original local food illustrations
- Menu categories and search
- Persistent bucket with quantity controls
- Delivery and pickup with correct delivery charges
- Validated checkout with customer contact and address
- SQLite order database, duplicate submission protection
- Order receipt download and browser order history
- Sample menu JSON/CSV, sample order JSON
- Production build, source code, integration tests, deployment instructions

## Edit business data

Menu names and prices are in `data/menu.json`; replace the sample values, then rebuild and restart. Food SVGs are in `public/images`. Delivery fee is in the menu's `deliveryFee` field. Server orders are stored in `var/orders.sqlite` after you start accepting submissions.

Export orders: `npm run export:orders`. Keep the output private because it contains customer details.

## Delivery status

The app runs locally and records orders on its server. It is an independent Khawja application inspired by KFC's visual style, not an exact official KFC replica. Artwork and prices are samples. Public hosting, restaurant fulfillment, SMS, online payments, accounts and a staff dashboard are not connected. Cash payment selection does not confirm that cash was collected. The included Docker deployment recipe has not been tested here.

Vercel-specific deployment instructions are in VERCEL.md. Do not upload this to static-only hosting: checkout requires the Node server and a persistent disk. See README.md for hosting and database details.
