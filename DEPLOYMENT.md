# Deployment Guide for Multi-Device Play

This guide will help you deploy your Guess The Jam game so it can be played on multiple devices from anywhere.

## Current Issue

Your game currently runs locally, which means:

- Only accessible on the same WiFi network
- Can't be played from different devices/locations
- WebSocket server is bound to localhost

## Solution

Deploy your frontend to the cloud:

1. **Next.js Frontend** - Deploy to Vercel

## Step 1: Deploy Frontend to Vercel

### Vercel (Recommended - Free tier available)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Create a new project
3. Connect your GitHub repository
4. Vercel will automatically detect your Next.js app and deploy
5. Note the generated URL (e.g., `https://your-app.vercel.app`)

## Step 2: Environment Variables (Optional)

If you need to set any environment variables:

1. Create `.env.local` file for local development
2. For Vercel deployment, add environment variables in your Vercel dashboard

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

- **Vercel**: Free tier available, then $20/month
- **Total**: Can be completely free for small usage!

## Next Steps

After deployment, you can:

- Share your game with friends worldwide
- Play on any device with internet access
- Scale up as needed with paid plans
