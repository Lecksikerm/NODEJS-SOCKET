const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ✅ Serve the index.html file directly for "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const users = new Set();

io.on("connection", (socket) => {
  console.log("✅ A user connected");

  // When user joins
  socket.on("join", (userName) => {
    socket.userName = userName;
    users.add(userName);

    // Notify all clients
    io.emit("userJoined", userName);
    io.emit("userList", Array.from(users));
  });

  // When user sends chat message
  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data);
  });

  // When user disconnects
  socket.on("disconnect", () => {
    if (socket.userName) {
      users.delete(socket.userName);
      io.emit("userList", Array.from(users));
      io.emit("userJoined", `${socket.userName} left the chat`);
    }
    console.log(" A user disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});


