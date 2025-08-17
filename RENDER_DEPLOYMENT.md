# Deploying to Render

This guide will help you deploy your Guess The Jam application to Render.

## Prerequisites

1. A Render account (free at [render.com](https://render.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. Make sure your code is committed and pushed to your Git repository
2. Ensure you have a `render.yaml` file in your root directory (already created)

## Step 2: Deploy to Render

### Option 1: Connect Git Repository (Recommended)

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Render will automatically detect it's a Next.js app
5. Configure the service:
   - **Name**: `guess-the-jam` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Free (or choose a paid plan if needed)

### Option 2: Manual Deployment

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Choose "Build and deploy from a Git repository"
4. Select your repository
5. Render will use the `render.yaml` configuration automatically

## Step 3: Environment Variables

If you need to set environment variables:

1. Go to your service dashboard on Render
2. Navigate to "Environment" tab
3. Add any required environment variables

## Step 4: Deployment

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The first build may take 5-10 minutes
4. You'll get a URL like: `https://your-app-name.onrender.com`

## Step 5: Custom Domain (Optional)

1. Go to your service dashboard
2. Navigate to "Settings" → "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

## Features

- **Auto-deploy**: Automatically deploys when you push to your main branch
- **Free tier**: Available for development and small projects
- **Custom domains**: Support for custom domains
- **SSL**: Automatic HTTPS certificates
- **Global CDN**: Fast loading worldwide

## Troubleshooting

### Build Issues
- Check the build logs in your Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Runtime Issues
- Check the runtime logs in your Render dashboard
- Ensure your start command is correct
- Verify environment variables are set correctly

## Cost

- **Free tier**: $0/month (with limitations)
- **Paid plans**: Starting at $7/month for more resources

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)
