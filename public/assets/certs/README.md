# Certificates Directory

## 📜 Adding Your Certificates

Place your certificate images in this directory to display them on the Achievements page.

### Supported Formats
- ✅ **JPG/JPEG** - `.jpg`, `.jpeg`
- ✅ **PNG** - `.png`
- ✅ **WebP** - `.webp`
- ✅ **GIF** - `.gif`

### Naming Convention
Name your certificates as:
- `cert1.jpg` (or `.png`, `.webp`, etc.)
- `cert2.png`
- `cert3.jpeg`
- `cert4.webp`
- `cert5.jpg`

The system will automatically detect and display them with fallback support.

### Recommended Specifications
- **Resolution**: 1200x900px or higher
- **Format**: JPG for photos, PNG for graphics with text
- **File Size**: Keep under 500KB for optimal loading
- **Orientation**: Landscape preferred

### How to Update

1. **Add your certificate image** to this folder (`/public/assets/certs/`)
2. **Edit** `src/pages/achievements.astro`
3. **Update** the corresponding certificate entry:

```html
<div class="cert-card-img" data-cert="/assets/certs/your-cert.jpg">
  <img src="/assets/certs/your-cert.jpg" alt="Your Certificate Name" class="cert-image" loading="lazy" />
  <div class="cert-info">
    <h3 class="cert-name">Certificate Name</h3>
    <p class="cert-holder">Your Name</p>
  </div>
</div>
```

### Example
If you have a certificate called `oscp-certification.png`:
1. Place it in this folder
2. Update the code to reference it
3. The lightbox will automatically work when users click it

### Tips
- Use descriptive filenames for easy management
- Compress images before uploading to improve load times
- Test the lightbox functionality after adding new certificates
