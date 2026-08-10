# 🎟️ Event Management & Ticket Selling Platform (MERN)

A full-stack **Event Management and Ticket Selling platform** built using the **MERN stack**, featuring user authentication, event browsing, ticket reselling, admin approval workflows, and contact management.

🔗 **Live Demo (Frontend):**


🔗 **Backend API:**


---

## 🚀 Features

### 👤 User Features

- User signup & login with JWT authentication
- Browse live events
- Book event tickets
- Sell tickets by submitting resale requests
- Upload ticket proof (image / PDF)
- View booking count and profile details
- Track sell ticket approval status

---

### 🛠️ Admin Features

- Secure **Admin Dashboard**
- View & approve/reject sell ticket requests
- View uploaded ticket proof files
- View contact form messages
- Role-based access control (admin vs user)

---

### 📩 Contact System

- Users can send messages via Contact page
- Admin can view all messages from the dashboard

---

## 🧑‍💻 Tech Stack

### Frontend

- React.js (Vite)
- React Router DOM
- Tailwind CSS
- JWT Authentication
- Deployed on **Vercel**

### Backend

- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- Multer (file uploads)
- JWT + bcrypt
- Deployed on **Render**

---

## 📁 Project Structure

event_management/
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── vercel.json
│
├── backend/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── uploads/
│ └── server.js
│
└── README.md

---

## 🔐 Authentication & Roles

- JWT-based authentication
- Protected routes for authenticated users
- Admin-only routes secured via middleware
- Role stored and validated on both frontend & backend

---

---

## 🌱 Future Enhancements

- Payment gateway integration
- Email notifications
- Admin event creation
- Pagination & search filters
- Cloud file storage (Cloudinary)

---

## 🙌 Author

**Khushi**  
Aspiring Full-Stack MERN Developer

If you find this project helpful, don’t forget to ⭐ the repository!
