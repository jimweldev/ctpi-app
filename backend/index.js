require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// require routes
const authRoute = require("./routes/authRoute.js");
const seriesRoute = require("./routes/seriesRoute.js");

// express app
const app = express();

// middlewares
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/auth/", authRoute);
app.use("/api/series/", seriesRoute);

// connect to db
const PORT = process.env.PORT || 4000;

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`connecting to db & listening on port ${PORT}`);
    });

    const io = require("socket.io")(server, {
      pingTimeout: 60000, // turn off after 60 secs
      cors: {
        origin: process.env.CORS_ORIGIN,
      },
    });

    let onlineUsers = [];

    io.on("connection", (socket) => {
      // global functions
      const login = (userId) => {
        const isOnline = onlineUsers.some((onlineUser) => {
          return onlineUser.socketId === socket.id;
        });

        if (!isOnline) {
          onlineUsers.push({ socketId: socket.id, userId });

          io.emit("getOnlineUsers", onlineUsers);
        }

        socket.join(userId);
      };

      const logout = () => {
        onlineUsers = onlineUsers.filter((onlineUser) => {
          return onlineUser.socketId !== socket.id;
        });

        io.emit("getOnlineUsers", onlineUsers);
      };

      // socket functions
      socket.on("join", (roomId) => {
        socket.join(roomId);
      });

      socket.on("sendAnnouncement", (announcement) => {
        // socket.broadcast.emit('receiveAnnouncement', announcement)
        io.emit("receiveAnnouncement", announcement);
      });

      socket.on("sendNotification", (userId, notification) => {
        io.to(userId).emit("receiveNotification", notification);
      });

      socket.on("sendRooms", (roomId, rooms) => {
        socket.broadcast.to(roomId).emit("receiveRooms", rooms);
      });

      socket.on("sendSpaces", (spaceId, spaces) => {
        socket.broadcast.to(spaceId).emit("receiveSpaces", spaces);
      });

      // auth functions
      socket.on("login", (userId) => {
        login(userId);
      });

      socket.on("logout", () => {
        logout();
      });

      socket.on("disconnect", () => {
        logout();
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });
