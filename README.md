# JS Lecturer App

This is a real-time collaborative coding platform designed for mentoring sessions, where a mentor can guide students through coding exercises. The app supports live code collaboration using Socket.IO, and it's built with React for the frontend and Node.js with Express and MongoDB for the backend.

## Features

- Real-time code collaboration between mentor and students.
- Role-based access, where the first user to join is assigned as the mentor and others as students.
- Student count tracking per session.
- Automatic matching of solutions with visual feedback.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Orshimon810/tom-lecturer.git
   cd tom-lecturer

2. **Install dependencies:**
   npm install

3. **Set up environment variables:**
   Create a .env file in the root directory and configure the following environment variables:
   MONGO_URI=<Your MongoDB URI>
   
   REACT_APP_BACKEND_URL=http://localhost:3001
   
   REACT_APP_FRONTEND_URL=http://localhost:3000
   
   PORT=3001

5. **Build the frontend:**
    npm run build

6. **Run the application:**
   node server/server.js

7. **Technologies Used:**
   
   Frontend: React, Ace Editor
   
   Backend: Node.js, Express, MongoDB
   
   Real-time Communication: Socket.IO
   
   Deployment: Heroku


  
