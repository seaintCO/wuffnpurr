import Stripe from 'stripe';
import dotenv from 'dotenv';
import { ensureStripeCatalog } from '../lib/stripeCatalog.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('\nMissing STRIPE_SECRET_KEY.\nCreate .env.local and add:\nSTRIPE_SECRET_KEY=sk_test_...\n');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { report } = await ensureStripeCatalog(stripe, {
  publicSiteUrl: process.env.PUBLIC_SITE_URL || ''
});

console.log('\nWoof N’ Purr Stripe catalog synced:\n');
for (const line of report) console.log('  ✓', line);
console.log('\nAll 9 products are ready in this Stripe mode.\n');
