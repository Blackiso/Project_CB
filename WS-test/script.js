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
var host = document.querySelector('#host');

connect.addEventListener('click', () => {

	var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjE1ODI3NDA2MDc5NDIsInVubSI6IkJsYWNraXNvIiwiZW1sIjoiYmxhY2tAZW1haWwuY29tIiwiaWF0IjoxNTg0MjkzNDc5LCJleHAiOjE1ODQ4OTgyNzl9.4EluMk09gy5tZBO60LTOZEFN-g9hYPWRPYCOCcEKXnA";
	var hv = host.value == '' ? 'http://127.0.0.1' : host.value;
	mySocket = io.connect(hv, { query: {token: token} });

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