# GitHub Setup Instructions

**Current canonical repository:** https://github.com/Parris-Tech-Services/WhirringWilderness

**Verified live game (25 October 2026):** https://parris-tech-services.github.io/WhirringWilderness/

Historical deployment links under `joshuaparris-max.github.io` and `joshualparris.github.io` currently return HTTP 404; do not use them for release verification.

**Safety:** These commands are for initial setup only. If a local checkout already has an `origin` remote, inspect `git remote -v` before changing it. Do not force-push or overwrite work.


## Repository
**URL:** https://github.com/Parris-Tech-Services/WhirringWilderness

## Step 1: Connect Local Repository to GitHub

The repository already exists on GitHub. Connect your local repository and push:

```bash
cd /Users/joshualukeparris/Desktop/WhirringWilderness

# Add the remote repository
git remote add origin https://github.com/Parris-Tech-Services/WhirringWilderness.git

# Ensure you're on the main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

If you get an error that the remote already exists, remove it first:
```bash
git remote remove origin
git remote add origin https://github.com/Parris-Tech-Services/WhirringWilderness.git
git push -u origin main
```

## Step 2: Verify

1. Go to https://github.com/Parris-Tech-Services/WhirringWilderness
2. You should see all your files
3. The commit message should show: "Initial commit: Whispering Wilds vertical slice"

## Alternative: Using SSH (if you have SSH keys set up)

If you prefer using SSH instead of HTTPS:

```bash
git remote remove origin
git remote add origin git@github.com:Parris-Tech-Services/WhirringWilderness.git
git push -u origin main
```

## Troubleshooting

### If you get authentication errors:
- Use a Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### If remote already exists:
```bash
git remote remove origin
# Then add it again with the correct URL
```

