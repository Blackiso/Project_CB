function insertLog(type, msg) {
	let container = document.querySelector('.log');
	let span = document.createElement('SPAN');
	let date = new Date();

	span.innerHTML = "["+date.toLocaleString()+"]"+" ["+type+"] "+msg;
	container.prepend(span);
}

var mySocket;
var connect = document.querySelector('#connect');
var disconnect = document.querySelector('#disconnect');
var send = document.querySelector('#send');
var msg = document.querySelector('#msg');
var token = document.querySelector('#token');
var room = document.querySelector('#room');
var join = document.querySelector('#join');

token.value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1ZTdiZmNiNGNiZWRjNjAzN2QxNGNjODQiLCJ1bm0iOiJCbGFja2lzbyIsImVtbCI6ImJsYWNrQGVtYWlsLmNvbSIsImlhdCI6MTU4NTE4NDIxMywiZXhwIjoxNTg1Nzg5MDEzfQ.PTHEXgaYu9PL2jspDIZorPDvKX3e5NGki0YHAZHsPxw";

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

	disconnect.addEventListener('click', () => {
		mySocket.disconnect();
		insertLog('INFO', 'Socket Disconnected!');
	});

	send.addEventListener('click', () => {
		mySocket.emit('MESG', msg.value);
		insertLog('MESG', 'Message Sent '+msg.value);
	});

});