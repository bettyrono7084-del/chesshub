# CHECKMATE - Online Chess Game

A beautiful, fully-featured chess game with online multiplayer support!

## Features

✅ **Play Online** - Real-time multiplayer chess with move synchronization
✅ **Play vs Computer** - Challenge the AI with multiple difficulty levels
✅ **Play Offline** - Local two-player mode
✅ **Chess Puzzles** - 100+ curated chess puzzles
✅ **Beautiful UI** - Dark/light theme with customizable board and pieces
✅ **Move History** - Full move notation and game replay
✅ **Full Chess Rules** - Castling, en passant, pawn promotion, check/checkmate

## Quick Start

### Installation

```bash
# Navigate to the project directory
cd "check mate"

# Install dependencies
npm install
```

### Running the Server

```bash
# Start the chess server
npm start
```

The server will start on `http://localhost:3000`

### Playing Online

1. **Open two browser windows** to the same URL: `http://localhost:3000`
2. In the first window:
   - Click "Play Online"
   - Enter your name (optional)
   - Click "Create Game"
   - Copy the room code that appears
3. In the second window:
   - Click "Play Online"
   - Enter a different name
   - Paste the room code or select from available games
   - Click "Join Game"
4. **Start playing!** The first player (creator) plays as White, the second as Black

### Alternative: Use Room Codes

Instead of sharing URLs, you can share room codes:
- Player 1: Clicks "Create Game" → Gets a room code like `room_abc12def3`
- Player 1: Shares the code with Player 2 via email, chat, etc.
- Player 2: Clicks "Join Game" → Enters the shared code → Joins the game

## Game Features

### Online Mode
- **Real-time move synchronization** - All moves sync instantly between players
- **Room system** - Each game gets a unique room code for easy sharing
- **Turn management** - Automatic turn switching with status updates
- **Resign & Draw** - Offer resignation or draw to your opponent
- **Disconnect handling** - Game saves state if player temporarily disconnects

### Computer Mode
- **4 Difficulty Levels**:
  - 🌱 Beginner - Perfect for learning
  - ⚔️ Intermediate - A fair challenge
  - 🔥 Advanced - For serious players
  - 👑 Master - Can you beat it?
- **Color selection** - Play as white, black, or random

### Offline Mode
- **Local two-player** - Play against a friend on the same computer

### Settings
- **Themes**:
  - Classic chessboard
  - Black & White
  - Vintage
  - Cool blue
- **Piece Styles**: Classic, Flame, Rainbow, Carved Wood, Staunton
- **Game Options**: Show legal moves, highlight last move, show coordinates, auto-promote to queen
- **Sound & Music**: Toggle effects and background music

## Project Structure

```
check mate/
├── checkmate.html          # Main web application (frontend + styles)
├── server.js               # Node.js/Express/Socket.io backend
├── package.json            # NPM dependencies
└── README.md              # This file
```

## How It Works

### Architecture

```
Browser 1 (Player 1)  ←→  WebSocket  ←→  Node.js Server  ←→  WebSocket  ←→  Browser 2 (Player 2)
     (White)                Server.js      (Room Manager)            (Black)
```

### Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express, Socket.io
- **Communication**: WebSocket (real-time bidirectional)
- **Game Engine**: Pure JavaScript chess implementation with full rules

### Move Flow

1. Player 1 makes a move on the board
2. Frontend validates move legality
3. Move data is sent to server via Socket.io
4. Server updates game room state and broadcasts to opponent
5. Opponent's browser receives the move
6. Board updates automatically for Player 2
7. Turn switches and both players see updated state

## Deployment

### Local Network Play

Players on the same local network can play together:

```bash
# Find your computer's IP address
# Windows: ipconfig (look for IPv4 Address)
# Mac/Linux: ifconfig (look for inet)

# In Player 2's browser, use: http://YOUR_IP:3000
```

### Hosting Online

For online play over the internet:

1. **Deploy to a cloud service** (Heroku, Railway, Render, AWS, etc.)
2. Update the frontend to connect to your server URL
3. Share the link with friends

Example for Railway/Render:
- They provide a public URL for your app
- Both players connect to that URL
- No local setup needed!

## Troubleshooting

### "Connection refused" error
- Make sure `npm start` is running
- Check that you're using `http://localhost:3000` (not https)
- Try reloading the page

### Moves not syncing
- Check browser console (F12) for errors
- Make sure both windows are on the same game room
- Try refreshing both pages

### Can't see opponent's moves
- Verify both players are in the same room code
- Check network connection
- Try creating a new game

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Supported (responsive design)

## Future Enhancements

- [ ] User accounts and ratings
- [ ] Game history and statistics
- [ ] Chat/messaging during games
- [ ] Time controls (blitz, rapid, classical)
- [ ] Tournament mode
- [ ] Mobile app
- [ ] Spectator mode
- [ ] lichess.org integration

## License

This project is open source. Feel free to modify and enhance it!

## Quick Reference

| Action | How To |
|--------|--------|
| Create game | Click "Create Game" on Play Online page |
| Join game | Enter room code and click "Join" |
| Make move | Click a piece, then click a square |
| Resign | Click "Resign" button |
| Offer draw | Click "Offer Draw" button |
| Change theme | Go to Settings → Chessboard & Pieces |

Enjoy your games! ♟️
