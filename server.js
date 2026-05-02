const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname)));

// Get port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Game rooms storage
const rooms = {};
const users = {};
const matchmakingQueue = []; // Queue for random matchmaking

// Utility to generate room ID
function generateRoomId() {
  return 'room_' + Math.random().toString(36).substr(2, 9);
}

// Utility to generate player ID
function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Matchmaking function - pairs two waiting players
function tryMatchPlayers() {
  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift();
    const player2 = matchmakingQueue.shift();

    const roomId = generateRoomId();

    rooms[roomId] = {
      id: roomId,
      players: [player1.playerId, player2.playerId],
      sockets: [player1.socketId, player2.socketId],
      playerDetails: {
        [player1.playerId]: player1.user,
        [player2.playerId]: player2.user
      },
      gameState: {
        moves: [],
        board: null,
        turn: 'w',
        gameOver: false
      },
      isMatchmade: true
    };

    // Notify both players
    io.to(player1.socketId).emit('game-started', {
      roomId: roomId,
      players: [
        { playerId: player1.playerId, name: player1.user.name, color: 'w' },
        { playerId: player2.playerId, name: player2.user.name, color: 'b' }
      ],
      yourColor: 'w',
      playerId: player1.playerId
    });

    io.to(player2.socketId).emit('game-started', {
      roomId: roomId,
      players: [
        { playerId: player1.playerId, name: player1.user.name, color: 'w' },
        { playerId: player2.playerId, name: player2.user.name, color: 'b' }
      ],
      yourColor: 'b',
      playerId: player2.playerId
    });

    console.log('Players matched in room:', roomId);
  }
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  users[socket.id] = {
    id: socket.id,
    playerId: generatePlayerId(),
    roomId: null,
    color: null,
    name: 'Player ' + Math.floor(Math.random() * 1000)
  };

  // Player creates a game room and waits for opponent (FRIENDS MODE)
  socket.on('create-game', (data) => {
    const roomId = generateRoomId();
    const user = users[socket.id];
    user.roomId = roomId;
    user.name = data?.playerName || user.name;

    rooms[roomId] = {
      id: roomId,
      players: [user.playerId],
      sockets: [socket.id],
      playerDetails: { [user.playerId]: user },
      gameState: {
        moves: [],
        board: null,
        turn: 'w',
        gameOver: false
      },
      isMatchmade: false
    };

    socket.join(roomId);
    console.log('Friend game created:', roomId, 'by', socket.id);
    socket.emit('game-created', { roomId, playerId: user.playerId, color: 'w' });
  });

  // Player joins an existing game room (FRIENDS MODE)
  socket.on('join-game', (data) => {
    const { roomId } = data;
    const room = rooms[roomId];

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const user = users[socket.id];
    user.roomId = roomId;
    user.name = data?.playerName || user.name;
    room.players.push(user.playerId);
    room.sockets.push(socket.id);
    room.playerDetails[user.playerId] = user;

    socket.join(roomId);
    console.log('Player joined friend room:', roomId);

    // Notify both players that game is starting
    io.to(roomId).emit('game-started', {
      players: room.players.map(pid => ({
        playerId: pid,
        name: room.playerDetails[pid].name,
        color: room.players[0] === pid ? 'w' : 'b'
      })),
      yourColor: room.players[0] === user.playerId ? 'w' : 'b',
      playerId: user.playerId
    });
  });

  // Find random opponent (ONLINE MODE - MATCHMAKING)
  socket.on('find-opponent', (data) => {
    const { playerName } = data;
    const user = users[socket.id];
    user.name = playerName;

    console.log('Player looking for opponent:', socket.id, playerName);

    // Add to matchmaking queue
    matchmakingQueue.push({
      socketId: socket.id,
      playerId: user.playerId,
      user: user
    });

    socket.emit('searching-for-opponent');

    // Try to match players
    tryMatchPlayers();
  });

  // Cancel matchmaking
  socket.on('cancel-search', () => {
    const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (index !== -1) {
      matchmakingQueue.splice(index, 1);
      socket.emit('search-cancelled');
      console.log('Player cancelled search:', socket.id);
    }
  });

  // List available game rooms (for matchmaking)
  socket.on('list-games', () => {
    const availableRooms = Object.values(rooms)
      .filter(room => room.players.length === 1)
      .map(room => ({
        roomId: room.id,
        playerName: room.playerDetails[room.players[0]].name
      }));
    socket.emit('games-list', availableRooms);
  });

  // Move made by player
  socket.on('make-move', (data) => {
    const { roomId, move, boardState, moveHistory } = data;
    const room = rooms[roomId];

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Update game state
    room.gameState.moves.push(move);
    room.gameState.board = boardState;
    room.gameState.moveHistory = moveHistory;
    room.gameState.enPassant = data.enPassant;
    room.gameState.castlingRights = data.castlingRights;
    room.gameState.lastMove = data.lastMove;
    room.gameState.captured = data.captured;
    room.gameState.turn = data.turn;

    // Broadcast move to opponent
    socket.to(roomId).emit('opponent-move', {
      move,
      boardState,
      moveHistory,
      enPassant: data.enPassant,
      castlingRights: data.castlingRights,
      lastMove: data.lastMove,
      captured: data.captured,
      turn: data.turn
    });

    console.log(`Move in room ${roomId}:`, move);
  });

  // Game over notification
  socket.on('game-over', (data) => {
    const { roomId, result, reason } = data;
    const room = rooms[roomId];

    if (!room) return;

    room.gameState.gameOver = true;

    // Notify opponent
    socket.to(roomId).emit('game-ended', {
      result,
      reason
    });

    console.log(`Game over in room ${roomId}: ${result} (${reason})`);
  });

  // Resign
  socket.on('resign', (data) => {
    const { roomId } = data;
    const user = users[socket.id];

    socket.to(roomId).emit('opponent-resigned', {
      playerId: user.playerId
    });
  });

  // Offer draw
  socket.on('offer-draw', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('draw-offered');
  });

  // Accept draw
  socket.on('accept-draw', (data) => {
    const { roomId } = data;
    io.to(roomId).emit('game-ended', {
      result: 'draw',
      reason: 'agreement'
    });
  });

  // Reject draw
  socket.on('reject-draw', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('draw-rejected');
  });

  // Chat message
  socket.on('send-chat', (data) => {
    const { roomId, message } = data;
    const user = users[socket.id];

    io.to(roomId).emit('receive-chat', {
      playerName: user.name,
      message,
      timestamp: new Date().toISOString()
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user && user.roomId) {
      const room = rooms[user.roomId];
      if (room) {
        // Notify opponent
        socket.to(user.roomId).emit('opponent-disconnected');

        // Clean up if room is empty
        setTimeout(() => {
          if (room.sockets.length === 0) {
            delete rooms[user.roomId];
          }
        }, 5000);
      }
    }

    delete users[socket.id];
    console.log('Player disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🎯 Chess server listening on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});