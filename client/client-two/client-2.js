import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});

socket.on("message", (msg) => {
    console.log("Message received on client two:", msg);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("server-one-message", (msg) => {
    console.log("Client One : from Server One:", msg);
    socket.emit("message", msg);
});

socket.emit("join-room", {
    client: "client-two",
    room: "server-one-room"
});