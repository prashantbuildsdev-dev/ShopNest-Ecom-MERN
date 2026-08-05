# ShopNest

ShopNest is a MERN e-commerce application with customer accounts, a shopping cart, Razorpay checkout, product management, order tracking, and an admin dashboard.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and fill in at least `MONGO_URI` and a long random `JWT_SECRET`.
2. Install dependencies with `npm.cmd run setup` on Windows, or `npm run setup` elsewhere.
3. Start the app with `npm.cmd run dev` on Windows, or `npm run dev` elsewhere.
4. Open `http://localhost:5173`.

The backend runs on port 5000. Vite proxies `/api` and `/uploads` requests during development.

## Environment variables

Required:

- `MONGO_URI` – MongoDB / Atlas connection string.
- `JWT_SECRET` – a long, private random value.

For production image uploads, set all Cloudinary variables. Local uploads are suitable only for development because most hosts use ephemeral storage.

Razorpay remains disabled until both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are provided. The app will show a clear configuration message instead of accepting an unpaid order.

## Deploy as one Node service

The Express server serves the Vite build when `NODE_ENV=production`.

- Build command: `npm run render-build`
- Start command: `npm start`
- Set `NODE_ENV=production` and add the required environment variables in your host dashboard.

Set `FRONTEND_URL` only when the frontend is hosted separately. Do not commit `backend/.env` or payment credentials.
