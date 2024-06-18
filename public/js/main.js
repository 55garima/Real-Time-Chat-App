const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

// Join Chatroom
socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
	displayRoomName(room);
	displayUsers(users);
});

// Message from server
socket.on('message', (message) => {
	console.log(message);
	displayMessage(message);

	// scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// get message text
	const msg = e.target.elements.msg.value;

	// Emit message to server
	socket.emit('chatMessage', msg);

	// Clear input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
});

// Output message to DOM
function displayMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `
        <p class="meta"> ${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>
    `;

	document.querySelector('.chat-messages').appendChild(div);
}

// Add Room Name to DOM
function displayRoomName(room) {
	roomName.innerHTML = room;
}

// Add users to DOM
function displayUsers(users) {
	userList.innerHTML = `
        ${users.map((user) => `<li>${user.username}</li>`).join(' ')}
    `;
}
