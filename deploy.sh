#!/bin/bash

# AVPG Press Brief Automation Architecture - Deployment Script
# This script automates the production deployment to Vercel.

echo "🚀 Starting Deployment Sequence for AVPG Intelligence Workspace..."

# 1. Run local type checks to ensure zero-defect build
echo "🔍 Running Type Safety Audit..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Type Safety Audit Passed."
else
    echo "❌ Type Safety Audit Failed. Aborting deployment."
    exit 1
fi

# 2. Trigger Vercel Production Deployment
echo "📦 Dispatching build to Vercel Production Edge..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment Successful! The system is live."
else
    echo "⚠️ Deployment encountered an error."
    exit 1
fi
