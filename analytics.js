// Vercel Web Analytics
// This file initializes Vercel Analytics for the portfolio site

import { inject } from './node_modules/@vercel/analytics/dist/index.mjs';

// Initialize analytics
inject({
  mode: 'auto', // Automatically detect production vs development
});
