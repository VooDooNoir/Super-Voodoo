---
name: voodoo-frontend-deploy
description: Build and deploy Voodoo Agents frontend to 20i via FTP. Covers image compression for large agents/products, FTP timeout handling, and the reliable Node.js basic-ftp upload pattern.
tags: [frontend, ftp, deploy, 20i, image-compression, agents, products, voodoo, vite]
category: devops
---

# Voodoo Agents Frontend Build & Deploy

## Prerequisites

- Working directory: `/Users/jerry/Desktop/v.2.0/`
- 20i FTP: ftp.us.stackcp.com, user voodoo@voodooagents.com, pass voodoo123
- Node.js `basic-ftp` package (in frontend/node_modules)

## CRITICAL: Compress Large Images Before Deploy

### Agent Avatar Images (HIGH PRIORITY)
Raw agent avatars in `public/images/agents/` are 500-800KB each (~18MB total). These cause FTP timeouts and stale file handle errors.

```bash
# Compress all agent avatars to 256px max (80-96% smaller, ~3.3MB total)
agents_dir="/Users/jerry/Desktop/v.2.0/frontend/public/images/agents"
for f in "$agents_dir"/*.png; do
  sips -Z 256 --out "$f" "$f" 2>/dev/null
done
```

**Result:** 688KB → 132KB (81% smaller) average per avatar.

### Product Images
Product images in `public/images/products/` are 500-650KB each.

```bash
products_dir="/Users/jerry/Desktop/v.2.0/frontend/public/images/products"
for f in "$products_dir"/*.png "$products_dir"/*.jpg; do
  [ -f "$f" ] && sips -Z 512 --out "$f" "$f" 2>/dev/null
done
```

**Result:** 513KB → 363KB (30% smaller) average.

### Clean Up Hidden Files
FTP can fail on macOS hidden files (starting with `.!`):

```bash
# Remove hidden junk files from image directories
find /Users/jerry/Desktop/v.2.0/frontend/public/images/ -name '.!*' -delete
```

## Build Process

```bash
cd /Users/jerry/Desktop/v.2.0/frontend && rm -rf dist && npx vite build
```

Always clean `dist` first to avoid stale artifacts.

## Deploy via Node.js basic-ftp (RELIABLE)

The `deploy-voodoo-unified.cjs` script works sometimes but FTP timeouts are common. **This Node.js approach is more reliable:**

```bash
cd /Users/jerry/Desktop/v.2.0/frontend
node -e "
const ftp = require('basic-ftp');
(async () => {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: 'ftp.us.stackcp.com',
      user: 'voodoo@voodooagents.com',
      password: 'voodoo123',
      port: 21,
      secure: false,
    });
    console.log('Connected');
    await client.uploadFromDir('dist', '/');
    console.log('DONE');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    client.close();
  }
})();
"
```

**timeout=300** minimum — uploads take 2-3 minutes.

## Known Pitfalls

1. **Stale file handle (ENOENT stat)** — caused by hidden `.!NNNNN!filename` files or stale dist directories. Run `rm -rf dist/css` and `find .../images/ -name '.!*' -delete` before deploy.

2. **FTP timeout** — `deploy-voodoo-unified.cjs` times out on large files. Use the Node basic-ftp approach above which is more resilient.

3. **Tailwind v3/v4 mismatch** — CSS uses v4 syntax (@import "tailwindcss", @theme). Ensure Tailwind v4 is installed.

4. **Lucide-react removed social brand icons** (Twitter, Facebook, Instagram) in v1.x. Fix: `npm install lucide-react@0.477.0 --legacy-peer-deps`.

5. **Images not showing in production** — `/images/` directory content from `public/` is served statically by 20i. Verify images exist with `curl -sI https://voodooagents.com/images/agents/filename.png`. Relative image paths in the DB should work with Vite's public directory serving.

6. **403 Forbidden Errors (Hosting Config):**
  - **Package Type Mismatch:** If the 20i package is set to "NodeJS Full Access," the server will NOT serve static `index.html` files from the root. Switch the package type to "Linux" or "Static" for standard frontend deploys.
  - **Document Root Mismatch:** Subdomains often map to specific folders (e.g., `/app` or `/public_html/subdomain`). If root mirroring fails, verify the "Document Root" in 20i Dashboard -> Domains -> Manage.
  - **Permissions:** Always ensure `chmod 755` for directories and `chmod 644` for files.
  - **.htaccess:** A restrictive `.htaccess` file can block access. Try renaming it to `.htaccess.bak` to test.
