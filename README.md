# GChat - WhatsApp Clone using MERN Stack

GChat is a real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) with additional support for audio and video calling. This app allows users to sign up and log in using their email addresses, instead of phone numbers, and engage in real-time messaging and calling.

## Features
- **Email-based Authentication:** Users can sign up or log in using their email and password.
- **Real-time Messaging:** Chat with friends and family in real-time with messages instantly delivered.
- **Audio and Video Calling:** Make audio and video calls to your contacts.
- **Profile Management:** Users can set up their profile with a custom display name and photo.
- **User Invitations:** Send invitation links to new users via email.
- **Responsive UI:** The app is mobile-friendly and adapts well to different screen sizes.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js with Express.js
- **Database:** MongoDB (using Mongoose for object data modeling)
- **Authentication:** JWT (JSON Web Tokens)
- **Realtime Communication:** Socket.io for real-time messaging and communication
- **Audio/Video Calling:** WebRTC (for peer-to-peer communication)
- **Storage:** Firebase Storage for profile picture storage

## Prerequisites
Before you begin, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (or use MongoDB Atlas for cloud database)
- Firebase account for authentication and storage (optional for profile pictures)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/GChat.git

### 2. Install Backend Dependencies
``bash
cd server
npm start

### 3. Setup Environment Variables
Create a .env file in the backend folder and add the following variables:
```bash
MONGO_URI=your_mongo_database_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_url






