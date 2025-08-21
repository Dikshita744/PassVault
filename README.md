# SecurePass 🔐  
**A zero-backend, privacy-first password generator you can host anywhere.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat-square)](https://pass.therayyanawaz.co.in/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)

---

## ✨ What it does
- **Generate** cryptographically-secure passwords in the browser  
- **Fully client-side** – nothing ever leaves your device  
- **Responsive** – works on desktop, tablet, and phone  
- **Cookie vault** – stores generated passwords locally (optional, encrypted)  
- **Light / dark mode** – auto-detects your OS preference  

---

## 🚀 Quick Start (local)
1. **Clone**
   ```bash
   git clone https://github.com/therayyanawaz/SecurePass.git
   cd SecurePass
   ```

2. **Serve** (any static host)
- Python 3
   ```bash
   python -m http.server 3000
    ```
- Node
    ```bash
   npx serve
   ```
   Open [http://localhost:3000](http://localhost:3000).

3. **Deploy**  
   Push to GitHub Pages, Vercel, Netlify, or any CDN—no build step required.

---

## 🛠 Tech Stack
- **HTML5** + **Tailwind CSS**  
- **Vanilla JavaScript** (ES2023)  
- **Web Crypto API** (`crypto.getRandomValues`)  
- **localStorage / cookies** (opt-in persistence)

---

## 🧪 Security Highlights
- Uses `crypto.getRandomValues` for entropy (≥ 128 bits default)  
- No third-party trackers or analytics  
- Source maps available for public audit  
- MIT license – fork, embed, or redistribute freely  

---

## 🧰 Browser Support
| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 60+    | 55+     | 11+    | 79+  |

---

## 🤝 Contributing
1. Fork & branch  
2. Keep it **static** (no Node build unless optional)  
3. Run `npm run lint` (uses `standard`) if you add tooling  
4. Open a PR with screenshots for UI changes

---

## 📋 Roadmap
- [ ] Offline PWA (service worker)  
- [ ] Import / export encrypted JSON  
- [ ] QR-code share for mobile  
- [ ] CLI mirror (`python -m securepass_cli`)

---

## 📄 License
MIT © 2025 [Md Rayyan Nawaz](https://github.com/therayyanawaz) – see [LICENSE](./LICENSE).

### Need the backend vault later?
 When you add user accounts, sync, and encryption, simply replace the “Tech Stack” and “Quick Start” sections with the Next.js instructions you drafted earlier.
## Authors

- [@therayyanawaz](https://www.github.com/therayyanawaz)
