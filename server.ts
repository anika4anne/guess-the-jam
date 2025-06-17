import express from "express";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";

interface User {
  id: string;
  name: string;
}

interface Rooms {
  [roomId: string]: User[];
}

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms: Rooms = {};

const socketRooms: { [socketId: string]: string[] } = {};

io.on("connection", (socket: Socket) => {
  socket.on(
    "join-room",
    ({ roomId, name }: { roomId: string; name: string }) => {
      if (!rooms[roomId]) rooms[roomId] = [];

      const user: User = { id: socket.id, name };
      rooms[roomId].push(user);
      socket.join(roomId);

      if (!socketRooms[socket.id]) socketRooms[socket.id] = [];
      if (!socketRooms[socket.id]?.includes(roomId))
        socketRooms[socket.id]?.push(roomId);

      io.to(roomId).emit("update-players", rooms[roomId]);
    },
  );

  socket.on("disconnect", () => {
    const joinedRooms = socketRooms?.[socket.id] ?? [];

    joinedRooms.forEach((roomId) => {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((u) => u.id !== socket.id);
        io.to(roomId).emit("update-players", rooms[roomId]);
      }
    });

    delete socketRooms[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Socket server running on port ${PORT}`));
