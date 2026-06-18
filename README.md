# 🏡 StayNest

A modern property booking platform inspired by Airbnb that allows users to discover, list, and book accommodations seamlessly.

StayNest provides a complete booking experience with property listings, user authentication, reservation management, and responsive design.

---

# ✨ Features

## User Features

- User Registration & Login
- JWT Authentication
- User Profiles
- Secure Logout

## Property Management

- Create Listings
- Update Listings
- Delete Listings
- Upload Property Images
- Manage Availability

## Booking System

- Search Properties
- View Property Details
- Book Stays
- Manage Reservations
- Booking History

## Search & Discovery

- Location Search
- Property Filtering
- Price Filtering
- Property Categories

## UI/UX

- Responsive Design
- Modern User Interface
- Mobile Friendly
- Fast Navigation

---

# 🏗 Architecture

```text
Frontend (React)
        │
        ▼
REST API (Node.js + Express)
        │
        ▼
MongoDB Database
```

---

# 🛠 Tech Stack

## Frontend

- React
- JavaScript / TypeScript
- TailwindCSS
- React Router
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication

## Database

- MongoDB
- Mongoose

## Storage

- Cloudinary

---

# 📂 Project Structure

```text
StayNest
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│   ├── hooks
│   ├── services
│   └── routes
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── services
│   └── config
```

---

# 🔑 Environment Variables

## Backend

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# 📡 API Routes

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

## Users

```http
GET /api/users/profile
PUT /api/users/profile
```

## Listings

```http
GET /api/listings
GET /api/listings/:id
POST /api/listings
PUT /api/listings/:id
DELETE /api/listings/:id
```

## Bookings

```http
POST /api/bookings
GET /api/bookings
DELETE /api/bookings/:id
```

---

# 🚀 Running Locally

## Backend

```bash
npm install
npm run dev
```

Runs on:

```text
http://localhost:5000
```

---

## Frontend

```bash
npm install
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

# 🐳 Docker

## Backend

```bash
docker build -t staynest-backend .
docker run -p 5000:5000 staynest-backend
```

## Frontend

```bash
docker build -t staynest-frontend .
docker run -p 5173:80 staynest-frontend
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Request Validation
- Secure API Access

---

# 📈 Future Improvements

- Payment Gateway Integration
- Google OAuth Login
- Wishlist Feature
- Reviews & Ratings
- Admin Dashboard
- Real-Time Notifications
- Property Analytics
- AI-Based Recommendations

---

# 👨‍💻 Author

**Ketan Goyal**

StayNest is a full-stack accommodation booking platform designed to simplify property discovery and reservations while providing a smooth and modern user experience.
