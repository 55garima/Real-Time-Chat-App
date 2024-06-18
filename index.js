const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formateMesssage = require('./utils/messages');
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.env.PORT;
const io = socketio(server);

const botName = 'Chatnow Bot';

app.use(express.static(path.join(__dirname, 'public')));

// Runs when client connects
io.on('connection', (socket) => {
	socket.on('joinRoom', ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);

		// wlecome current user
		socket.emit(
			'message',
			formateMesssage(botName, 'Welcome to Chat Room.....')
		);

		// Broadbase when a user Connects
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				formateMesssage(botName, `${username} has joined the Chat`)
			);

		// send user and room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// Listen for chatMessage
	socket.on('chatMessage', (message) => {
		const user = getCurrentUser(socket.id);

		io.to(user.room).emit('message', formateMesssage( user.username , message));
	});
	

	// Runs when client Disconneccts
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				formateMesssage(botName, `${user.username} has Left the Chat`)
			);

			// send user and room info
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
