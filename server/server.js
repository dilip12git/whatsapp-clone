const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");

const User = require("./Models/user");
const UserList = require("./Models/chatList");
const Chat = require("./Models/chat");
const DeleteChat = require("./routers/chat/deleteChat.js");
const DeleteMsg = require("./routers/chat/deleteMessage.js");
const BlockUser = require("./routers/chat/blockUser.js");
const ChatLists = require("./routers/chat/chatlist.js");
const MarkMsgSeen = require("./routers/chat/messageStatus.js");
const register = require("./routers/auth/register.js");
const login = require("./routers/auth/login.js");
const generateOTP = require("./routers/auth/generateOTP.js");
const generateResetPassOTP = require("./routers/auth/generateResetPassOTP.js");
const updatePassword = require("./routers/auth/updatePassword.js");
const updateUsers = require("./routers/auth/updateUser.js");
const addChat = require("./routers/chat/addNewChat.js");
const callLogs = require("./routers/callLogs/storeCallLogs.js");
const updateCallLogs = require("./routers/callLogs/updateCallLogs.js");
const fetchCallLogs = require("./routers/callLogs/fetchCallLogs.js");
const deleteCallLogs = require("./routers/callLogs/deleteCallLogs.js");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/chat",
  express.static(path.join(__dirname, "Users-files/users-chat-files"))
);
app.use(
  "/profiles",
  express.static(path.join(__dirname, "Users-files/profiles"))
);

app.use("/users/auth", register);
app.use("/users/auth", login);
app.use("/users/auth", generateOTP);
app.use("/users/auth", generateResetPassOTP);
app.use("/users/auth", updatePassword);
app.use("/users/auth", updateUsers);
app.use("/users/chats", DeleteChat);
app.use("/users/chats", DeleteMsg);
app.use("/users/auth", BlockUser);
app.use("/users/chatlists", ChatLists);
app.use("/users/chats", MarkMsgSeen);
app.use("/GChat/chatlists", addChat);
app.use("/call/callhistories", callLogs);
app.use("/call/update-call-logs", updateCallLogs);
app.use("/call/fetch-call-logs", fetchCallLogs);
app.use("/call/delete-call-logs", deleteCallLogs);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const activeCalls = new Map();
const peerServer = ExpressPeerServer(server, {
  debug: true,
  host: "localhost",
  port: "5000",
  path: "/",
});

app.use("/peerjs", peerServer);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));

const BASE_URL = "http://localhost:5000/chat";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.senderId;
    const userDir = path.join(
      __dirname,
      "Users-files/users-chat-files",
      userId
    );

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Set up multer upload with only storage and size limit (no filter)
const upload = multer({ storage });
// Endpoint to upload both image and video
app.post("/upload-file", upload.single("file"), async (req, res) => {
  const { senderId } = req.body;
  // Construct the absolute path of the uploaded file (image or video)
  const fileUrl = req.file
    ? `${BASE_URL}/${senderId}/${req.file.filename}`
    : null;

  if (fileUrl) {
    res.status(200).json({ message: "File uploaded successfully", fileUrl });
  } else {
    res.status(400).json({ message: "File upload failed" });
  }
});

app.get("/users/chats/:userId/:peerId", async (req, res) => {
  const { userId, peerId } = req.params;

  try {
    // Find the chat between the given users
    const chat = await Chat.findOne({
      participants: { $all: [userId, peerId] },
    });

    // If no chat exists, return a 404 error
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    // Initialize deletionTimestamps as an empty array if it is undefined
    if (!chat.deletionTimestamps) {
      chat.deletionTimestamps = [];
    }

    // Determine if the user deleted the chat and filter messages accordingly
    let filteredMessages = chat.messages;
    const userDeletion = chat.deletionTimestamps.find(
      (entry) => entry.userId === userId
    );
    if (userDeletion) {
      // If the user deleted the chat, only return messages sent after the deletion timestamp
      const deletionTimestamp = userDeletion.timestamp;
      filteredMessages = chat.messages.filter(
        (msg) => msg.timestamp > deletionTimestamp
      );
    }

    res.json({ messages: filteredMessages, chat });
  } catch (err) {
    // console.error('Error fetching chat messages:', err);
    res.status(500).json({ message: "Server error" });
  }
});

let activeUsers = new Set();
const userSocketMap = new Map();

