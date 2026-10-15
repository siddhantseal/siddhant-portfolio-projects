import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const workspaces = new Map();

app.get("/health", (_request, response) => {
  response.json({ status: "ok", workspaces: workspaces.size });
});

io.on("connection", (socket) => {
  socket.on("workspace:join", ({ workspaceId }) => {
    socket.join(workspaceId);
    socket.emit("tasks:sync", workspaces.get(workspaceId) ?? []);
  });

  socket.on("tasks:update", ({ workspaceId, tasks }) => {
    workspaces.set(workspaceId, tasks);
    socket.to(workspaceId).emit("tasks:sync", tasks);
  });
});

const port = Number(process.env.PORT ?? 4000);

httpServer.listen(port, () => {
  console.log(`Socket task server running on http://localhost:${port}`);
});
