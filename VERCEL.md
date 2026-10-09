# Deploy Khawja on Vercel

The repository includes Vercel serverless handlers in `api/`, plus the Vite production frontend. Vercel does not use the local `npm start` server and cannot retain the local SQLite database between function invocations. Hosted checkout therefore uses Turso (libSQL).

## Required account steps

1. Sign in at https://vercel.com/new with the GitHub account that can access `hamxahameed2132/Khawja`.
2. Import `Khawja`, selecting the `main` branch and Vite framework. Build command: `npm run build`. Output directory: `dist`. Use Node.js 24.
3. Create a Turso database at https://turso.tech using your own account. Copy its database URL and create a database auth token. Keep the token secret.
4. In the Vercel project's Settings → Environment Variables, add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for the environments you plan to use. Enter the values there, not in chat or source files.
5. Deploy or redeploy after adding the variables. The orders table is initialized automatically on the first valid checkout.

You can deploy the menu before connecting Turso, but checkout will explicitly report that ordering is not configured and preserve the cart. This is not a working ordering deployment until the database is connected.

## Verify the hosted deployment

- Open the deployed site and `/api/health`. `orderingConfigured` must be true.
- Add two Krunch Burgers, select delivery, and place a test order. Total should be PKR 770.
- Download the receipt and confirm the record appears in Turso's orders table.
- Test pickup: no delivery fee should be charged.
- Do not assume local test results prove hosted connectivity. Verify the deployed site after adding credentials.

## Data

Local development still uses `var/orders.sqlite`; Vercel uses the separate Turso database. Local orders are not migrated automatically. `npm run export:orders` exports only the local database. Use Turso's authenticated dashboard/CLI for hosted database administration. There is no public order-list endpoint.

## Validation performed

The production build and nine integration tests passed, including the serverless handler with the libSQL local-file adapter, rejection of invalid requests, retry deduplication and missing-configuration behavior. An actual remote Turso database and Vercel deployment have not been provisioned or verified because authenticated account access is unavailable in this environment.
