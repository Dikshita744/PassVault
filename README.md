# PassVault 🔐  
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
   git clone https://github.com/Dikshita744/PassVault.git
   cd SecurePass
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Development**
   ```bash
   pnpm dev
   # or npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Build & Deploy**
   ```bash
   pnpm build
   # Deploy to Vercel, Netlify, or any static host
   ```

---

## 🛠 Tech Stack

### **Framework & Runtime**
- **Next.js 15.2.4** (React 19) - App Router with Server Components
- **TypeScript 5** - Type-safe development
- **Node.js** - Development environment

### **UI & Styling**
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix UI** - Headless, accessible component primitives
- **Lucide React** - Beautiful & consistent icon library
- **next-themes** - Dark/Light mode with system detection
- **Geist Font** - Modern typography by Vercel

### **3D Graphics & Animation**
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **tailwindcss-animate** - CSS animations

### **Form & Data Management**
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation
- **date-fns** - Modern date utility library

### **State & Storage**
- **Browser LocalStorage** - Client-side password vault
- **Web Crypto API** - Cryptographically secure random generation
- **React State** - Component state management

### **Development Tools**
- **PostCSS & Autoprefixer** - CSS processing
- **ESLint** - Code linting
- **Class Variance Authority** - Component variant management
- **clsx & tailwind-merge** - Conditional className utilities

---

## 🧪 Security & Privacy Highlights
- **Web Crypto API** - Uses `crypto.getRandomValues()` for cryptographically secure entropy
- **Client-side only** - Zero backend, nothing leaves your device
- **Local storage** - Passwords stored in browser LocalStorage (encrypted)
- **No tracking** - No analytics, cookies, or third-party trackers
- **Open source** - Full source code available for security audit
- **Type-safe** - TypeScript ensures runtime safety

---

## 🧰 Browser Support
| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 88+    | 90+     | 14+    | 88+  |
*Requires modern ES2022+ support and Web Crypto API*

---

## 🤝 Contributing
1. Fork & create feature branch  
2. Install dependencies: `pnpm install`
3. Run development server: `pnpm dev`
4. Follow TypeScript/ESLint rules: `pnpm lint`
5. Test on multiple browsers & devices
6. Open PR with screenshots for UI changes

---

## 📋 Roadmap
- [x] **3D Password Visualization** - Interactive Three.js password strength indicator
- [x] **Advanced Dashboard** - Password management with categories & analytics
- [x] **Dark/Light Theme** - System-aware theme switching
- [x] **Export/Import** - JSON, CSV, TXT backup formats
- [ ] **PWA Support** - Offline capability with service worker
- [ ] **Password Health** - Breach detection & security recommendations
- [ ] **Biometric Auth** - WebAuthn for secure vault access
- [ ] **Browser Extension** - Auto-fill integration


---

## 🏗️ Architecture
This is a **JAMstack application** built with:
- **Static generation** at build time
- **Client-side interactivity** with React
- **Edge deployment** compatible (Vercel, Netlify, Cloudflare)
- **Zero runtime dependencies** - pure client-side execution

## 👨‍💻 Contributors

- **[@Dikshita744](https://www.github.com/Dikshita744)**

---

*Built with ❤️ using modern web technologies. No servers needed, privacy guaranteed.*
