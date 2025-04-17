const express = require('express');
const helmet = require('helmet');
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const port=5000;

const server = http.createServer(app);
const io = socketio(server);

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.socket.io"],
            "style-src": ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            "connect-src": ["'self'", "https://cdn.socket.io"],
            "img-src": ["'self'", "data:", "https://*.tile.openstreetmap.org", "https://cdnjs.cloudflare.com", "http://localhost:3000"],
            "font-src": ["'self'", "https://cdnjs.cloudflare.com"],
        },
    },
}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
    console.log(`New client connected: ${socket.id}`); 

    socket.on("send-location", function(data) {
        console.log(`Location received from ${socket.id}:`, data); 
        io.emit("receive-location", { id: socket.id, ...data }); 
    });

    socket.on("disconnect", function() {
        console.log(`Client disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", function(req, res) {
    res.render("index");
});

server.listen(port, () => {
    console.log('Server is running on 5000');
});
