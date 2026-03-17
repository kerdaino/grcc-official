# 🌍 GRCC Website (Gloryrealm Christian Centre)

A full-featured modern church website built with **Next.js**, designed to support ministry operations, discipleship systems, and digital outreach.

---

## 🚀 Overview

The GRCC Website is more than a static site — it is a **ministry platform** that supports:

- Church visibility and outreach
- School of Discovery (discipleship system)
- Sermon publishing and media distribution
- Blog content and teachings
- Workforce (ministries) onboarding system
- Contact and communication pipeline

Built with scalability in mind, this system is structured to grow into a **full ministry ecosystem**.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Email Service:** Resend
- **Authentication:** Cookie-based (Admin & Workforce)
- **Deployment:** Vercel (recommended)

---

## 📂 Project Structure
src/
│
├── app/
│   ├── (public pages)
│   │   ├── page.tsx (Homepage)
│   │   ├── contact/
│   │   ├── blog/
│   │   ├── events/
│   │   ├── gallery/
│   │   ├── ministries/
│   │   ├── sermons/
│   │
│   ├── admin/
│   │   ├── page.tsx (Admin Dashboard)
│   │   ├── school-of-discovery/
│   │   ├── sermons/
│   │   ├── contact/
│   │   ├── ministries/
│   │
│   ├── api/
│       ├── admin/
│       ├── blog/
│       ├── ministries/
│       ├── contact/
│
├── components/
│   ├── PageHero.tsx
│   ├── Sections.tsx
│
├── lib/
│   ├── supabaseServer.ts
│   ├── password.ts
---

## 🔑 Core Features

### 🏠 Homepage
- Dynamic Verse of the Day
- Upcoming Events (dynamic ready)
- Latest Sermons (database-driven)
- Blog highlights

---

### 📖 School of Discovery
- Application system
- Admin approval workflow
- Email notifications
- (Upcoming) Payment integration

---

### 🎙 Sermons
- Admin upload system
- YouTube & audio support
- Publish/unpublish control

---

### 📝 Blog System
- Dynamic blog posts
- Comment system with:
  - Replies
  - Likes
  - Admin moderation
- Spam protection

---

### 🖼 Gallery
- Image upload via admin
- Stored in Supabase Storage
- Responsive display with modal viewer

---

### 📅 Events
- Dynamic events system (DB-ready)
- Individual event pages

---

### 🙏 Ministries (Workforce System)
- Application form
- Admin approval system
- Worker login
- Worker dashboard
- Department-based access

---

### 📩 Contact System
- Form submission
- Saved to database
- Admin email notification
- Auto-reply email to sender
- Admin dashboard view

---

## 🔐 Admin System

Protected via cookies (`grcc_admin`)

Admin can manage:

- School of Discovery applications
- Sermons
- Blog content (future expansion)
- Ministries applications
- Contact messages

---

## 🔑 Environment Variables

Create a `.env.local` file:

```env
# Supabase
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# Resend Email
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=GRCC <onboarding@resend.dev>
ADMIN_NOTIFY_EMAIL=your_email

# Admin Auth
ADMIN_PASSWORD=your_secure_password

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

⚙️ Installation
npm install
npm run dev

👨‍💻 Author
KD Global(https://www.kdevglobal.com/)