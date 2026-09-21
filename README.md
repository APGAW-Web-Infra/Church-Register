# ⛪ Church Community Platform

[![LuxuryX](https://img.shields.io/badge/Developed%20By-LuxuryX%20Technologies-blueviolet)](https://luxuryxtech.org.ng/)
[![Laravel](https://img.shields.io/badge/Backend-Laravel-red.svg)](https://laravel.com/)
[![React](https://img.shields.io/badge/Frontend-React-blue.svg)](https://reactjs.org/)
[![Inertia](https://img.shields.io/badge/Inertia.js-Enabled-purple.svg)](https://inertiajs.com/)
[![License](https://img.shields.io/badge/License-Private-lightgrey.svg)]()

A modern church management and community platform designed to help churches streamline operations, engage members, organize ministries, and build a stronger digital presence.

This project is being developed by **LuxuryX Technologies & TradeFi Ltd.**

## ✨ Overview

This platform is built for churches and ministries that want a centralized place to manage worship operations, discipleship, attendance, events, communications, and community engagement from a single web experience.

It combines the tools churches often need across admin, ministry, and member experience into one thoughtful system that is easy to use and scalable for growing communities. The application is designed with a modern web stack and a church-friendly user experience so that leaders can focus more on ministry and less on manual administration.

## 💡 Why This Project Exists

Many churches still rely on disconnected tools such as spreadsheets, WhatsApp groups, forms, and manual attendance tracking. This creates friction in:

- Attendance monitoring & member follow-up
- Prayer and pastoral care
- Event planning & ministry coordination
- Member communication & community engagement

This platform is designed to bring those activities into a more organized, welcoming, and digital-first experience.

## 🚀 Key Features

| Module | Capabilities |
| :--- | :--- |
| **Church Dashboard & Operations** | Leadership-friendly dashboard, live operational summaries, member statistics, service trends, ministry health snapshot, and upcoming activity visibility. |
| **Attendance & Service Tracking** | Daily/weekly/monthly tracking, service registration, first-timer tracking, and unique member counting logic to avoid duplication in key metrics. |
| **Member & Community Management** | Member profiles, directory, demographic summaries, engagement monitoring, follow-up support, and leadership visibility. |
| **Prayer & Pastoral Care** | Prayer request submission, support tracking, pastoral follow-up workflows, and member care visibility. |
| **Events & Church Calendar** | Event creation, registration, scheduling, attendee tracking, and calendar-driven ministry coordination. |
| **Ministries & Small Groups** | Ministry directory, group management, membership tracking, leadership features, and discipleship organization. |
| **Newsletter & Communication** | Subscription management, newsletter campaigns, email workflows, and digital outreach for church communities. |
| **Media & Announcements** | Church announcements management, media publishing, public-facing communication pages, and education sharing. |
| **Leadership & Admin** | Administrative dashboards, secure role-based access, operations controls, and key ministry record management. |
| **Public-Facing Website** | Welcoming landing page, ministry and outreach sections, contact pages, and community storytelling surfaces. |

## 🏗️ Architecture & Technology Stack

### Backend
- **Laravel** (PHP Framework)
- **MySQL** (Database)
- **Eloquent ORM**
- Role-based access patterns
- REST-like and web-first application flow

### Frontend
- **React**
- **Inertia.js**
- **Vite**
- **Tailwind CSS**
- **TypeScript**

### System Goals
- Clear and modern UI
- Responsive design across desktop and mobile
- Performance-focused frontend experience
- Secure church operations workflow
- Ability to customize for different denominational or ministry needs

## 🎯 Typical Use Cases

### For Church Leaders
- View church health at a glance
- Monitor worship attendance trends
- Keep track of prayer requests and ministry activity
- Coordinate events and maintain a clear view of operations

### For Ministry Teams
- Manage group activities and follow-ups
- Coordinate small groups and discipleship initiatives
- Monitor outreach and engagement
- Keep ministry records centralized

### For Members
- Access church information and updates
- Stay connected with activities and announcements
- Request prayer and register for events
- Discover ministries and community opportunities

### For Churches Growing Digitally
- Present the church online in a clean, modern way
- Connect with members beyond physical gatherings
- Build a digital front door for the community
- Improve communication and engagement

## 💎 Core Product Value

This product aims to help churches operate with more clarity, consistency, and purpose. It reduces the burden of disconnected systems and gives leadership a practical way to keep people connected to the church, ministry, and mission.

It is designed to be helpful for:
- Small to medium-sized churches
- Growing congregations
- Ministry-led organizations
- Community-driven Christian organizations
- Churches needing a digital central hub

## 📊 Project Status

This project is actively being developed and improved with a focus on:
- Production-ready admin workflows
- Stronger church analytics and dashboard clarity
- Improved attendance logic and data integrity
- User-friendly public website experience
- Scalable future ministry features

## 🛠️ Getting Started

### Prerequisites

- PHP
- Composer
- Node.js and npm
- MySQL or compatible database

### Installation

1. Clone the repository
2. Install PHP dependencies
3. Install frontend dependencies
4. Configure your environment file
5. Run database migrations and seeders if required
6. Start the application

**Example commands:**

```bash
# Clone the repository
git clone <repository-url>
cd <project-folder>

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate

# Start development server
npm run dev
