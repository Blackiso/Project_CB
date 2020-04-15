var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1ZTdiZmNiNGNiZWRjNjAzN2QxNGNjODQiLCJ1bm0iOiJCbGFja2lzbyIsImVtbCI6ImJsYWNrQGVtYWlsLmNvbSIsImlhdCI6MTU4NjI5NTg1MiwiZXhwIjoxNTg2OTAwNjUyfQ.LKXYZq0HZUtLjfkztW88v2J0IS__Ffrpa-rXPY9djHg";
var mySocket;
var roomId;

//HTML Elems
var roomLobby = document.querySelector('#roomLobby');
var roomLobbyJoin = document.querySelector('#joinRoom');
var roomLobbyCreate = document.querySelector('#createRoom');
var connect = document.querySelector('#connect');
var jRoomName = document.querySelector('#jRoomName');
var cRoomName = document.querySelector('#cRoomName');
var tokenInput = document.querySelector('#tokenInput');
var userAuthPage = document.querySelector('#userAuth');
var usernameL = document.querySelector('#usernameL');
var passwordL = document.querySelector('#passwordL');
var loginBtn = document.querySelector('#login');
var messagesCont = document.querySelector('#messagesCont');
var messageInput = document.querySelector('#messageInput');
var roomName = document.querySelector('#roomName');
var onlineUsers = document.querySelector('#onlineUsers');


function ajax(metod, link, body, call, t = null) {
	var json = json;
	var http = new XMLHttpRequest();
	http.open(metod, link);
	http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	if (t) http.setRequestHeader('Authorization', 'Bearer ' + t);
	http.send(JSON.stringify(body));
	http.onload = () => {
		var data;
		if (http.responseText !== '') data = JSON.parse(http.responseText);
		call(data);
	}
}

// <div class="message-blob me">
// 	<span>Blackiso</span>
// 	<p>sdf</p>
// </div>

function newMessage(username, msg) {
	var div = document.createElement('DIV');
	var span = document.createElement('SPAN');
	var p = document.createElement('P');

	div.classList.add('message-blob');
	if (username.toLowerCase() == usernameL.value.toLowerCase()) div.classList.add('me');
	span.innerHTML = username;
	p.innerHTML = msg;
	div.appendChild(span);
	div.appendChild(p);
	messagesCont.appendChild(div);
	messagesCont.scrollTop = messagesCont.scrollHeight;
}

function newInfo(msg) {
	var span = document.createElement('SPAN');
	span.classList.add('info');
	span.innerHTML = msg;
	messagesCont.appendChild(span);
	messagesCont.scrollTop = messagesCont.scrollHeight;
}

// <div class="user">
// 	<span>Blackiso</span>
// </div>

function newUsersList(users) {
	onlineUsers.innerHTML = "";
	users.forEach(user => {
		var div = document.createElement('DIV');
		var span = document.createElement('SPAN');

		div.classList.add('user');
		span.innerHTML = user.username;
		div.appendChild(span);
		onlineUsers.appendChild(div);
	});
}

function connectSocket() {
	mySocket = io.connect('http://127.0.0.1', { query: { token: token } });

	mySocket.on('connect', () => {
		console.log('Connected to ', mySocket.id);
	});

	mySocket.on('MESG', (data) => {
		var msg = JSON.parse(data);
		console.log(msg);
		newMessage(msg.user.username, msg.msg);
	});

	mySocket.on('INFO', (data) => {
		console.log('INFO ', data);
		newInfo(data);
	});

	mySocket.on('USERS', (data) => {
		console.log(data);
		newUsersList(data);	
	});
}

function login(username, password) {
	console.log('INFO', 'Logging in...');
	ajax('POST', 'http://127.0.0.1/api/authentication/login', {
		username: username,
		password: password
	}, (data) => {
		console.log(data);
		if (data.token) {
			token = data.token;
			userAuthPage.classList.add('hide');
			connectSocket();
		}
	});
}

function joinRoom(room) {
	console.log('INFO', 'Joining '+room+'...');
	ajax('POST', 'http://127.0.0.1/api/rooms/join', {
		room: room,
		sid: mySocket.id
	}, (data) => {

		console.log(data);

		if (data._id) {
			roomId = data._id;
			roomName.innerHTML = data.room_name;
			roomLobby.classList.add('hide');
			getMessages();
		}

	}, token);
}

function createRoom(room) {

}

function sendMessage(msg) {
	ajax('POST', 'http://127.0.0.1/api/room/'+roomId+'/messages', { msg: msg }, () => {
		console.log('!');
	}, token);
}

function getMessages() {
	ajax('GET', 'http://127.0.0.1/api/room/'+roomId+'/messages/list', { }, (data) => {
		console.log(data);
		data.forEach(msg => {
			newMessage(msg.user.username, msg.msg);
		});
	}, token);
}


roomLobbyJoin.addEventListener('click', () => {
	joinRoom(jRoomName.value);
});

roomLobbyCreate.addEventListener('click', () => {
	createRoom(cRoomName.value);
});

// connect.addEventListener('click', () => {
// 	token = tokenInput.value || token;
// 	connectSocket();
// });

loginBtn.addEventListener('click', () => {
	login(usernameL.value, passwordL.value);
});

messageInput.addEventListener('keypress', (e) => {
	if (e.key == 'Enter') {
		sendMessage(messageInput.value);
		messageInput.value = "";
	}
});