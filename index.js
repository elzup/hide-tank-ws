// Setup basic express server
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const socketio = require('socket.io')

const port = process.env.PORT || 3001
server.listen(port, () => {
	console.log('Server listening at port %d', port)
})

const io = socketio.listen(server)

// S04. connectionイベントを受信する
io.sockets.on('connection', function(socket) {
	let roomId = ''
	const playerIds = []

	socket.on('join', function(data) {
		roomId = data.roomId
		socket.join(roomId)
		const playerId = playerIds.length + 1
		socket.emit('playerId', { playerId })
		playerIds.push(playerId)
		// 1, 2
		if (playerIds.length === 2) {
			io.to(roomId).emit('start', {
				startTime: +new Date() + 10 * 1000,
				playerIds,
			})
		}
	})

	socket.on('playerMove', function(data) {
		io.to(roomId).emit('playerMove', data)
	})
	socket.on('bulletMove', function(data) {
		io.to(roomId).emit('playerMove', data)
	})
	socket.on('damaged', function(data) {
		io.to(roomId).emit('playerMove', data)
	})
	socket.on('disconnect', function() {})
})
