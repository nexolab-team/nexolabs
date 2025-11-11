# Team Member Avatars

This directory contains profile pictures for team members displayed on the About page.

## Adding Your Profile Picture

1. **Add your image file** to this directory (`/public/assets/avatars/`)
   
2. **Supported formats:**
   - `.webp` (recommended for best quality/size)
   - `.jpg` / `.jpeg`
   - `.png`
   - `.svg`
   - `.gif`

3. **Recommended specifications:**
   - Size: 400x400px (square)
   - Format: WebP or PNG for best quality
   - Max file size: 500KB

4. **Update the About page:**
   - Open: `/src/pages/about.astro`
   - Find your member card section
   - Update the `src` attribute:
   ```html
   <img 
     src="/assets/avatars/YOUR_USERNAME.webp"
     alt="YOUR_USERNAME" 
     class="avatar-image"
   />
   ```

## Examples

```
/public/assets/avatars/
├── havoc.webp          ← Founder
├── member2.webp        ← Co-Founder
├── member3.webp        ← Core Member
├── john-doe.jpg        ← New member (example)
└── README.md           ← This file
```

## Tips

- Use consistent naming (lowercase, hyphens instead of spaces)
- Keep file sizes small for faster loading
- Square images work best (1:1 aspect ratio)
- WebP format offers the best compression

## Need Help?

Edit positions in `/src/pages/about.astro`:
- Founder & Team Lead
- Co-Founder
- Core Member
- Security Researcher
- Developer
- Or any custom position!
