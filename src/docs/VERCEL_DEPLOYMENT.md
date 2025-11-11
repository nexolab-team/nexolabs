# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nexolab-team/nexolabs)

## Manual Deployment Steps

### 1. Prerequisites
- Vercel account (free tier works perfectly)
- GitHub repository connected to Vercel

### 2. Deploy via Vercel Dashboard

1. **Import Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository: `nexolab-team/nexolabs`

2. **Configure Build Settings**
   - Framework Preset: **Astro**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables** (Optional)
   - No environment variables needed for basic deployment

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

### 3. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Configuration Files

### vercel.json
Already configured with:
- Build command
- Output directory
- Framework detection
- Route rewrites for SPA behavior

### astro.config.mjs
For Vercel deployment, the base path should be removed:

```javascript
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://your-domain.vercel.app', // Update with your Vercel domain
  // base: '/nexolabs', // Remove or comment out for Vercel
});
```

## Differences: GitHub Pages vs Vercel

| Feature | GitHub Pages | Vercel |
|---------|--------------|--------|
| Base Path | Required (`/nexolabs`) | Not needed |
| Custom Domain | Yes (with CNAME) | Yes (automatic SSL) |
| Build Time | 3-5 min | 1-2 min |
| CDN | GitHub CDN | Vercel Edge Network |
| Analytics | External only | Built-in (paid) |
| Functions | No | Yes (serverless) |

## Post-Deployment

### Update Links
If deploying to Vercel, you'll need to:

1. **Remove base path from astro.config.mjs**
   ```javascript
   // Comment out or remove
   // base: '/nexolabs',
   ```

2. **Custom Domain** (Optional)
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Performance
- Vercel automatically optimizes:
  - Static assets (images, CSS, JS)
  - Caching headers
  - Gzip/Brotli compression
  - Edge CDN distribution

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### 404 Errors
- Verify `vercel.json` has correct rewrites
- Check if base path is correctly configured

### Slow Builds
- Vercel has caching for `node_modules`
- First build: ~2 min
- Subsequent builds: ~1 min

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets a unique preview URL

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Astro on Vercel](https://docs.astro.build/en/guides/deploy/vercel/)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Made with ❤️ by NexoLabs Team**
