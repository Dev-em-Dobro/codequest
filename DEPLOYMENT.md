# Production Deployment Guide

## Fixed Issues

✅ **Build Command Updated**: Root `npm run build` now targets `next-app` (`next build`)
✅ **Production Server Ready**: Root `npm run start` now starts `next-app` (`next start`)
✅ **Environment Handling**: Production run is controlled by Next.js runtime
✅ **Build Output**: Next.js artifacts are generated in `next-app/.next/`

## Deployment Configuration Changes Needed

Since the `.replit` configuration file cannot be modified directly, you'll need to update the deployment settings through the Replit interface:

### Current Issue
```
run = ["sh", "-c", "npm run dev"]  // ❌ Development command
```

### Required Fix
```
run = ["sh", "-c", "npm run build && npm run start"]  // ✅ Production command
```

## How to Fix Deployment

### Option 1: Through Replit Deployments Interface
1. Go to your Replit project
2. Click on the "Deploy" button
3. In the deployment settings, change the run command from:
   - **FROM**: `npm run dev`
   - **TO**: `npm run build && npm run start`

### Option 2: Using the Deployment Configuration
If you have access to modify deployment settings:
1. Build command: `npm run build`
2. Start command: `npm run start`
3. Environment: Set `PORT` and required secrets

## Production Build Process

The application now properly:

1. **Builds Next app**: `npm run build` → Runs `next build` inside `next-app`
2. **Serves Production**: `npm run start` → Runs `next start` inside `next-app`
3. **Single Runtime**: All root commands now target the Next.js application in `next-app`

## Environment Variables

Ensure these are set in your deployment environment:
- `PORT=5000` (or your preferred port)
- All Firebase/database credentials
- Any API keys your app requires

## Testing Production Build Locally

Run the deployment script:
```bash
./deploy.sh
```

Or manually:
```bash
npm run build
PORT=5000 npm run start
```

## Verification

Your app should now:
- ✅ Use production optimized builds  
- ✅ Serve Next.js app and API routes from the same runtime
- ✅ Handle proper environment detection
- ✅ Be ready for production deployment

The deployment failure should be resolved once you update the run command through the Replit deployment interface.