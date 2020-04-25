var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1ZTdiZmNiNGNiZWRjNjAzN2QxNGNjODQiLCJ1bm0iOiJCbGFja2lzbyIsImVtbCI6ImJsYWNrQGVtYWlsLmNvbSIsImlhdCI6MTU4NjI5NTg1MiwiZXhwIjoxNTg2OTAwNjUyfQ.LKXYZq0HZUtLjfkztW88v2J0IS__Ffrpa-rXPY9djHg";
var mySocket;
var host = location.host.split(':')[0];
var roomId;
var global_room;
var global_username;
var global_room_username;
var global_messages = [];
var global_users;
var global_banned_users = [];

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
var usernameR = document.querySelector('#usernameR');
var passwordR = document.querySelector('#passwordR');
var emailR = document.querySelector('#emailR');
var registerBtn = document.querySelector('#register');
var messagesCont = document.querySelector('#messagesCont');
var messageInput = document.querySelector('#messageInput');
var roomName = document.querySelector('#roomName');
var onlineUsers = document.querySelector('#onlineUsers');
var bannedUsers = document.querySelector('#bannedUsers');


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

function newMessage(id, username, msg, admin = false, del = false) {
	var div = document.createElement('DIV');
	var span = document.createElement('SPAN');
	var span2 = document.createElement('DIV');
	var p = document.createElement('P');

	div.classList.add('message-blob');
	if (is_me(username)) div.classList.add('me');
	if (del) p.classList.add('ital');
	span.innerHTML = username;
	span2.innerHTML = 'delete';
	span2.classList.add('deleteMsg');
	span2.dataset.id = id;
	span2.onclick = deleteMessage;
	p.innerHTML = msg;
	div.appendChild(span);
	div.appendChild(p);
	if (admin) div.appendChild(span2);
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

function newUsersList(users, container, is_ban = false) {
	if (global_room == null) {
		setTimeout(() => {
			newUsersList(users, onlineUsers);
		}, 5);
		return;
	}
	container.innerHTML = "";
	users.forEach(user => {
		var div = document.createElement('DIV');
		var span = document.createElement('SPAN');
		var btn1 = document.createElement('BUTTON');
		var btn2 = document.createElement('BUTTON');

		div.classList.add('user');
		if (user.is_mod) div.style.background = 'pink';
		if (user.is_admin) div.style.background = 'red';
		span.innerHTML = user.username;
		btn1.innerHTML = is_ban ? 'Unban user' : 'Ban user';
		btn2.innerHTML = user.is_mod ? 'Unmod user' : 'Mod user';
		btn1.onclick = banUser
		btn2.onclick = modUser;
		btn1.dataset.id = user._id;
		btn2.dataset.id = user._id;
		div.appendChild(span);

		if (!is_me(user.username) && !user.is_admin && (global_room.user.is_admin || global_room.user.is_mod)) div.appendChild(btn1);
		if (!is_me(user.username) && global_room.user.is_admin && !is_ban) div.appendChild(btn2);
		container.appendChild(div);
	});
}

function is_me(username) {
	return username.toLowerCase() == global_username.toLowerCase();
}

function getUser(id) {
	return global_users.find(u => u._id == id);
}

function connectSocket() {
	mySocket = io.connect('http://'+host, { query: { token: token } });

	mySocket.on('connect', () => {
		console.log('Connected to ', mySocket.id);
	});

	mySocket.on('MESG', (data) => {
		global_messages.push(data);
		displayMessages();
	});

	mySocket.on('MESG_DEL', (data) => {
		global_messages.forEach(msg => {
			if (msg._id == data._id) {
				msg.deleted = data.deleted;
				msg.msg = data.msg;
			}
		});
		displayMessages();
	});

	mySocket.on('INFO', (data) => {
		console.log('INFO ', data);
		global_messages.push(data);
		displayMessages();
	});

	mySocket.on('USERS', (data) => {
		console.log(data);
		global_users = data;
		newUsersList(data, onlineUsers);	
		getBanned(roomId);
	});

	mySocket.on('ROOM_UPDATE', () => {
		getRoom(global_room._id);
	});

	mySocket.on('BANNED', (data) => {
		if (data._id == global_room._id) {
			roomId = null;
			roomName.innerHTML = null;
			global_room_username = null;
			global_room = null;
			global_users = [];
			roomLobby.classList.remove('hide');
		}
	});

	mySocket.on('USER_BANNED', (data) => {
		global_banned_users.push(data);
		newUsersList(global_banned_users, bannedUsers, true);
	});
}

function login(username, password) {
	console.log('INFO', 'Logging in...');
	ajax('POST', 'http://'+host+'/api/authentication/login', {
		username: username,
		password: password
	}, (data) => {
		console.log(data);
		if (data.token) {
			token = data.token;
			global_username = username;
			userAuthPage.classList.add('hide');
			connectSocket();
		}
	});
}

function register(username, email, password) {
	console.log('INFO', 'Logging in...');
	ajax('POST', 'http://'+host+'/api/authentication/register', {
		username: username,
		password: password,
		email: email
	}, (data) => {
		console.log(data);
		if (data.token) {
			token = data.token;
			global_username = username;
			userAuthPage.classList.add('hide');
			connectSocket();
		}
	});
}

function joinRoom(room) {
	console.log('INFO', 'Joining '+room+'...');
	ajax('POST', 'http://'+host+'/api/rooms/join', {
		room: room,
		sid: mySocket.id
	}, (data) => {

		console.log(data);

		if (data._id) {
			roomId = data._id;
			roomName.innerHTML = data.room_name;
			global_room_username = data.room_owner.username;
			global_room = data;
			roomLobby.classList.add('hide');
			getMessages();
		}

	}, token);
}

function createRoom(room) {
	console.log('INFO', 'Creating '+room+'...');
	ajax('POST', 'http://'+host+'/api/rooms/create', {
		name: room,
		privacy: 'public',
		sid: mySocket.id
	}, (data) => {

		console.log(data);

		if (data._id) {
			roomId = data._id;
			roomName.innerHTML = data.room_name;
			global_room_username = data.room_owner.username;
			global_room = data;
			roomLobby.classList.add('hide');
			getMessages();
		}

	}, token);
}

function getRoom(id) {

	console.log('Getting room..');

	ajax('GET', 'http://'+host+'/api/rooms/'+id, {}, (data) => {

		console.log(data);

		if (data._id) {
			roomId = data._id;
			roomName.innerHTML = data.room_name;
			global_room_username = data.room_owner.username;
			global_room = data;
			displayMessages();
			newUsersList(global_users, onlineUsers);
		}

	}, token);
}


function getBanned(id) {

	console.log('Getting banned..');

	ajax('GET', 'http://'+host+'/api/rooms/'+id+'/banned', {}, (data) => {

		console.log(data);
		global_banned_users = data;
		newUsersList(global_banned_users, bannedUsers, true);

	}, token);
}

function sendMessage(msg) {
	ajax('POST', 'http://'+host+'/api/room/'+roomId+'/messages', { msg: msg }, () => {
		console.log('!');
	}, token);
}

function getMessages() {
	ajax('GET', 'http://'+host+'/api/room/'+roomId+'/messages/list', { }, (data) => {
		console.log(data);
		global_messages = global_messages.concat(data);
		console.log('g => ', global_messages);
		displayMessages();
	}, token);
}

function deleteMessage(e) {
	let id = e.currentTarget.dataset.id;
	ajax('DELETE', 'http://'+host+'/api/room/'+roomId+'/messages/'+id, { }, (data) => {
		console.log('deleted');	
	}, token);
}

function modUser(e) {
	let id = e.currentTarget.dataset.id;
	ajax('POST', 'http://'+host+'/api/rooms/'+roomId+'/users/'+id+'/mod', { }, (data) => {
		console.log('moded');	
	}, token);
}

function banUser(e) {
	let id = e.currentTarget.dataset.id;
	ajax('POST', 'http://'+host+'/api/rooms/'+roomId+'/users/'+id+'/ban', { }, (data) => {

	}, token);
}


function displayMessages() {
	messagesCont.innerHTML = '';
	global_messages.forEach(data => {
		if (data.type == 'info') {
			newInfo(data.msg);
		}else {
			let x = global_room.user.is_admin || global_room.user.is_mod;
			newMessage(data._id, data.user.username, data.msg, x, data.deleted);
		}	
	});
}

function removeBanned(id) {
	global_banned_users = global_banned_users.filter(u => u._id !== id);
	newUsersList(global_banned_users, bannedUsers, true);
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

registerBtn.addEventListener('click', () => {
	register(usernameR.value, emailR.value, passwordR.value);
});

messageInput.addEventListener('keypress', (e) => {
	if (e.key == 'Enter') {
		sendMessage(messageInput.value);
		messageInput.value = "";
	}
});