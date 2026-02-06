# WhatsApp-Style Messaging App

A production-ready, WhatsApp-inspired messaging application built with a focus on clean architecture, real-time interaction, and a polished mobile-first user experience.

The app simulates real-time messaging between two fixed users with independent message states, modern chat features, and a familiar UI.

---

## ✨ Features

### 👥 Users
- Two fixed users.
- Each user has:
  - Their own chat perspective
  - Independent message state (delete, mark important, etc.)

---

### 💬 Messaging
- Real-time chat updates
- WhatsApp-style message bubbles
- Sent / received message differentiation
- Reply to messages with preview
- Emoji reactions (shared between users)
- Message timestamps and delivery status

---

### ⭐ Message Management
- Mark messages as **Important**
- Delete messages (per user)
- Clear chat with option to save important messages
- **Important Messages Vault** for quick access

---

### 📎 Attachments & Media
- Image uploads
- File attachments
- Audio messages
- Voice recording UI

---

### 📞 Calls (UI Only)
- Voice call button
- Video call button  
*(UI implemented, no calling functionality)*

---

## 🎨 Design & UX

Inspired by WhatsApp’s clean and intuitive interface, with a modern twist.

- **Primary Color:** WhatsApp Green / Emerald (`#25D366`)
- **Sent Messages:** Light emerald bubbles
- **Received Messages:** White / soft gray bubbles
- **Background:** Subtle chat pattern with gradient
- **Typography:** Inter
- Smooth transitions and micro-interactions
- Fully responsive, mobile-first layout

---

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Real-time backend & storage** (cloud-enabled)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

---

### Installation

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <PROJECT_FOLDER>
npm install
