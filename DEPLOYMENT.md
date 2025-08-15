# Deployment Guide for Multi-Device Play

This guide will help you deploy your Guess The Jam game so it can be played on multiple devices from anywhere.

## Current Issue

Your game currently runs locally, which means:

- Only accessible on the same WiFi network
- Can't be played from different devices/locations
- WebSocket server is bound to localhost

## Solution

Deploy both components to the cloud:

1. **WebSocket Server** - Deploy to Railway/Render/DigitalOcean
2. **Next.js Frontend** - Deploy to Vercel

## Step 1: Deploy WebSocket Server

### Option A: Railway (Recommended - Free tier available)

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Connect your GitHub repository
4. Set environment variables:
   ```
   NODE_ENV=production
   WEBSOCKET_HOST=0.0.0.0
   WEBSOCKET_PORT=3001
   ```
5. Railway will automatically detect the Dockerfile.websocket and deploy
6. Note the generated URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com) and sign up
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `pnpm install && pnpm build:websocket`
5. Set start command: `pnpm start:websocket`
6. Set environment variables as above

## Step 2: Update Frontend Configuration

Once your WebSocket server is deployed, update your environment variables:

1. Create `.env.local` file:

   ```bash
   NEXT_PUBLIC_WEBSOCKET_URL=wss://your-app.railway.app
   ```

2. For Vercel deployment, add this environment variable in your Vercel dashboard

## Step 3: Deploy to Vercel

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Deploy:

   ```bash
   vercel --prod
   ```

3. Or connect your GitHub repo to Vercel for automatic deployments

## Step 4: Test Multi-Device Play

1. Open your Vercel URL on one device
2. Create a private room
3. Open the same URL on another device (or share the link)
4. Join the room using the room ID
5. Both devices should now be able to play together!

## Environment Variables Reference

### WebSocket Server

- `NODE_ENV`: Set to "production"
- `WEBSOCKET_HOST`: Set to "0.0.0.0" to listen on all interfaces
- `WEBSOCKET_PORT`: Port number (usually 3001)

### Frontend

- `NEXT_PUBLIC_WEBSOCKET_URL`: Full WebSocket URL (wss://your-domain.com)

## Troubleshooting

### WebSocket Connection Issues

- Ensure your WebSocket server is accessible from the internet
- Check that the URL in your frontend matches the deployed server
- Verify environment variables are set correctly

### CORS Issues

- The WebSocket server should handle connections from any origin in production
- If you encounter CORS issues, check your server configuration

## Cost

- **Railway**: Free tier available, then $5/month
- **Render**: Free tier available, then $7/month
- **Vercel**: Free tier available, then $20/month
- **Total**: Can be completely free for small usage!

## Next Steps

After deployment, you can:

- Share your game with friends worldwide
- Play on any device with internet access
- Scale up as needed with paid plans
