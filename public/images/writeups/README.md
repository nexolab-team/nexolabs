# Images for Writeups

Place your writeup images in this directory.

## Usage in Markdown

```markdown
![Alt text](/images/writeups/your-image.png)
```

## Image Guidelines

- **Format**: PNG, JPG, GIF, or WebP
- **Size**: Optimize images (< 500KB recommended)
- **Dimensions**: Max width 1200px
- **Naming**: Use descriptive kebab-case names
  - ✅ `xss-profile-form.png`
  - ✅ `sql-injection-result.png`
  - ❌ `IMG_1234.png`

## Example Structure

```
writeups/
├── xss-profile-form.png
├── xss-alert.png
├── xss-success.png
├── sql-error-based.png
├── buffer-overflow-diagram.png
└── crypto-key-analysis.png
```

## Placeholder Images

For demonstration purposes, you can use placeholder services:

```markdown
![Placeholder](https://via.placeholder.com/800x400/0a0a0a/00ffff?text=Your+Screenshot+Here)
```

Or use screenshot services:
- https://placeholder.com
- https://via.placeholder.com
- https://dummyimage.com

## Tips

1. **Annotate screenshots**: Use tools like Flameshot or Greenshot to add arrows and text
2. **Crop sensitive info**: Remove any personal or sensitive data
3. **Use dark theme**: Matches the site's cyberpunk aesthetic
4. **Compress images**: Use tools like TinyPNG or ImageOptim
5. **Add captions**: Use figure/figcaption for better context

## Optimal Image Sizes

- **Full-width screenshots**: 1200 x 675px (16:9)
- **Terminal output**: 1000 x 600px
- **Code screenshots**: 800 x 600px
- **Diagrams**: 800 x 500px
- **Icons/logos**: 200 x 200px
