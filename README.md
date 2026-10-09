# Khawja Fried Chicken

An independent, KFC-inspired food ordering web application. Includes a responsive menu, search, category filters, a persistent bucket, delivery/pickup selection, customer details, cash-payment checkout, server-side price validation, SQLite order storage, downloadable receipts and browser order history. Original SVG food illustrations are bundled locally; no external asset requests are needed.

## Requirements

Node.js **24 or newer** and npm. The backend uses Node's built-in SQLite support. No API keys or paid services are needed to run locally.

## Start locally

```sh
npm ci
npm run build
npm start
```

Open the address reported by the server on your own machine (port 3000 by default). `npm start` serves both the production frontend and API. For development, use `npm run dev` to start the API on port 3000 and Vite on port 5173. Vite proxies `/api` to the backend; do not use `npm run preview` for checkout.

## Verify

```sh
npm run build
npm test
```

The automated integration suite uses a temporary database and tests menu/static serving, checkout totals, retry deduplication, pickup fees, rejected input and cross-origin requests. To verify manually: add two Krunch Burgers, choose delivery, fill in contact/address details, submit, and check the receipt total is PKR 770. Pickup total is PKR 620. Refresh and view My orders.

## Menu and order data

- `data/menu.json`: editable menu source, PKR prices, delivery fee and image paths. Rebuild and restart after editing.
- `data/menu.csv`: spreadsheet copy of the sample menu.
- `data/orders.example.json`: example data, not real customer orders.
- `var/orders.sqlite`: server database (created automatically, excluded from source downloads and Git).
- Download an individual JSON receipt after checkout or from My orders.
- Export all server orders securely with `npm run export:orders`. Output defaults to `var/orders-export.json`; an optional path may be passed after `--`. This file contains customer details: keep it private and never place it in `public/` or `dist/`.

Browser order history is limited to the latest 30 receipts and is specific to that browser. Server records persist independently. Customer data is not exposed through a public order-list endpoint.

## Deployment

This is a Node application, not a static-only website. Set `PORT` (default 3000), optional `HOST` (default 0.0.0.0), and `DB_PATH` to a writable, persistent disk location. Place it behind an HTTPS reverse proxy. Preserve the Host header so same-origin checkout requests are accepted. Back up the SQLite database using SQLite's supported backup tools; do not copy only the live database file while ignoring its WAL files.

An optional Dockerfile is included. Docker was not validated in this environment.

```sh
docker build -t khawja .
docker run --name khawja -p 3000:3000 -v khawja-data:/app/var khawja
```

## Handover limits

Menu items/prices are sample business data. Khawja is not affiliated with KFC and does not reproduce its official branding. Artwork is illustrated, not official product photography. Orders are actually recorded on the application's server, but restaurant fulfillment, SMS notifications, online payment processing, customer authentication and a staff administration interface are not integrated. Cash payment is a selected method; this app neither collects nor confirms payment. Before accepting public customer orders, configure the real restaurant's menu, delivery area, contact details, operating policies and fulfillment process, and add hosting-level rate limiting and operational monitoring. Public hosting and a domain are not supplied in this handover.
