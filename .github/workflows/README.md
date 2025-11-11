# GitHub Actions Workflows

This directory contains automated CI/CD workflows for NexoLabs.

## 📁 Workflow Files

### `deploy.yml` - Deployment Pipeline
**Purpose**: Automatically deploy to GitHub Pages

**When it runs:**
- ✅ Push to `main` branch
- ✅ Manual trigger via Actions tab
- 🔍 Pull requests (build only, no deploy)

**What it does:**
1. Checks out code
2. Installs Node.js 20 with npm caching
3. Installs dependencies
4. Builds Astro site
5. Uploads artifacts
6. Deploys to GitHub Pages

**Deployment time**: ~2-3 minutes

---

### `ci.yml` - Continuous Integration
**Purpose**: Quality checks and security audits

**When it runs:**
- ✅ Push to `main` or `develop`
- ✅ Pull requests to `main` or `develop`

**What it does:**
1. **Lint & Build Check**
   - Verifies Astro build succeeds
   - Reports build statistics
   
2. **Security Audit**
   - Runs `npm audit`
   - Checks for vulnerable dependencies
   - Reports security status

---

## 🎯 Workflow Status Badges

Add these to your README.md to show build status:

```markdown
![Deploy Status](https://github.com/YOUR-USERNAME/nexolabs/actions/workflows/deploy.yml/badge.svg)
![CI Status](https://github.com/YOUR-USERNAME/nexolabs/actions/workflows/ci.yml/badge.svg)
```

## ⚙️ Configuration

### Concurrency Control
Workflows use concurrency groups to prevent simultaneous deployments:
- Only one deployment runs at a time
- New deployments cancel pending ones

### Permissions
Minimal required permissions for security:
- `contents: read` - Read repository
- `pages: write` - Deploy to Pages
- `id-token: write` - OIDC token for deployment

### Caching
- npm packages cached automatically
- Speeds up builds by ~30-50%

## 🔧 Customization

### Change Deploy Branch
Edit `deploy.yml`:
```yaml
on:
  push:
    branches: [ production ]  # Change from 'main'
```

### Add More Checks
Edit `ci.yml` to add linting, testing, etc.:
```yaml
- name: Run ESLint
  run: npm run lint

- name: Run Tests
  run: npm test
```

### Custom Build Command
If you need environment variables or custom build:
```yaml
- name: Build Astro site
  run: npm run build
  env:
    PUBLIC_API_URL: ${{ secrets.API_URL }}
```

## 📊 Monitoring

View workflow runs:
1. Go to **Actions** tab in GitHub
2. Select a workflow to see all runs
3. Click a run to see detailed logs

## 🐛 Debugging

If a workflow fails:

1. **Check the logs**:
   - Actions tab → Failed workflow → Expand failed step

2. **Test locally**:
   ```bash
   npm ci  # Clean install
   npm run build
   ```

3. **Common issues**:
   - Missing dependencies in package.json
   - Build errors (fix in code)
   - Permission errors (check repo settings)

## 🚀 Manual Trigger

To manually deploy:
1. Actions tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow" button

## 📝 Workflow Syntax

GitHub Actions uses YAML. Key concepts:

- `on:` - When to run
- `jobs:` - What to run
- `steps:` - Individual tasks
- `uses:` - Pre-built actions
- `run:` - Shell commands

## 🔐 Security Best Practices

✅ **Implemented:**
- Minimal permissions (principle of least privilege)
- Dependency caching (faster, no repeated downloads)
- npm ci instead of npm install (reproducible builds)
- Security audits on every PR

🔒 **Recommendations:**
- Use Dependabot for automated dependency updates
- Enable branch protection on main
- Require CI checks before merge
- Review Actions logs regularly

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

**Made with ❤️ by NexoLabs Team**
