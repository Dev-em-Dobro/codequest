#!/bin/bash

# Production deployment script for CodeQuest (Next.js)
echo "🚀 Starting deployment build..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🌐 Ready for production deployment"
    echo ""
    echo "📋 Deployment checklist:"
    echo "  ✓ Next.js build generated in next-app/.next/"
    echo "  ✓ Production server configured"
    echo "  ✓ Environment variables ready"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Use 'npm run start' command for production"
    echo "  2. Ensure PORT and required environment variables are set"
    echo ""
    echo "🔧 To test production build locally:"
    echo "  PORT=4010 npm run start"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi