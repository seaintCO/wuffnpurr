# Woof N’ Purr — GitHub + Vercel

Ready to push to GitHub main and deploy on Vercel.

## Stripe
In Vercel > Project > Settings > Environment Variables add:
STRIPE_SECRET_KEY=your Stripe secret key

Use a test key first. Replace with your live key when ready for real charges.
Never commit a real secret key to GitHub.

## Local
npm install
npm run dev
