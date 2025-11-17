#!/bin/bash

echo "🚀 Hospital Management System - Quick Deploy"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Hospital Management System - Ready for client review" || echo "⚠️  No changes to commit"

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "⚠️  No GitHub remote found!"
    echo ""
    echo "Please create a repository on GitHub first, then run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/hospital-management-system.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    echo "Then go to https://vercel.com and deploy!"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main || {
    echo ""
    echo "⚠️  Push failed! Make sure:"
    echo "  1. You have a GitHub repository"
    echo "  2. You've set the remote: git remote add origin YOUR_REPO_URL"
    echo "  3. You're authenticated with GitHub"
    exit 1
}

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 Next steps:"
echo "  1. Go to https://vercel.com"
echo "  2. Sign up with GitHub"
echo "  3. Click 'Add New Project'"
echo "  4. Select this repository"
echo "  5. Click 'Deploy'"
echo ""
echo "Your app will be live in 2 minutes! 🎉"

