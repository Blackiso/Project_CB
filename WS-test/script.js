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

token.value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjE1ODI3NDA2MDc5NDIsInVubSI6IkJsYWNraXNvIiwiZW1sIjoiYmxhY2tAZW1haWwuY29tIiwiaWF0IjoxNTg0MjkzNDc5LCJleHAiOjE1ODQ4OTgyNzl9.4EluMk09gy5tZBO60LTOZEFN-g9hYPWRPYCOCcEKXnA";

connect.addEventListener('click', () => {

	var t = token.value;
	mySocket = io.connect('http://127.0.0.1', { query: {token: t} });

	mySocket.on('connect', () => {
		insertLog('INFO', 'Socket Connected!');
	});

	mySocket.on('MESG', (data) => {
		insertLog('MESG', data);
	});

	mySocket.on('test', (data) => {
		insertLog('test', data);
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