io.on("connection", (socket) => {
  socket.on("privateMessage", async (data) => {
    const { senderId, receiverId, message, fileUrl, productUrl } = data;

    try {
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (chat && chat.deletedBy && chat.deletedBy.includes(senderId)) {
        chat.deletedBy = chat.deletedBy.filter((id) => id !== senderId);
      } else if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: [],
        });
      }

      chat.messages.push({
        senderId,
        receiverId,
        message,
        fileUrl,
        productUrl,
        timestamp: new Date(),
      });

      chat.updatedAt = Date.now();
      await chat.save();
      const timestamp = chat.updatedAt;

      socket.emit("messageReceived", {
        senderId,
        receiverId,
        message,
        fileUrl,
        productUrl,
        timestamp,
      });

      // Emit the message to the receiver
      socket.to(receiverId).emit("messageReceived", {
        senderId,
        receiverId,
        message,
        fileUrl,
        productUrl,
        timestamp,
      });

      await updateUserList(senderId, receiverId, message);
      await updateUserList(receiverId, senderId, message);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("sendNotification", ({ selectedChatUserId, name }) => {
    io.to(selectedChatUserId).emit("receiveNotification", name);
  });

  socket.on("blocked", ({ selectedChatUserId }) => {
    socket.to(selectedChatUserId).emit("notifyBlocked");
  });

  socket.on("activeUser", (userId) => {
    userSocketMap.set(socket.id, userId);
    activeUsers.add(userId);
    io.emit("updateActiveUsers", Array.from(activeUsers));
    socket.emit("updateActiveUsers", Array.from(activeUsers));
  });

  socket.on("joinChat", (userId) => {
    socket.join(userId);
  });

  socket.on(
    "call-user",
    ({ from, to, name, profile, callType, rName, rProfile }) => {
      if (!from || !to) return;
      activeCalls.set(from, to);

      io.to(to).emit("call-invitation", { from, name, profile, callType });
      io.to(from).emit("recipientUser-details", {
        userId: to,
        name: rName,
        profile: rProfile,
        callType,
      });
    }
  );

  socket.on("call-rejected", ({ from }) => {
    io.to(from).emit("call-rejected", { message: "Call was rejected" });
  });

  socket.on("call-accepted", ({ from }) => {
    io.to(from).emit("call-accepted");
  });

  socket.on("video-status", ({ to, status }) => {
    io.to(to).emit("video-status", { status });
  });

  socket.on("audio-status", ({ to, status }) => {
    io.to(to).emit("audio-status", { status });
  });

  // Call end
  socket.on("call-ended", ({ from, to }) => {
    if (!from || !to) return;

    io.to(from).emit("call-ended", { from, to });
    io.to(to).emit("call-ended", { from, to });
    activeCalls.delete(from);
  });

  socket.on("call-not-answered", ({ to }) => {
    if (!to) return;
    io.to(to).emit("call-not-answered", {
      message: "The call was not answered.",
    });
  });

  socket.on("disconnect", () => {
    const userId = userSocketMap.get(socket.id);
    if (userId) {
      activeUsers.delete(userId);
      userSocketMap.delete(socket.id);
      io.emit("updateActiveUsers", Array.from(activeUsers));
      // console.log(`User ${userId} has disconnected`);
    }

    for (const [caller, recipient] of activeCalls.entries()) {
      if (socket.id === caller || socket.id === recipient) {
        io.to(caller).emit("call-ended");
        io.to(recipient).emit("call-ended");
        activeCalls.delete(caller);
      }
    }
  });
});

async function updateUserList(userId, peerId, lastMessage) {
  try {
    let userList = await UserList.findOne({ userId });
    if (!userList) {
      userList = new UserList({ userId, chatPartners: [] });
    }

    const peerIndex = userList.chatPartners.findIndex(
      (partner) => partner.peerId === peerId
    );
    if (peerIndex === -1) {
      userList.chatPartners.push({ peerId, lastMessage });
    } else {
      userList.chatPartners[peerIndex].lastMessage = lastMessage;
      userList.chatPartners[peerIndex].timestamp = Date.now();
    }
    await userList.save();
  } catch (err) {
    console.error("Error updating user list:", err);
  }
}

server.listen(5000, () => {
  console.log("Server listening on port 5000");
});
