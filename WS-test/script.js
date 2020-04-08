function insertLog(type, msg) {
	let container = document.querySelector('.log');
	let span = document.createElement('SPAN');
	let date = new Date();

	span.innerHTML = "["+date.toLocaleString()+"]"+" ["+type+"] "+msg;
	container.prepend(span);
}

function ajax(metod, link, body, call, token) {
	var json = json;
	var http = new XMLHttpRequest();
	http.open(metod, link);
	http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	http.setRequestHeader('Authorization', 'Bearer ' + token);
	http.send(JSON.stringify(body));
	http.onload = () => {
		var data = JSON.parse(http.responseText);
		call(data);
	}
}

var mySocket;
var connect = document.querySelector('#connect');
var disconnect = document.querySelector('#disconnect');
var send = document.querySelector('#send');
var msg = document.querySelector('#msg');
var token = document.querySelector('#token');
var room = document.querySelector('#room');
var join = document.querySelector('#join');

token.value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1ZTdiZmNiNGNiZWRjNjAzN2QxNGNjODQiLCJ1bm0iOiJCbGFja2lzbyIsImVtbCI6ImJsYWNrQGVtYWlsLmNvbSIsImlhdCI6MTU4NjI5NTg1MiwiZXhwIjoxNTg2OTAwNjUyfQ.LKXYZq0HZUtLjfkztW88v2J0IS__Ffrpa-rXPY9djHg";
room.value = "Black_room";

var mySocket;

connect.addEventListener('click', () => {

	var t = token.value;
	mySocket = io.connect('http://127.0.0.1', { query: {token: t} });

	mySocket.on('connect', () => {
		insertLog('INFO', 'Socket Connected!');
		insertLog('INFO', mySocket.id);

	});

	mySocket.on('MESG', (data) => {
		insertLog('MESG', data);
	});

	mySocket.on('INFO', (data) => {
		insertLog('INFO', data);
	});

	mySocket.on('USERS', (data) => {

		data.forEach(user => {
			insertLog('ONLINE', user.username);
		});
		
	});

});

disconnect.addEventListener('click', () => {
	mySocket.disconnect();
	insertLog('INFO', 'Socket Disconnected!');
});

send.addEventListener('click', () => {
	mySocket.emit('MESG', msg.value);
	insertLog('MESG', 'Message Sent '+msg.value);
});

join.addEventListener('click', () => {
	insertLog('INFO', 'Joining '+room.value+'...');
	ajax('POST', 'http://127.0.0.1/api/rooms/join', {
		room: room.value,
		sid: mySocket.id
	}, (data) => {
		console.log(data);
	}, token.value);
});