# Deployment Guide

## GitHub Pages Setup

To enable automated deployment to GitHub Pages, follow these steps:

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 2. Repository Permissions

Ensure your repository has the following permissions:

- **Actions**: Read and write permissions
- **Pages**: Write permissions
- **Contents**: Read permissions

To check/update permissions:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Save

### 3. Push to Deploy

Once GitHub Pages is enabled:

1. Push your changes to the `main` branch
2. The GitHub Actions workflow will automatically:
   - Install dependencies
   - Run type checking and linting
   - Build the application
   - Deploy to GitHub Pages

### 4. Access Your Deployed App

Your app will be available at:

```
https://yourusername.github.io/calendar/
```

Replace `yourusername` with your actual GitHub username.

### 5. Troubleshooting

If deployment fails:

1. **"Pages not enabled" error**:
   - Ensure GitHub Pages is enabled in repository settings
   - Source must be set to "GitHub Actions"

2. **Permission errors**:
   - Check Actions permissions in repository settings
   - Ensure workflow has write permissions

3. **Build failures**:
   - Check the Actions tab for detailed error logs
   - Ensure all dependencies are properly installed

### 6. Local Testing

To test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the built application at `http://localhost:4173`

## Environment Variables

For production deployment, you may need to set environment variables:

1. Create repository secrets in **Settings** → **Secrets and variables** → **Actions**
2. Add any required environment variables
3. Reference them in the workflow file if needed

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain name
2. Configure DNS settings with your domain provider
3. Update the `base` path in `vite.config.ts` if needed

---

**Note**: The first deployment may take a few minutes to propagate. Subsequent deployments are
typically faster.
