# KADI - Interactive Bakery & Snack Discovery

KADI is a modern, full-stack MERN web application designed to help users discover premium baked goods and snacks in their immediate vicinity using live geolocation.

![KADI Logo](frontend/public/logo.png)

## 🌟 Features
- **Live Interactive Map:** Utilizes `react-leaflet` to display nearby bakeries dynamically based on your browser's Geolocation.
- **Google OAuth:** Secure authentication powered by Google's OAuth2 standards, storing profile info via MongoDB.
- **Sleek UI/UX Design:** Implemented with a highly modern "liquid glass" hybrid aesthetic bridging Glassmorphism and Neumorphism across cards, navbars, and buttons.
- **Smart Filtering:** Search dynamically by snack name, category (Sweet/Savory).
- **Graceful Degradation:** A complete mock-fallback architecture means the frontend UI works locally out-of-the-box even if your MongoDB daemon isn't running!

## 🚀 Tech Stack
- **Frontend:** React (Vite), Framer Motion (Animations), React-Leaflet (Mapping), Lucide React (Icons).
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** Google OAuth Library + JWT Contexts

---

## 💻 Local Setup & Installation

To run KADI locally, you will need to operate two servers simultaneously: the Backend (API) and the Frontend (UI).

### 1. Start the Backend API
The backend requires Node.js and MongoDB (optional, but recommended).
```bash
cd backend
npm install
npm run dev
```
*(The backend runs on `http://localhost:5000`)*

### 2. Start the Frontend
The frontend is built on Vite.
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on `http://localhost:5173` or `3000`)*

---

## 🔑 Environment Variables


---
*Created as a demonstration of high-quality agentic programming and responsive full-stack MERN design.*
