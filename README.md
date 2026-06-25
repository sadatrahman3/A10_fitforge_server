# FitForge - Fitness & Gym Management Platform

**Live Site:** https://fitforge.vercel.app  
**Client Repo:** https://github.com/sadatrahman3/A10_fitforge_client  
**Server Repo:** https://github.com/sadatrahman3/A10_fitforge_server

## Purpose
FitForge is a comprehensive fitness management platform designed for fitness enthusiasts, gym trainers, and administrators. Users can discover fitness classes, book sessions, participate in community discussions, and track their fitness journey.

## Key Features
- **User System:** Register, Login (Email + Google), Role-based access (User/Trainer/Admin)
- **Class Management:** Browse, search, filter, and book fitness classes
- **Community Forum:** Create posts, like/dislike, comment, and reply
- **Payment Integration:** Secure Stripe checkout for class bookings
- **Trainer System:** Apply to become a trainer, create and manage classes
- **Admin Dashboard:** Manage users, trainers, classes, forum posts, and view transactions
- **Responsive Design:** Fully responsive for mobile, tablet, and desktop
- **Dark Theme:** Professional dark UI with red accent colors
- **Animations:** Framer Motion for interactive homepage sections

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Framer Motion, Axios, React Toastify, Lucide Icons
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Payments:** Stripe
- **Image Hosting:** Imgbb

## NPM Packages Used
### Client
- `react-router-dom` - Client-side routing
- `tailwindcss` - Utility-first CSS framework
- `framer-motion` - Animation library
- `axios` - HTTP client
- `react-icons` - Icon library
- `react-toastify` - Toast notifications
- `react-helmet-async` - Document head management
- `@stripe/stripe-js` - Stripe frontend integration
- `lucide-react` - Modern icon set

### Server
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `cookie-parser` - Cookie parsing
- `stripe` - Payment processing
- `better-auth` - Authentication utilities
