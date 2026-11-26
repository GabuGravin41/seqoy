# seqoy — Brand & Logo Guidelines

This package contains the locked-in logo assets, transparent web exports, favicons, and design tokens for **seqoy** (`https://github.com/GabuGravin41/seqoy`).

---

## 1. Asset Inventory & Recommended Repo Placement

Copy the assets into your web project's static directory (e.g., `public/brand/` or `src/assets/brand/`):

```text
public/
├── favicon.ico                                 # Multi-size browser favicon (16/32/48px)
├── favicon-32x32.png                           # Standard PNG favicon
├── apple-touch-icon.png                        # iOS home screen icon (180x180, white bg)
├── icon-512x512.png                            # PWA / OpenGraph / manifest icon
└── brand/
    ├── seqoy-logo-primary-transparent.png      # Light backgrounds (default mark)
    ├── seqoy-logo-dark-transparent.png         # Dark backgrounds (#475569 or darker)
    ├── seqoy-logo-mono-transparent.png         # Single-color deep navy (print / watermarks)
    └── seqoy-logo-horizontal-transparent.png   # Primary navbar / header lockup
```

> **Note on Originals & SVG Vectorization:** Untouched high-resolution source files are stored in `assets/originals/`. If you want crisp infinite scaling for production, trace `assets/originals/seqoy-logo-primary.png` into clean SVGs (`logo-primary.svg`, `logo-dark.svg`, `logo-mono.svg`, `logo-horizontal.svg`) preserving the exact geometry and color values below.

---

## 2. Color Palette

Exact hex values sampled from the locked-in logo assets:

| Role | Color Name | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | Pulse Crimson | `#A61C26` | Heart silhouette & inner red arc (light mode) |
| **Primary Dark** | Deep Navy | `#1F274B` | ECG pulse, top signal arcs, wordmark, monochrome mark |
| **Dark Mode Accent** | Bright Crimson | `#BE2324` | Heart silhouette on dark surfaces (use `#DC2626` for small UI accents) |
| **Dark Surface** | Deep Slate | `#111828` | Dark-mode backgrounds and app headers |
| **Light Surface** | Pure White | `#FFFFFF` | Light-mode backgrounds & dark-mode ECG/arcs |

Ready-to-import tokens are included in `tokens/brand-tokens.css` and `tokens/brand-tokens.json`.

---

## 3. Typography & Lockup Rules

- **Wordmark:** Always set in lowercase (`seqoy`).
- **Recommended Typefaces:** `Plus Jakarta Sans`, `Inter`, or `Space Grotesk` (weights `500` Medium or `600` SemiBold).
- **Tracking:** Slight negative letter-spacing (`-0.02em`).
- **Optical Alignment:** In horizontal lockups, align the wordmark vertically to the optical center of the heart body (not the top edge of the protruding signal arcs, which pulls the text upward).
- **Clear Space:** Maintain a minimum clear space equal to **25% of the logo's height** on all four sides. Keep borders, badges, and navigation links outside this zone.

---

## 4. Sizing & Theme Switching

- **Navbar / Header:** Minimum height `32px` for the icon mark; avoid rendering the horizontal wordmark lockup narrower than `100px` total width.
- **Theme Switching Rule:** Automatically switch from `seqoy-logo-primary-transparent.png` to `seqoy-logo-dark-transparent.png` whenever the container background is darker than `#475569` (or when `.dark` / `prefers-color-scheme: dark` is active).

### HTML `<head>` Favicon Snippet

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### Example Responsive Navbar Component (React / Tailwind)

```tsx
export function SeqoyLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <a href="/" aria-label="seqoy home" className="inline-flex items-center gap-2.5">
      <img
        src="/brand/seqoy-logo-primary-transparent.png"
        alt="seqoy"
        className={`${className} block dark:hidden`}
      />
      <img
        src="/brand/seqoy-logo-dark-transparent.png"
        alt="seqoy"
        className={`${className} hidden dark:block`}
      />
      <span className="font-semibold tracking-[-0.02em] text-xl text-[#1F274B] dark:text-white">
        seqoy
      </span>
    </a>
  );
}
```

---

## 5. Usage Do's & Don'ts

- **Do** preserve the original aspect ratio when scaling.
- **Do** use the dark-mode variant on dark slate/charcoal surfaces so the ECG line and signal arcs remain crisp in white.
- **Don't** apply drop shadows, outer glows, bevels, or gradients to the mark.
- **Don't** detach the top signal arcs or the ECG pulse line from the heart silhouette—all three elements travel as one locked unit.
- **Don't** place the primary navy-and-crimson mark directly on dark backgrounds without switching to the dark-mode variant.
