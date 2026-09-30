 Book Library Management System

A full-stack library application built with the MERN stack (React, Node.js, Express.js, MongoDB, Mongoose) using Vite for the frontend. Users can sign up, log in, and perform full CRUD operations on book records, including managing their availability status.

## Project Structure
```text
book-library-management/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Book.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── books.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Core Features
- **Authentication**: Simple SignUp and Login using stored user records via JWT.
- **Book Operations (CRUD)**: Add, display, edit, and delete book entries.
- **Search functionality**: Search books dynamically by title or author.
- **Status Toggling**: Mark book status seamlessly as `Available` or `Issued`.
- **Database Storage**: Uses MongoDB Atlas with Mongoose object modeling.

---

## Technical Stack
- **Frontend**: React (Vite), Axios / Fetch API, CSS/Tailwind
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), CORS
- **Database**: MongoDB Atlas, Mongoose

---

## Installation & Setup Instructions

### 1. Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas Account

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install express mongoose cors dotenv bcryptjs jsonwebtoken
   ```
3. Create a `.env` file in the root of the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the development server:
   ```bash
   npm run dev # or node server.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install axios react-router-dom
   ```
3. Create a `.env` file in the root of the `frontend/` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Run the Vite development client:
   ```bash
   npm run dev
   ```

---

## API Endpoints Reference

### Authentication Routes (`/api/auth`)
- `POST /signup` - Registers a new user account.
- `POST /login` - Authenticates a user and signs a token.

### Book Management Routes (`/api/books`)
- `GET /` - Fetches all library books (Supports query params `?search=`).
- `POST /` - Creates a new book entry (Title, Author, Category).
- `PUT /:id` - Updates book information or toggles between `Available` and `Issued`.
- `DELETE /:id` - Permanently deletes a book record from the catalog.

---

## OpenCode Code Review Checklist
Before pushing changes, use OpenCode guidelines to verify:
1. **Async Handling**: Wrap all controllers in `try/catch` block rules.
2. **CORS Configuration**: Verify credentials and origins match environmental variables.
3. **Data Security**: Securely store encrypted passwords using `bcryptjs`.
4. **Environment Context**: Always access backend endpoints utilizing `import.meta.env.VITE_API_BASE_URL`.

---

## Deployment Workflow (Netlify + Render)

### 1. GitHub Repository
- Push the entire monorepo repository to GitHub containing both the `frontend` and `backend` directories.

### 2. Backend Deployment on Render
1. Create a new **Web Service** on Render connected to your repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Add **Environment Variables** in the dashboard settings panel (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`).
6. Copy the assigned live Render URL (e.g., `https://library-api.onrender.com`).

### 3. Frontend Deployment on Netlify
1. Create a new site from Git deployment in Netlify.
2. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add **Environment Variables** under site configuration settings:
   - `VITE_API_BASE_URL` = `https://library-api.onrender.com/api`
4. Deploy the site and copy the live Netlify application URL.

### 4. Cross-Origin Resource Sharing (CORS) Synchronization
- Go back to your Render Dashboard Environment Variables configuration for the backend.
- Update the value of `FRONTEND_URL` to point exactly to your newly deployed live Netlify domain
- (https://book-library-managemnetsystem.netlify.app/).
- Clear caches or redeploy your service to execute live functionality validation checks.
