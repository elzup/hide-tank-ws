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
const playerIds = {}
io.sockets.on('connection', function(socket) {
	let roomId = ''
	console.log(socket.id)

	socket.on('join', function(data) {
		roomId = data.roomId
		socket.join(roomId)
		if (!playerIds[roomId]) {
			playerIds[roomId] = []
		}
		const playerId = playerIds[roomId].length + 1
		socket.emit('playerId', { playerId })
		playerIds[roomId][socket.id] = true
		console.log({ playerIds })
		// 1, 2
		if (Object.keys(playerIds[roomId]).length === 2) {
			io.to(roomId).emit('start', {
				startTime: +new Date() + 10 * 1000,
				playerIds: Object.keys(playerIds[roomId]),
			})
		}
	})
	socket.on('disconnect', function(data) {
		delete playerIds[roomId][socket.id]
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
