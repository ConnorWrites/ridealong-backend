# RideAlong – Backend API

RideAlong is a RESTful backend API for a ride-sharing application that allows drivers to post rides and passengers to browse and request 
seats.

This service handles authentication, ride management, and ride request workflows.

---

## 🚀 Features

- User authentication (signup & login)
- Role-based access (Driver / Passenger)
- Create and list rides
- Request, accept, or reject ride requests
- JWT-based authentication
- Input validation and error handling

---

## 🛠 Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication

---

## 📂 Project Structure

src/
├── routes/        # API routes
├── controllers/   # Request handlers
├── middleware/    # Auth & validation middleware
├── prisma/        # Prisma schema
└── index.ts       # App entry point

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ridealong
JWT_SECRET=your-secret-key
PORT=3000

Running the API locally:
npm install
npx prisma migrate dev
npm run dev

API is available at:
http://localhost:3000

🔗 API Endpoints (sample)

* POST /auth/signup
* POST /auth/login
* GET /rides
* POST /rides
* POST /rides/:id/request
* POST /rides/requests/:id/accept

⸻

🧪 Future Improvements

* Pagination & filtering
* Notifications
* Ride cancellation
* Admin dashboard

⸻

👤 Author

Your Name
GitHub: https://github.com/yourusername
