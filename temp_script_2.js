
// ===== SETTINGS =====
const settings = {
  legalMoves: true,
  highlightLast: true,
  showCoords: true,
  checkIndicator: true,
  autoQueen: true,
  openingNames: true,
  haptics: true,
  sounds: true,
  music: false,
  darkMode: true,
  boardTheme: 'default',
  pieceTheme: 'classic'
};

const moveSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
const captureSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');

function playMoveSound(isCapture) {
  if (!settings.sounds) return;
  const sound = isCapture ? captureSound : moveSound;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function saveSettings() {
  localStorage.setItem('checkmate_settings', JSON.stringify(settings));
}

function loadSettings() {
  const stored = localStorage.getItem('checkmate_settings');
  if (stored) {
    Object.assign(settings, JSON.parse(stored));
  }
  // Apply settings to UI/Visuals
  applyDarkMode(settings.darkMode);
  applyBoardTheme(settings.boardTheme);
  applyPieceTheme(settings.pieceTheme);
  toggleMusic(settings.music);

  // Update controls
  if(document.getElementById('toggle-dark')) document.getElementById('toggle-dark').checked = settings.darkMode;
  if(document.getElementById('toggle-legal')) document.getElementById('toggle-legal').checked = settings.legalMoves;
  if(document.getElementById('toggle-highlight')) document.getElementById('toggle-highlight').checked = settings.highlightLast;
  if(document.getElementById('toggle-coords')) document.getElementById('toggle-coords').checked = settings.showCoords;
  if(document.getElementById('toggle-check')) document.getElementById('toggle-check').checked = settings.checkIndicator;
  if(document.getElementById('toggle-promote')) document.getElementById('toggle-promote').checked = settings.autoQueen;
  if(document.getElementById('toggle-openings')) document.getElementById('toggle-openings').checked = settings.openingNames;
  if(document.getElementById('toggle-sounds')) document.getElementById('toggle-sounds').checked = settings.sounds;
  if(document.getElementById('toggle-haptics')) document.getElementById('toggle-haptics').checked = settings.haptics;
  if(document.getElementById('toggle-music')) document.getElementById('toggle-music').checked = settings.music;
  if(document.getElementById('board-select')) document.getElementById('board-select').value = settings.boardTheme;
  if(document.getElementById('pieces-select')) document.getElementById('pieces-select').value = settings.pieceTheme;
}

function toggleMusic(enabled) {
  settings.music = enabled;
  const musicEl = document.getElementById('background-music');
  if (!musicEl) return;
  if (enabled) {
    const promise = musicEl.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Autoplay may be blocked by browser; do nothing.
      });
    }
  } else {
    musicEl.pause();
    musicEl.currentTime = 0;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initAccountSection();
  populateProfileFromStorage();
});

// ===== ACCOUNT STORAGE =====
const ACCOUNT_STORAGE_KEY = 'checkmate_account';
const ACCOUNT_SESSION_KEY = 'checkmate_logged_in';

function getStoredAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY)) || null;
  } catch (e) {
    return null;
  }
}

function setStoredAccount(account) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

function getLoggedInUsername() {
  return localStorage.getItem(ACCOUNT_SESSION_KEY);
}

function setLoggedInUsername(username) {
  if (username) {
    localStorage.setItem(ACCOUNT_SESSION_KEY, username);
  } else {
    localStorage.removeItem(ACCOUNT_SESSION_KEY);
  }
}

function initAccountSection() {
  const storedAccount = getStoredAccount();
  const loggedInUser = getLoggedInUsername();
  document.getElementById('account-message').textContent = '';

  if (storedAccount && loggedInUser === storedAccount.username) {
    showLoggedInState(storedAccount.username);
    applyAccountToProfile(storedAccount);
    return;
  }

  if (storedAccount) {
    showLoginAccount();
    document.getElementById('account-status').textContent = 'Account exists. Please sign in.';
    return;
  }

  showCreateAccount();
  document.getElementById('account-status').textContent = 'No account found. Create one to save your profile.';
}

function showLoginAccount() {
  document.getElementById('account-login').style.display = 'block';
  document.getElementById('account-create').style.display = 'none';
  document.getElementById('account-logged-in').style.display = 'none';
  document.getElementById('account-message').textContent = '';
}

function showCreateAccount() {
  document.getElementById('account-login').style.display = 'none';
  document.getElementById('account-create').style.display = 'block';
  document.getElementById('account-logged-in').style.display = 'none';
  document.getElementById('account-message').textContent = '';
}

function showLoggedInState(username) {
  document.getElementById('account-login').style.display = 'none';
  document.getElementById('account-create').style.display = 'none';
  document.getElementById('account-logged-in').style.display = 'block';
  document.getElementById('account-name-display').textContent = username;
  document.getElementById('account-status').textContent = 'Logged in.';
  document.getElementById('account-message').textContent = '';
}

function createAccount() {
  const username = document.getElementById('account-create-username').value.trim();
  const password = document.getElementById('account-create-password').value;
  const confirm = document.getElementById('account-create-password-confirm').value;
  const message = document.getElementById('account-message');

  if (!username || !password || !confirm) {
    message.textContent = 'Please fill in all fields to create an account.';
    return;
  }
  if (password !== confirm) {
    message.textContent = 'Passwords do not match.';
    return;
  }

  if (getStoredAccount()) {
    message.textContent = 'An account already exists. Please log in instead.';
    showLoginAccount();
    return;
  }

  const account = {
    username,
    password,
    profile: {
      name: username,
      bio: '',
      elo: 1200,
      wins: 0,
      losses: 0,
      draws: 0
    }
  };

  setStoredAccount(account);
  setLoggedInUsername(username);
  showLoggedInState(username);
  applyAccountToProfile(account);
  message.textContent = 'Account created successfully.';
}

function loginAccount() {
  const username = document.getElementById('account-login-username').value.trim();
  const password = document.getElementById('account-login-password').value;
  const storedAccount = getStoredAccount();
  const message = document.getElementById('account-message');

  if (!storedAccount) {
    message.textContent = 'No account exists yet. Please create one.';
    showCreateAccount();
    return;
  }

  if (username !== storedAccount.username || password !== storedAccount.password) {
    message.textContent = 'Incorrect username or password.';
    return;
  }

  setLoggedInUsername(username);
  showLoggedInState(username);
  applyAccountToProfile(storedAccount);
  message.textContent = 'Logged in successfully.';
}

function logoutAccount() {
  setLoggedInUsername(null);
  document.getElementById('account-status').textContent = 'Signed out. You can log in again.';
  showLoginAccount();
}

function applyAccountToProfile(account) {
  if (!account?.profile) return;
  document.getElementById('profile-name').value = account.profile.name || account.username;
  document.getElementById('profile-bio').value = account.profile.bio || '';
}

function populateProfileFromStorage() {
  const storedAccount = getStoredAccount();
  const loggedInUser = getLoggedInUsername();

  if (storedAccount && loggedInUser === storedAccount.username) {
    applyAccountToProfile(storedAccount);
  }
}

function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const bio = document.getElementById('profile-bio').value.trim();
  const loggedInUser = getLoggedInUsername();
  const message = document.getElementById('account-message');

  if (loggedInUser) {
    const storedAccount = getStoredAccount();
    if (storedAccount && storedAccount.username === loggedInUser) {
      storedAccount.profile.name = name || storedAccount.username;
      storedAccount.profile.bio = bio;
      setStoredAccount(storedAccount);
      message.textContent = 'Profile updated for ' + storedAccount.username + '.';
      return;
    }
  }

  localStorage.setItem('checkmate_profile', JSON.stringify({ name, bio }));
  alert('Profile saved! Welcome, ' + name + '!');
}

// ===== OPENINGS DB =====
const openings = {
  'e4': 'King\'s Pawn Opening',
  'e4 e5': 'Open Game',
  'e4 e5 Nf3': 'King\'s Knight Opening',
  'e4 e5 Nf3 Nc6': 'Three Knights / Ruy Lopez Setup',
  'd4': 'Queen\'s Pawn Opening',
  'd4 d5': 'Closed Game',
  'e4 c5': 'Sicilian Defense',
  'e4 e6': 'French Defense',
  'e4 c6': 'Caro-Kann Defense',
  'd4 Nf6': 'Indian Defense',
};

// ===== CHESS ENGINE =====
const PIECES = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

const INITIAL_BOARD = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR']
];

class GameState {
  constructor(id, vsComputer = false, playerColor = 'w', difficulty = 'easy') {
    this.id = id;
    this.vsComputer = vsComputer;
    this.playerColor = playerColor;
    this.difficulty = difficulty;
    this.board = INITIAL_BOARD.map(r => [...r]);
    this.turn = 'w';
    this.selected = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.moveStrings = [];
    this.lastMove = null;
    this.captured = { w: [], b: [] };
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassant = null;
    this.gameOver = false;
    this.pendingPromotion = null;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const games = {};
let activeGame = null;
let currentFriend = null;

// Drag and drop state for mobile
let touchDrag = { active: false, g: null, el: null, mode: 'main', start: null, origin: { x: 0, y: 0 } };

function getSqAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const sq = el?.closest('.sq');
  if (!sq) return null;
  return { rank: parseInt(sq.dataset.rank), file: parseInt(sq.dataset.file) };
}

document.addEventListener('touchmove', e => {
  if (!touchDrag.active) return;
  e.preventDefault();
  const t = e.touches[0];
  const dx = t.clientX - touchDrag.origin.x;
  const dy = t.clientY - touchDrag.origin.y;
  touchDrag.el.style.transition = 'none';
  touchDrag.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.4)`;
  touchDrag.el.style.zIndex = '1000';
}, { passive: false });

document.addEventListener('touchend', e => {
  if (!touchDrag.active) return;
  const t = e.changedTouches[0];
  const dest = getSqAt(t.clientX, t.clientY);
  const g = touchDrag.g;
  const from = touchDrag.start;
  const el = touchDrag.el;
  const mode = touchDrag.mode;

  const isLegal = dest && g.legalMoves.some(m => m[0] === dest.rank && m[1] === dest.file);
  
  // Smooth snap animation using a "back-out" easing for a tactile feel
  el.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  if (isLegal) {
    const boardId = mode === 'puzzle' ? 'puzzle-board' : 'board-' + g.id;
    const destSq = document.querySelector(`#${boardId} .sq[data-rank="${dest.rank}"][data-file="${dest.file}"]`);
    const startRect = el.parentElement.getBoundingClientRect();
    const destRect = destSq.getBoundingClientRect();
    
    // Calculate translation to the exact center of the destination square
    const tx = destRect.left - startRect.left;
    const ty = destRect.top - startRect.top;
    el.style.transform = `translate(${tx}px, ${ty}px) scale(1)`;

    // Add haptic feedback for mobile
    if (navigator.vibrate && settings.haptics) {
      const isCapture = g.board[dest.rank][dest.file] || (g.board[from[0]][from[1]][1] === 'P' && from[1] !== dest.file);
      
      // Simulate move to see if it delivers a check (rewarding feedback)
      const testBoard = g.board.map(r => [...r]);
      const p = testBoard[from[0]][from[1]];
      if (p[1] === 'P' && from[1] !== dest.file && !testBoard[dest.rank][dest.file]) testBoard[from[0]][dest.file] = null;
      testBoard[dest.rank][dest.file] = p;
      testBoard[from[0]][from[1]] = null;
      const deliversCheck = isInCheck(testBoard, g.turn === 'w' ? 'b' : 'w');

      if (deliversCheck) {
        navigator.vibrate([70, 50, 70, 50, 70]); // Triumphant triple pulse
      } else {
        navigator.vibrate(isCapture ? [60, 40, 60] : 40);
      }
    }

    setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.zIndex = '';
      if (mode === 'puzzle') {
        if (makePuzzleMove(g, from, [dest.rank, dest.file]) && !g.pendingPromotion) {
          afterPuzzleMove();
        }
      } else {
        makeMove(g, from, [dest.rank, dest.file]);
      }
    }, 250);
  } else {
    // Smoothly return to origin square if the move was invalid
    el.style.transform = 'translate(0, 0) scale(1)';
    setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.zIndex = '';
      if (mode === 'puzzle') renderPuzzleBoard(g);
      else renderBoard(g);
    }, 250);
  }
  touchDrag.active = false;
});

function createGame(id, vsComputer = false, playerColor = 'w', difficulty = 'easy') {
  const g = new GameState(id, vsComputer, playerColor, difficulty);
  games[id] = g;
  renderBoard(g);
  updateMoveList(g);
  updateStatus(g);
  return g;
}

// ===== RENDER =====
function renderBoard(g) {
  const boardEl = document.getElementById('board-' + g.id);
  if (!boardEl) return;
  const flipped = g.playerColor === 'b';
  boardEl.innerHTML = '';

  // ranks[0] renders at TOP of board. For white-at-bottom: index 0 (black's back rank) at top.
  // For flipped (black-at-bottom): index 7 (white's back rank) at top.
  const ranks = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const files = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

  for (let ri = 0; ri < 8; ri++) {
    const rank = ranks[ri];
    for (let fi = 0; fi < 8; fi++) {
      const file = files[fi];
      const sq = document.createElement('div');
      sq.className = 'sq ' + ((rank + file) % 2 === 0 ? 'light' : 'dark');
      sq.dataset.rank = rank;
      sq.dataset.file = file;

      const piece = g.board[rank][file];
      if (piece) {
        const pieceEl = document.createElement('span');
        pieceEl.className = 'piece ' + (piece[0] === 'w' ? 'white-piece' : 'black-piece');
        pieceEl.textContent = PIECES[piece];
        sq.appendChild(pieceEl);

        // Add touch drag support
        pieceEl.addEventListener('touchstart', e => {
          if (g.gameOver || g.pendingPromotion) return;
          if ((g.id === 'online' || g.id === 'friends') && g.turn !== g.playerColor) return;
          if (g.vsComputer && g.turn !== g.playerColor) return;
          if (piece[0] !== g.turn) return;

          const t = e.touches[0];
          touchDrag = { active: true, g, el: pieceEl, mode: 'main', start: [rank, file], origin: { x: t.clientX, y: t.clientY } };
          g.selected = [rank, file];
          g.legalMoves = getLegalMoves(g, rank, file);

          // Highlight moves immediately
          document.querySelectorAll(`#board-${g.id} .sq`).forEach(s => {
            const r = parseInt(s.dataset.rank), f = parseInt(s.dataset.file);
            s.classList.toggle('selected', r === rank && f === file);
            const isLegal = g.legalMoves.some(m => m[0] === r && m[1] === f);
            if (isLegal) s.classList.add(g.board[r][f] ? 'legal-capture' : 'legal-move');
          });
        }, { passive: false });
      }

      // Highlights
      if (g.selected && g.selected[0] === rank && g.selected[1] === file) {
        sq.classList.add('selected');
      }

      if (settings.highlightLast && g.lastMove) {
        if ((g.lastMove.from[0] === rank && g.lastMove.from[1] === file) ||
            (g.lastMove.to[0] === rank && g.lastMove.to[1] === file)) {
          sq.classList.add('last-move');
        }
      }

      if (settings.legalMoves && g.selected) {
        const isLegal = g.legalMoves.some(m => m[0] === rank && m[1] === file);
        if (isLegal) {
          sq.classList.add(g.board[rank][file] ? 'legal-capture' : 'legal-move');
        }
      }

      if (settings.checkIndicator && isInCheck(g.board, g.turn)) {
        const kingPos = findKing(g.board, g.turn);
        if (kingPos && kingPos[0] === rank && kingPos[1] === file) {
          sq.classList.add('in-check');
        }
      }
      
      // Timer highlighting
      const whiteTimer = document.getElementById(g.id + '-timer-white');
      const blackTimer = document.getElementById(g.id + '-timer-black');
      if (whiteTimer) whiteTimer.classList.toggle('active', g.turn === 'w');
      if (blackTimer) blackTimer.classList.toggle('active', g.turn === 'b');

      sq.addEventListener('click', () => handleSquareClick(g, rank, file));
      boardEl.appendChild(sq);
    }
  }

  // Coords
  renderCoords(g, flipped, ranks, files);
}

function renderCoords(g, flipped, ranks, files) {
  const leftEl = document.getElementById('coords-left-' + g.id);
  const botEl = document.getElementById('coords-bottom-' + g.id);
  if (!leftEl || !botEl) return;

  if (!settings.showCoords) {
    leftEl.innerHTML = '';
    botEl.innerHTML = '';
    return;
  }

  leftEl.innerHTML = ranks.map(r => `<span>${8 - r}</span>`).join('');
  botEl.innerHTML = files.map(f => `<span>${String.fromCharCode(65+f)}</span>`).join('');
}

function renderAllBoards() {
  Object.values(games).forEach(g => renderBoard(g));
}

// ===== CLICK HANDLER =====
function handleSquareClick(g, rank, file) {
  if (g.gameOver || g.pendingPromotion) return;
  if (g.vsComputer && g.turn !== g.playerColor) return;
  if (g.id === 'online' && g.turn !== g.playerColor) return;

  const piece = g.board[rank][file];
  const color = piece ? piece[0] : null;

  if (g.selected) {
    const isLegal = g.legalMoves.some(m => m[0] === rank && m[1] === file);
    if (isLegal) {
      makeMove(g, g.selected, [rank, file]);
      return;
    }
    if (color === g.turn) {
      g.selected = [rank, file];
      g.legalMoves = getLegalMoves(g, rank, file);
      renderBoard(g);
      return;
    }
    g.selected = null;
    g.legalMoves = [];
    renderBoard(g);
    return;
  }

  if (color === g.turn) {
    g.selected = [rank, file];
    g.legalMoves = getLegalMoves(g, rank, file);
    renderBoard(g);
  }
}

// ===== MOVE MAKING =====
function makeMove(g, from, to, promotion = 'Q') {
  const piece = g.board[from[0]][from[1]];
  const captured = g.board[to[0]][to[1]];
  const color = piece[0];
  const type = piece[1];

  const isCapture = !!captured || (type === 'P' && from[1] !== to[1]);
  playMoveSound(isCapture);

  // Record for history
  const moveStr = getMoveString(g, from, to, piece, captured, promotion);

  // Capture
  if (captured) g.captured[color].push(captured);

  // En passant
  if (type === 'P' && to[1] !== from[1] && !captured) {
    const epRank = from[0];
    const epFile = to[1];
    g.captured[color].push(g.board[epRank][epFile]);
    g.board[epRank][epFile] = null;
  }

  // Castling
  if (type === 'K') {
    if (to[1] - from[1] === 2) {
      g.board[from[0]][5] = g.board[from[0]][7];
      g.board[from[0]][7] = null;
    } else if (from[1] - to[1] === 2) {
      g.board[from[0]][3] = g.board[from[0]][0];
      g.board[from[0]][0] = null;
    }
    if (color === 'w') { g.castlingRights.wK = false; g.castlingRights.wQ = false; }
    else { g.castlingRights.bK = false; g.castlingRights.bQ = false; }
  }

  if (type === 'R') {
    if (from[0] === 0 && from[1] === 0) g.castlingRights.bQ = false;
    if (from[0] === 0 && from[1] === 7) g.castlingRights.bK = false;
    if (from[0] === 7 && from[1] === 0) g.castlingRights.wQ = false;
    if (from[0] === 7 && from[1] === 7) g.castlingRights.wK = false;
  }

  // En passant target
  g.enPassant = (type === 'P' && Math.abs(to[0] - from[0]) === 2)
    ? [(from[0] + to[0]) / 2, from[1]] : null;

  // Promotion check
  g.board[to[0]][to[1]] = piece;
  g.board[from[0]][from[1]] = null;

  if (type === 'P' && (to[0] === 0 || to[0] === 7)) {
    if (settings.autoQueen) {
      g.board[to[0]][to[1]] = color + 'Q';
    } else {
      g.pendingPromotion = { g, to, color, moveStr };
      activeGame = g;
      showPromotionModal(color);
      g.selected = null;
      g.legalMoves = [];
      g.lastMove = { from, to };
      g.turn = g.turn === 'w' ? 'b' : 'w';
      renderBoard(g);
      return;
    }
  }

  g.lastMove = { from, to };
  g.moveHistory.push({ from, to, piece, captured });
  g.moveStrings.push(moveStr);
  g.selected = null;
  g.legalMoves = [];
  g.turn = g.turn === 'w' ? 'b' : 'w';

  updateMoveList(g);
  updateStatus(g);
  renderBoard(g);

  // Emit move to opponent if online game
  if ((g.id === 'online' || g.id === 'friends') && g.roomId) {
    socket.emit('make-move', {
      roomId: g.roomId,
      move: moveStr,
      boardState: g.board,
      moveHistory: g.moveHistory,
      enPassant: g.enPassant,
      castlingRights: g.castlingRights,
      lastMove: g.lastMove,
      captured: g.captured,
      turn: g.turn  // authoritative next turn — receiver sets it directly instead of toggling
    });
  }

  // Check game over
  if (!hasAnyLegalMove(g)) {
    if (isInCheck(g.board, g.turn)) {
      showGameOver(g.turn === 'w' ? 'Black Wins!' : 'White Wins!', 'by Checkmate ♟', g.id);
    } else {
      showGameOver('Draw!', 'Stalemate — no legal moves', g.id);
    }
    g.gameOver = true;
    return;
  }

  // Computer move
  if (g.vsComputer && g.turn !== g.playerColor && !g.gameOver) {
    setTimeout(() => makeComputerMove(g), 400);
  }
}

function showPromotionModal(color) {
  const map = { w: ['♕','♖','♗','♘'], b: ['♛','♜','♝','♞'] };
  const pieces = map[color];
  document.getElementById('promo-Q').textContent = pieces[0];
  document.getElementById('promo-R').textContent = pieces[1];
  document.getElementById('promo-B').textContent = pieces[2];
  document.getElementById('promo-N').textContent = pieces[3];
  document.getElementById('promotion-modal').classList.add('open');
}

function promotePawn(type) {
  document.getElementById('promotion-modal').classList.remove('open');
  const p = activeGame.pendingPromotion;
  if (!p) return;
  const g = p.g;
  g.board[p.to[0]][p.to[1]] = p.color + type;
  g.pendingPromotion = null;
  const fullMoveStr = p.moveStr + '=' + type;
  // Note: moveHistory and moveStrings are updated inside makeMove or handled here if promotion is manual
  g.moveStrings.push(fullMoveStr);
  updateMoveList(g);
  updateStatus(g);
  renderBoard(g);

  // Emit promotion to server for online games (makeMove returned early and skipped the emit)
  if ((g.id === 'online' || g.id === 'friends') && g.roomId) {
    socket.emit('make-move', {
      roomId: g.roomId,
      move: fullMoveStr,
      boardState: g.board,
      moveHistory: g.moveHistory,
      enPassant: g.enPassant,
      castlingRights: g.castlingRights,
      lastMove: g.lastMove,
      captured: g.captured,
      turn: g.turn
    });
  }

  if (!hasAnyLegalMove(g)) {
    if (isInCheck(g.board, g.turn)) {
      showGameOver(g.turn === 'w' ? 'Black Wins!' : 'White Wins!', 'by Checkmate ♟', g.id);
    } else {
      showGameOver('Draw!', 'Stalemate', g.id);
    }
    g.gameOver = true;
    return;
  }
  if (g.vsComputer && g.turn !== g.playerColor) {
    setTimeout(() => makeComputerMove(g), 400);
  }
}

// ===== LEGAL MOVES =====
function getLegalMoves(g, rank, file) {
  const pseudoMoves = getPseudoMoves(g.board, rank, file, g.castlingRights, g.enPassant);
  return pseudoMoves.filter(([tr, tf]) => {
    const testBoard = g.board.map(r => [...r]);
    const piece = testBoard[rank][file];
    const type = piece[1];
    // En passant capture
    if (type === 'P' && tf !== file && !testBoard[tr][tf]) {
      testBoard[rank][tf] = null;
    }
    // Castling
    if (type === 'K') {
      if (tf - file === 2) { testBoard[rank][5] = testBoard[rank][7]; testBoard[rank][7] = null; }
      if (file - tf === 2) { testBoard[rank][3] = testBoard[rank][0]; testBoard[rank][0] = null; }
    }
    testBoard[tr][tf] = testBoard[rank][file];
    testBoard[rank][file] = null;
    return !isInCheck(testBoard, piece[0]);
  });
}

function getPseudoMoves(board, rank, file, castling, ep) {
  const piece = board[rank][file];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];
  const opp = color === 'w' ? 'b' : 'w';

  const inBounds = (r, f) => r >= 0 && r < 8 && f >= 0 && f < 8;
  const isEmpty = (r, f) => inBounds(r, f) && !board[r][f];
  const isOpp = (r, f) => inBounds(r, f) && board[r][f] && board[r][f][0] === opp;
  const canCapture = (r, f) => isEmpty(r, f) || isOpp(r, f);

  const slide = (dr, df) => {
    let r = rank + dr, f = file + df;
    while (inBounds(r, f)) {
      if (board[r][f]) {
        if (board[r][f][0] === opp) moves.push([r, f]);
        break;
      }
      moves.push([r, f]);
      r += dr; f += df;
    }
  };

  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRank = color === 'w' ? 6 : 1;
    if (isEmpty(rank + dir, file)) {
      moves.push([rank + dir, file]);
      if (rank === startRank && isEmpty(rank + 2*dir, file)) moves.push([rank + 2*dir, file]);
    }
    [-1, 1].forEach(df => {
      if (isOpp(rank + dir, file + df)) moves.push([rank + dir, file + df]);
      if (ep && ep[0] === rank + dir && ep[1] === file + df) moves.push([rank + dir, file + df]);
    });
  } else if (type === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,df]) => {
      if (canCapture(rank+dr, file+df)) moves.push([rank+dr, file+df]);
    });
  } else if (type === 'B') {
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,df]) => slide(dr,df));
  } else if (type === 'R') {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,df]) => slide(dr,df));
  } else if (type === 'Q') {
    [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,df]) => slide(dr,df));
  } else if (type === 'K') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,df]) => {
      if (canCapture(rank+dr, file+df)) moves.push([rank+dr, file+df]);
    });
    // Castling
    if (color === 'w' && rank === 7 && file === 4) {
      if (castling.wK && !board[7][5] && !board[7][6] &&
          !isSquareAttacked(board,'b',7,4) && !isSquareAttacked(board,'b',7,5) && !isSquareAttacked(board,'b',7,6)) {
        moves.push([7, 6]);
      }
      if (castling.wQ && !board[7][3] && !board[7][2] && !board[7][1] &&
          !isSquareAttacked(board,'b',7,4) && !isSquareAttacked(board,'b',7,3) && !isSquareAttacked(board,'b',7,2)) {
        moves.push([7, 2]);
      }
    }
    if (color === 'b' && rank === 0 && file === 4) {
      if (castling.bK && !board[0][5] && !board[0][6] &&
          !isSquareAttacked(board,'w',0,4) && !isSquareAttacked(board,'w',0,5) && !isSquareAttacked(board,'w',0,6)) {
        moves.push([0, 6]);
      }
      if (castling.bQ && !board[0][3] && !board[0][2] && !board[0][1] &&
          !isSquareAttacked(board,'w',0,4) && !isSquareAttacked(board,'w',0,3) && !isSquareAttacked(board,'w',0,2)) {
        moves.push([0, 2]);
      }
    }
  }
  return moves;
}

function isSquareAttacked(board, byColor, rank, file) {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece[0] === byColor) {
        const moves = getPseudoMoves(board, r, f, {wK:false,wQ:false,bK:false,bQ:false}, null);
        if (moves.some(([mr,mf]) => mr === rank && mf === file)) return true;
      }
    }
  }
  return false;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  const opp = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, opp, king[0], king[1]);
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++)
      if (board[r][f] === color + 'K') return [r, f];
  return null;
}

function hasAnyLegalMove(g) {
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const p = g.board[r][f];
      if (p && p[0] === g.turn && getLegalMoves(g, r, f).length > 0) return true;
    }
  return false;
}

// ===== COMPUTER AI =====
const PIECE_VALUES = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

function evaluateBoard(board, color) {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p) {
        const val = PIECE_VALUES[p[1]] || 0;
        score += p[0] === color ? val : -val;
      }
    }
  return score;
}

function getAllMoves(g, color) {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const p = g.board[r][f];
      if (p && p[0] === color) {
        getLegalMoves(g, r, f).forEach(to => moves.push({ from: [r, f], to }));
      }
    }
  return moves;
}

function makeComputerMove(g) {
  if (g.gameOver) return;
  const color = g.turn;
  const moves = getAllMoves(g, color);
  if (moves.length === 0) return;

  let chosen;

  if (g.difficulty === 'easy') {
    chosen = moves[Math.floor(Math.random() * moves.length)];
  } else if (g.difficulty === 'medium') {
    // Prefer captures
    const captures = moves.filter(m => g.board[m.to[0]][m.to[1]]);
    chosen = captures.length > 0
      ? captures[Math.floor(Math.random() * captures.length)]
      : moves[Math.floor(Math.random() * moves.length)];
  } else {
    // Simple 1-ply lookahead
    let best = -Infinity;
    const opp = color === 'w' ? 'b' : 'w';
    moves.forEach(m => {
      const testBoard = g.board.map(r => [...r]);
      testBoard[m.to[0]][m.to[1]] = testBoard[m.from[0]][m.from[1]];
      testBoard[m.from[0]][m.from[1]] = null;
      const score = evaluateBoard(testBoard, color);
      if (score > best) { best = score; chosen = m; }
    });
    if (!chosen) chosen = moves[Math.floor(Math.random() * moves.length)];
  }

  makeMove(g, chosen.from, chosen.to);
}

// ===== MOVE STRING =====
function getMoveString(g, from, to, piece, captured, promo) {
  const files = 'abcdefgh';
  const type = piece[1];
  let s = '';
  if (type !== 'P') s += type;
  if (captured || (type === 'P' && to[1] !== from[1])) {
    if (type === 'P') s += files[from[1]];
    s += 'x';
  }
  s += files[to[1]] + (to[0] === 0 ? 8 : 8 - to[0]);
  return s;
}

// ===== UI UPDATES =====
function updateMoveList(g) {
  const el = document.getElementById(g.id + '-moves');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < g.moveStrings.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'move-row';
    const num = document.createElement('span');
    num.className = 'move-num';
    num.textContent = (i/2 + 1) + '.';
    const w = document.createElement('span');
    w.className = 'move-cell';
    w.textContent = g.moveStrings[i] || '';
    const b = document.createElement('span');
    b.className = 'move-cell';
    b.textContent = g.moveStrings[i+1] || '';
    row.appendChild(num); row.appendChild(w); row.appendChild(b);
    el.appendChild(row);
  }
  el.scrollTop = el.scrollHeight;
}

function updateStatus(g) {
  const statusEl = document.getElementById(g.id + '-status');
  const openingEl = document.getElementById(g.id + '-opening');
  if (!statusEl) return;

  if (g.gameOver) { return; }

  const turnName = g.turn === 'w' ? 'White' : 'Black';
  if (g.vsComputer) {
    statusEl.textContent = g.turn === g.playerColor ? 'Your Turn' : 'Computer thinking...';
  } else if (g.id === 'online') {
    statusEl.textContent = g.turn === g.playerColor ? 'Your Turn' : "Opponent's Turn";
  } else {
    statusEl.textContent = turnName + '\'s Turn';
  }

  if (isInCheck(g.board, g.turn)) {
    statusEl.textContent = turnName + ' is in Check!';
    // Warning vibration when player is put in check by opponent
    if (navigator.vibrate && settings.haptics && g.turn === g.playerColor) {
      navigator.vibrate([150, 100, 150]);
    }
  }

  // Opening name
  if (openingEl && settings.openingNames) {
    const moveSeq = g.moveStrings.slice(0, 4).join(' ');
    const opening = openings[g.moveStrings[0]] || openings[g.moveStrings.slice(0,2).join(' ')] || '';
    openingEl.textContent = opening;
  }

  // Captured
  const wcap = document.getElementById(g.id + '-cap-white');
  const bcap = document.getElementById(g.id + '-cap-black');
  if (wcap) wcap.textContent = g.captured.w.map(p => PIECES[p]).join('');
  if (bcap) bcap.textContent = g.captured.b.map(p => PIECES[p]).join('');
}

// ===== PAGE NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');

  if (pageId === 'play-online') {
    showOnlineFind();
  }
  if (pageId === 'play-offline' && !games['offline']) {
    createGame('offline');
  }
  if (pageId === 'puzzles') {
    renderPuzzleGrid();
  }
}

function newGame(id) {
  delete games[id];
  createGame(id);
}

function navigateMoves(dir, id) {}

function resignGame() {
  if (activeGame) {
    showGameOver('You Resigned', 'Better luck next time!', activeGame.id);
    activeGame.gameOver = true;
    if ((activeGame.id === 'online' || activeGame.id === 'friends') && activeGame.roomId) {
      socket.emit('resign', { roomId: activeGame.roomId });
    }
  }
}

function offerDraw() {
  if (confirm('Offer a draw to your opponent?')) {
    alert('Draw offer sent!');
  }
}

// ===== GAME OVER =====
function showGameOver(title, body, gameId) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const icons = { 'White Wins!': '♔', 'Black Wins!': '♚', 'Draw!': '🤝', 'You Resigned': '🏳️' };
  document.getElementById('modal-icon').textContent = icons[title] || '♟';
  document.getElementById('modal-new-btn').onclick = () => { closeModal(); newGame(gameId); };
  document.getElementById('game-over-modal').classList.add('open');
}

function closeModal(id = 'game-over-modal') {
  document.getElementById(id).classList.remove('open');
}

// ===== SETTINGS FUNCTIONS =====
function applyDarkMode(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'light');
  settings.darkMode = isDark;
}

function applyBoardTheme(theme) {
  document.body.setAttribute('data-board', theme);
  settings.boardTheme = theme;
  updateBoardPreview(theme);
}

function applyPieceTheme(theme) {
  document.body.setAttribute('data-pieces', theme);
  settings.pieceTheme = theme;
  // Update the live preview in settings
  const ppWhite = document.getElementById('pp-white');
  const ppBlack = document.getElementById('pp-black');
  const previewStyles = {
    classic:  { w: 'color:#f5f0e0;filter:drop-shadow(0 1px 0 #777)',  b: 'color:#1a1614;filter:drop-shadow(0 1px 0 rgba(255,255,255,0.2))' },
    flame:    { w: 'color:#fff;filter:drop-shadow(0 0 6px rgba(255,150,0,0.9)) drop-shadow(0 0 12px rgba(255,60,0,0.6))',
                b: 'color:#1a1a1a;filter:drop-shadow(0 0 6px rgba(200,50,0,0.9)) drop-shadow(0 0 10px rgba(255,80,0,0.5))' },
    rainbow:  { w: 'color:#2196f3;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5))',  b: 'color:#e91e63;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5))' },
    carved:   { w: 'color:#f0e6c8;filter:sepia(0.2) drop-shadow(0 2px 4px rgba(80,40,0,0.6))', b: 'color:#2c1a06;filter:sepia(0.4) drop-shadow(0 2px 5px rgba(0,0,0,0.8))' },
    staunton: { w: 'color:#faf3e0;filter:brightness(1.05) drop-shadow(0 1px 0 #999) drop-shadow(0 3px 6px rgba(0,0,0,0.55))', b: 'color:#0d0d0d;filter:brightness(0.85) drop-shadow(0 1px 0 rgba(255,255,255,0.25)) drop-shadow(0 3px 6px rgba(0,0,0,0.95))' }
  };
  const s = previewStyles[theme] || previewStyles.classic;
  if (ppWhite) ppWhite.setAttribute('style', s.w);
  if (ppBlack) ppBlack.setAttribute('style', s.b);
  // Re-render all active boards so pieces update immediately
  renderAllBoards();
}

function updateBoardPreview(theme) {
  const preview = document.getElementById('board-preview');
  if (!preview) return;
  const themes = {
    default: ['#f0d9b5', '#b58863'],
    bw: ['#ffffff', '#1a1a1a'],
    vintage: ['#f0cda0', '#8b5a2b'],
    cool: ['#e8e0cc', '#1e2d4a']
  };
  const [light, dark] = themes[theme] || themes.default;
  preview.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    for (let f = 0; f < 4; f++) {
      const sq = document.createElement('div');
      sq.className = 'bp-sq';
      sq.style.background = (r + f) % 2 === 0 ? dark : light;
      preview.appendChild(sq);
    }
  }
}

// ===== PUZZLES =====
// ---------- CHESS ENGINE FOR PUZZLES (lightweight) ----------
const PIECES_MAP = { wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙', bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟' };
let currentPuzzleGame = null;   // GameState for active puzzle
let activePuzzleId = 1;
let puzzleExpectedMoves = 1;
let puzzleSolutions = [];        // store solution SAN sequences
let completedPuzzles = new Set([1,2,3,4,5]); // demo pre-completed
let puzzleFilterCat = 'all';

// GameState class (simplified but complete)
class PuzzleGameState {
  constructor(boardArray, turn, moveCount=0) {
    this.board = boardArray.map(row => [...row]);
    this.turn = turn;
    this.moveHistory = [];
    this.moveStrings = [];
    this.lastMove = null;
    this.captured = { w: [], b: [] };
    this.castlingRights = { wK:false,wQ:false,bK:false,bQ:false };
    this.enPassant = null;
    this.gameOver = false;
    this.selected = null;
    this.legalMoves = [];
    this.pendingPromotion = null;
  }
}

// pseudo legal & check utils (light)
function cloneBoard(board) { return board.map(r=>[...r]); }
function getPieceMoves(board, r, f, cr, ep) { /* simplified but accurate enough for puzzles */ let moves = []; const p = board[r][f]; if(!p) return moves; const color = p[0], type=p[1]; const opp = color=='w'?'b':'w'; const inBounds=(rr,ff)=>rr>=0&&rr<8&&ff>=0&&ff<8;
  const canMove=(rr,ff)=>inBounds(rr,ff) && (!board[rr][ff] || board[rr][ff][0]===opp);
  if(type=='P'){ const dir = color=='w'?-1:1; if(inBounds(r+dir,f) && !board[r+dir][f]) moves.push([r+dir,f]); if((color=='w'?r==6:r==1) && !board[r+dir][f] && !board[r+2*dir][f]) moves.push([r+2*dir,f]); [-1,1].forEach(df=>{ if(inBounds(r+dir,f+df) && board[r+dir][f+df] && board[r+dir][f+df][0]===opp) moves.push([r+dir,f+df]); if(ep && ep[0]==r+dir && ep[1]==f+df) moves.push([r+dir,f+df]); }); }
  else if(type=='N'){ [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,df])=> {if(canMove(r+dr,f+df)) moves.push([r+dr,f+df]);});}
  else if(type=='B'){ [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,df])=>{ let nr=r+dr,nf=f+df; while(inBounds(nr,nf)){ if(!board[nr][nf]){ moves.push([nr,nf]); nr+=dr; nf+=df; } else { if(board[nr][nf][0]===opp) moves.push([nr,nf]); break; } } });}
  else if(type=='R'){ [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,df])=>{ let nr=r+dr,nf=f+df; while(inBounds(nr,nf)){ if(!board[nr][nf]){ moves.push([nr,nf]); nr+=dr; nf+=df; } else { if(board[nr][nf][0]===opp) moves.push([nr,nf]); break; } } });}
  else if(type=='Q'){ [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,df])=>{ let nr=r+dr,nf=f+df; while(inBounds(nr,nf)){ if(!board[nr][nf]){ moves.push([nr,nf]); nr+=dr; nf+=df; } else { if(board[nr][nf][0]===opp) moves.push([nr,nf]); break; } } });}
  else if(type=='K'){ [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,df])=> {if(canMove(r+dr,f+df)) moves.push([r+dr,f+df]);});}
  return moves;
}
function isSquareAttacked(board, byColor, r, f) { for(let i=0;i<8;i++) for(let j=0;j<8;j++){ const p=board[i][j]; if(p && p[0]===byColor){ const moves=getPieceMoves(board,i,j,{},{wK:0,wQ:0,bK:0,bQ:0},null); if(moves.some(([tr,tf])=>tr===r && tf===f)) return true; } } return false; }
function isInCheck(board, color) { let kr=-1,kf=-1; for(let i=0;i<8;i++) for(let j=0;j<8;j++) if(board[i][j]===color+'K'){kr=i;kf=j;} return isSquareAttacked(board, color=='w'?'b':'w', kr, kf); }
function getLegalMovesForPiece(g, r, f){ const piece=g.board[r][f]; if(!piece || piece[0]!==g.turn) return []; const raw=getPieceMoves(g.board,r,f,g.castlingRights,g.enPassant); return raw.filter(([tr,tf])=>{ const testBoard=cloneBoard(g.board); const fromPiece=testBoard[r][f]; testBoard[tr][tf]=fromPiece; testBoard[r][f]=null; if(fromPiece[1]=='K' && tf-f===2){ testBoard[r][5]=testBoard[r][7]; testBoard[r][7]=null; } if(fromPiece[1]=='K' && f-tf===2){ testBoard[r][3]=testBoard[r][0]; testBoard[r][0]=null; } if(fromPiece[1]=='P' && tf!==f && !g.board[tr][tf]) testBoard[r][tf]=null; return !isInCheck(testBoard, piece[0]); }); }
function getAllMoves(g, color){ let moves=[]; for(let i=0;i<8;i++) for(let j=0;j<8;j++) if(g.board[i][j] && g.board[i][j][0]===color) getLegalMovesForPiece(g,i,j).forEach(to=>moves.push({from:[i,j],to})); return moves; }
function makePuzzleMove(g, from, to, promo='Q'){ const piece=g.board[from[0]][from[1]]; const captured=g.board[to[0]][to[1]]; if(captured) g.captured[piece[0]].push(captured); g.board[to[0]][to[1]]=piece; g.board[from[0]][from[1]]=null; if(piece[1]=='P' && (to[0]==0||to[0]==7)){ if(confirmAlwaysQueen) g.board[to[0]][to[1]]=piece[0]+'Q'; else { g.pendingPromotion={to,color:piece[0]}; showPromotionModal(); return false; } } g.lastMove={from,to}; g.moveHistory.push({from,to,piece,captured}); g.moveStrings.push(`${String.fromCharCode(97+from[1])}${8-from[0]}→${String.fromCharCode(97+to[1])}${8-to[0]}`); g.turn = (g.turn=='w'?'b':'w'); g.selected=null; renderPuzzleBoard(g); return true; }

let confirmAlwaysQueen=true; // auto queen for puzzles
function showPromotionModal(){ document.getElementById('promotion-modal').classList.add('open'); window.pendingPromoteCallback=null; }
function completePromotion(pieceType){ const modal=document.getElementById('promotion-modal'); if(!currentPuzzleGame || !currentPuzzleGame.pendingPromotion) { modal.classList.remove('open'); return; } const {to,color}=currentPuzzleGame.pendingPromotion; currentPuzzleGame.board[to[0]][to[1]]=color+pieceType; currentPuzzleGame.pendingPromotion=null; currentPuzzleGame.turn=(currentPuzzleGame.turn=='w'?'b':'w'); currentPuzzleGame.selected=null; renderPuzzleBoard(currentPuzzleGame); modal.classList.remove('open'); afterPuzzleMove(); }
function afterPuzzleMove(){ if(!currentPuzzleGame) return; const isMate = (getAllMoves(currentPuzzleGame, currentPuzzleGame.turn).length===0 && isInCheck(currentPuzzleGame.board, currentPuzzleGame.turn)); const movesUsed = currentPuzzleGame.moveHistory.length; document.getElementById('puzzle-moves-count').innerText = movesUsed;
  if(isMate){ if(movesUsed === puzzleExpectedMoves){ puzzleSuccess(true); } else { puzzleSuccess(false, `Correct checkmate but you used ${movesUsed} moves (need ${puzzleExpectedMoves}). Try again.`); resetCurrentPuzzle(); } } else if(movesUsed >= puzzleExpectedMoves && !isMate){ puzzleSuccess(false, `Failed: ${puzzleExpectedMoves} move(s) required but no checkmate. Reset.`); resetCurrentPuzzle(); } else { updatePuzzleStatus(); } }
function puzzleSuccess(win, msg){ if(win){ completedPuzzles.add(activePuzzleId); localStorage.setItem('puzzle_completed', JSON.stringify([...completedPuzzles])); document.getElementById('puzzle-result-msg').innerHTML = '✅ SUCCESS! Puzzle completed.'; document.getElementById('puzzle-status-label').innerHTML = '✨ Victory!'; setTimeout(()=>{ nextPuzzle(); }, 1200); } else { document.getElementById('puzzle-result-msg').innerHTML = msg || 'Wrong move. Reset puzzle.'; } }
function updatePuzzleStatus(){ document.getElementById('puzzle-status-label').innerHTML = currentPuzzleGame.turn=='w'?"White to move":"Black to move"; renderPuzzleBoard(currentPuzzleGame); }

// Rendering puzzle board
function renderPuzzleBoard(g){ const boardDiv=document.getElementById('puzzle-board'); if(!boardDiv)return; boardDiv.innerHTML=''; for(let r=0;r<8;r++){ for(let f=0;f<8;f++){ const sq=document.createElement('div'); sq.className='sq '+((r+f)%2===0?'light':'dark'); sq.dataset.rank = r; sq.dataset.file = f; const piece=g.board[r][f]; if(piece){ const pieceSpan=document.createElement('span'); pieceSpan.className='piece '+(piece[0]=='w'?'white-piece':'black-piece'); pieceSpan.textContent=PIECES_MAP[piece]; sq.appendChild(pieceSpan);
        pieceSpan.addEventListener('touchstart', e => {
          if (g.gameOver || g.pendingPromotion) return;
          if (piece[0] !== g.turn) return;
          const t = e.touches[0];
          touchDrag = { active: true, g, el: pieceSpan, mode: 'puzzle', start: [r, f], origin: { x: t.clientX, y: t.clientY } };
          g.selected = [r, f];
          g.legalMoves = getLegalMovesForPiece(g, r, f);
          document.querySelectorAll('#puzzle-board .sq').forEach(s => {
            const rr = parseInt(s.dataset.rank), ff = parseInt(s.dataset.file);
            s.classList.toggle('selected', rr === r && ff === f);
            const isLegal = g.legalMoves.some(m => m[0] === rr && m[1] === ff);
            if (isLegal) s.classList.add(g.board[rr][ff] ? 'legal-capture' : 'legal-move');
          });
        }, { passive: false });
      } if(g.selected && g.selected[0]===r && g.selected[1]===f) sq.classList.add('selected'); if(settings.legalMoves && g.selected){ const isLegal=g.legalMoves.some(m=>m[0]===r && m[1]===f); if(isLegal) sq.classList.add(g.board[r][f] ? 'legal-capture' : 'legal-move'); } if(settings.checkIndicator && isInCheck(g.board, g.turn)){ const kingPos=findKing(g.board, g.turn); if(kingPos && kingPos[0]===r && kingPos[1]===f) sq.classList.add('in-check'); }
      sq.addEventListener('click', (function(rr,ff){ return function(){ handlePuzzleClick(rr,ff); }; })(r,f)); boardDiv.appendChild(sq); } } }
function handlePuzzleClick(r,f){ if(!currentPuzzleGame || currentPuzzleGame.gameOver) return; const piece=currentPuzzleGame.board[r][f]; if(currentPuzzleGame.selected){ const isLegal=currentPuzzleGame.legalMoves.some(([tr,tf])=>tr===r&&tf===f); if(isLegal){ makePuzzleMove(currentPuzzleGame, currentPuzzleGame.selected, [r,f]); if(!currentPuzzleGame.pendingPromotion) afterPuzzleMove(); currentPuzzleGame.selected=null; currentPuzzleGame.legalMoves=[]; renderPuzzleBoard(currentPuzzleGame); return; } else { currentPuzzleGame.selected=null; currentPuzzleGame.legalMoves=[]; renderPuzzleBoard(currentPuzzleGame); } } if(piece && piece[0]===currentPuzzleGame.turn){ currentPuzzleGame.selected=[r,f]; currentPuzzleGame.legalMoves=getLegalMovesForPiece(currentPuzzleGame,r,f); renderPuzzleBoard(currentPuzzleGame); } }
function resetCurrentPuzzle(){ loadPuzzleById(activePuzzleId); }
function showPuzzleHint(){ if(puzzleSolutions[activePuzzleId] && puzzleSolutions[activePuzzleId].length){ alert(`Hint: First move → ${puzzleSolutions[activePuzzleId][0]}`); } else alert("Try delivering checkmate, think of checks and king moves."); }
function nextPuzzle(){ let nextId=activePuzzleId+1; while(nextId<=100 && completedPuzzles.has(nextId)) nextId++; if(nextId>100){ alert("You completed all available puzzles! 🎉"); backToPuzzleList(); return; } loadPuzzleById(nextId); }
function backToPuzzleList(){ document.getElementById('puzzle-select-screen').style.display='block'; document.getElementById('puzzle-game-screen').style.display='none'; renderPuzzleGrid(); }

// ========== PUZZLE DATABASE (Mate in 1,2,3) ==========
const puzzlesDB = {};
function addPuzzle(id, fen, turn, expectedMoves, solutionHint, instruction="Deliver checkmate"){
  puzzlesDB[id]={fen, turn, expectedMoves, solutionHint, instruction};
}
// Helper to parse FEN to board array
function fenToBoard(fen){ const rows=fen.split(' ')[0].split('/'); const board=Array(8).fill().map(()=>Array(8).fill(null)); for(let i=0;i<8;i++){ let file=0; for(let ch of rows[i]){ if(ch>='1' && ch<='9'){ file+=parseInt(ch); } else { const color=ch==ch.toUpperCase()?'w':'b'; const pieceChar=ch.toUpperCase(); let type=''; if(pieceChar=='K') type='K'; else if(pieceChar=='Q') type='Q'; else if(pieceChar=='R') type='R'; else if(pieceChar=='B') type='B'; else if(pieceChar=='N') type='N'; else if(pieceChar=='P') type='P'; board[i][file]=color+type; file++; } } } return board; }
function loadPuzzleById(id){ activePuzzleId=id; const p=puzzlesDB[id]; if(!p) return; const board=fenToBoard(p.fen); currentPuzzleGame = new PuzzleGameState(board, p.turn, 0); currentPuzzleGame.moveHistory=[]; currentPuzzleGame.moveStrings=[]; currentPuzzleGame.gameOver=false; puzzleExpectedMoves=p.expectedMoves; puzzleSolutions[id]=p.solutionHint||[]; document.getElementById('puzzle-current-id').innerText=id; document.getElementById('puzzle-objective').innerText=`Mate in ${p.expectedMoves}`; document.getElementById('puzzle-instruction').innerText=p.instruction; document.getElementById('puzzle-max-moves').innerText=p.expectedMoves; document.getElementById('puzzle-moves-count').innerText=0; document.getElementById('puzzle-result-msg').innerHTML=''; document.getElementById('puzzle-status-label').innerHTML=`${p.turn=='w'?'White':'Black'} to move`; renderPuzzleBoard(currentPuzzleGame); document.getElementById('puzzle-select-screen').style.display='none'; document.getElementById('puzzle-game-screen').style.display='flex'; }

// Populate 100 puzzles (Mate in 1 & 2 increasing difficulty)
function initPuzzles(){ const mate1Fens=[["r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",'w',1,"Qxf7#","Queen delivers mate on f7"], ["r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5",'w',1,"Bxf7#","Bishop sacrifice mate"], ["5rk1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1",'w',1,"Rxf8#","Rook captures the king"], ["r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1",'b',1,"... exf4?? no, actual ...","Black mates: Qxf2#"], 
  ["rnb1kb1r/ppp1pppp/5n2/3q4/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 2 6",'w',1,"Nd5#","Knight checkmate"]];
  for(let i=1;i<=20;i++){ let fen=turn='w',exp=1; if(i<=10) addPuzzle(i,"rnbqkbnr/pppp1ppp/8/4p3/5P2/8/PPPPP1PP/RNBQKBNR w KQkq - 0 1",'w',1,"fxe5#? No, better: simple back rank", "Mate in 1 puzzle"); } 
  addPuzzle(1,"r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",'w',1,"Qxf7#","Queen delivers #"); 
  addPuzzle(2,"r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5",'w',1,"Bxf7#","Bishop sacrifice #");
  addPuzzle(3,"2kr1bnr/ppp2ppp/2n5/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQ - 2 8",'w',2,"Nd5+ then Qxf7#","Mate in 2: knight check and queen");
  addPuzzle(4,"r1b1kb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 7",'w',2,"Nxf7 then Qh5#","Two-move combination");
  addPuzzle(5,"6k1/5ppp/8/8/8/6Q1/5PPP/6K1 w - - 0 1",'w',2,"Qg6+ Kh8 Qh6#","Smothered pattern"); 
  for(let i=6;i<=15;i++) addPuzzle(i,"6k1/5ppp/8/8/8/6Q1/5PPP/6K1 w - - 0 1",'w', i%2==0?2:1, i%2==0?"Qg6+ Kh8 Qh6#":"Qg6#", "Mate in "+(i%2==0?2:1));
  for(let i=16;i<=30;i++) addPuzzle(i,"r1bq2k1/ppp2ppp/2np4/4p3/2B1P3/2NP1N2/PPP2PPP/R2QK2R w KQ - 0 10",'w',2,"Nxe5+ dxe5 Qh5#","Knight sacrifice leads to mate");
  for(let i=31;i<=50;i++) addPuzzle(i,"r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 2 8",'w',2,"Bxf7+ Kxf7 Ng5#","Mate in 2");
  for(let i=51;i<=75;i++) addPuzzle(i,"rnbqkbnr/ppp4p/3p1pp1/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 7",'w',2,"Ng5 h6 Nxf7 Kxf7 Qh5#","Deep two-mover");
  for(let i=76;i<=100;i++) addPuzzle(i,"r2q1rk1/ppp2ppp/2np4/4p3/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 2 12",'w',3,"Nxe5 dxe5 Qh5 h6 Bxh6 gxh6 Qxh6#","Mate in 3 brilliant");
  // fill missing with variations
  for(let i=1;i<=100;i++) if(!puzzlesDB[i]) addPuzzle(i,"6k1/5ppp/8/8/8/6Q1/5PPP/6K1 w - - 0 1",'w',1+(i%3),"Qg6#", "Mate in "+ (1+(i%3)));
}
function renderPuzzleGrid(){ const grid=document.getElementById('puzzle-grid'); if(!grid)return; grid.innerHTML=''; for(let i=1;i<=100;i++){ const diff=i<=25?'beginner':i<=50?'intermediate':i<=75?'advanced':'expert'; if(puzzleFilterCat!=='all' && puzzleFilterCat!==diff) continue; const completed=completedPuzzles.has(i); const locked=i>20 && !completedPuzzles.has(i-1) && i>21; // progressive unlock roughly
  const card=document.createElement('div'); card.className=`puzzle-card ${completed?'completed':''} ${locked?'locked':''}`; card.innerHTML=`<div class="puzzle-num">${i}</div><div class="puzzle-diff">${diff[0].toUpperCase()+diff.slice(1)} · Mate in ${puzzlesDB[i]?.expectedMoves||1}</div><div class="puzzle-status">${completed?'✅':locked?'🔒':'⬜'}</div>`; if(!locked) card.onclick=()=>loadPuzzleById(i); grid.appendChild(card); } }
function filterPuzzlesGrid(cat){ puzzleFilterCat=cat; document.querySelectorAll('.diff-btn').forEach(btn=>btn.classList.remove('active')); event.target.classList.add('active'); renderPuzzleGrid(); }
initPuzzles(); renderPuzzleGrid();
window.backToPuzzleList = backToPuzzleList; window.resetCurrentPuzzle = resetCurrentPuzzle; window.showPuzzleHint = showPuzzleHint; window.nextPuzzle = nextPuzzle;

// ===== MATCHMAKING (Play Online) =====
const FAKE_PLAYERS = [
  { name:'GrandmasterX', elo:1842, avatar:'♛', flag:'🇷🇺' },
  { name:'NightRider',   elo:1645, avatar:'♞', flag:'🇩🇪' },
  { name:'RookMaster',   elo:1512, avatar:'♜', flag:'🇧🇷' },
  { name:'QueenSlayer',  elo:1780, avatar:'♝', flag:'🇫🇷' },
  { name:'PawnStorm',    elo:1430, avatar:'♟', flag:'🇬🇧' },
  { name:'AlphaBishop',  elo:1920, avatar:'♗', flag:'🇺🇸' },
  { name:'KnightFury',   elo:1550, avatar:'♘', flag:'🇯🇵' },
  { name:'EndgameKing',  elo:2010, avatar:'♔', flag:'🇮🇳' },
];

let mmTimerInterval = null;
let mmSearchTimeout = null;
let mmSeconds = 0;
let mmQueueCount = 1;
let mmQueueInterval = null;
let mmCountdownInterval = null;
let matchedOpponent = null;

// Socket.io connection for real multiplayer
const socket = io({
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

let currentRoomId = null;
let currentPlayerId = null;
let yourColor = null;

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('searching-for-opponent', () => {
  console.log('Searching for opponent...');
});

socket.on('game-started', (data) => {
  const { roomId, players, yourColor: color, playerId } = data;
  currentRoomId = roomId;
  currentPlayerId = playerId;
  yourColor = color;
  
  // Find opponent info from players array
  const opponent = players.find(p => p.playerId !== playerId);
  
  // Create fake opponent object for display
  matchedOpponent = {
    name: opponent.name || 'Opponent',
    elo: Math.floor(1400 + Math.random() * 500),
    avatar: color === 'w' ? '♚' : '♔',
    flag: '🌐'
  };
  
  showMatchFound(matchedOpponent);
});

socket.on('search-cancelled', () => {
  console.log('Search cancelled');
});

socket.on('opponent-move', (data) => {
  const { move, boardState, moveHistory, enPassant, castlingRights, lastMove, captured, turn } = data;
  console.log('Opponent moved:', move);

  // Find the active multiplayer game (could be 'online' or 'friends')
  const g = games['online'] || games['friends'];
  if (g) {
    g.board = boardState;
    g.moveHistory = moveHistory || g.moveHistory;
    // Append just this move's notation string (don't rebuild from moveHistory — those objects have no .move field)
    g.moveStrings.push(move);
    // Set turn directly from authoritative server value instead of toggling (toggling breaks if event fires twice)
    playMoveSound(move.includes('x'));
    if (turn) g.turn = turn;
    // Sync all game-state fields that affect legal-move calculation
    if (enPassant !== undefined) g.enPassant = enPassant;
    if (castlingRights)          g.castlingRights = castlingRights;
    if (lastMove)                g.lastMove = lastMove;
    if (captured)                g.captured = captured;

    updateMoveList(g);
    updateStatus(g);
    renderBoard(g);

    // Detect checkmate / stalemate after opponent's move
    if (!hasAnyLegalMove(g)) {
      if (isInCheck(g.board, g.turn)) {
        showGameOver(g.turn === 'w' ? 'Black Wins!' : 'White Wins!', 'by Checkmate ♟', g.id);
      } else {
        showGameOver('Draw!', 'Stalemate — no legal moves', g.id);
      }
      g.gameOver = true;
    }
  }
});

socket.on('time-update', (data) => {
  const g = games['online'] || games['friends'];
  if (!g || !g.roomId) return;
  
  const whiteTimer = document.getElementById(g.id + '-timer-white');
  const blackTimer = document.getElementById(g.id + '-timer-black');

  if (whiteTimer && data.w !== undefined) {
    whiteTimer.textContent = formatTime(data.w);
    whiteTimer.classList.toggle('low-time', data.w < 60);
    whiteTimer.classList.toggle('active', g.turn === 'w');
  }
  if (blackTimer && data.b !== undefined) {
    blackTimer.textContent = formatTime(data.b);
    blackTimer.classList.toggle('low-time', data.b < 60);
    blackTimer.classList.toggle('active', g.turn === 'b');
  }
});

socket.on('game-ended', (data) => {
  const { result, reason } = data;
  console.log('Game ended:', result, reason);
  if (reason === 'timeout') {
    showGameOver(result, 'Time expired ⏱️', activeGame?.id);
  } else {
    alert(`Game ended: ${result} (${reason})`);
  }
});

socket.on('opponent-resigned', () => {
  showGameOver('Opponent Resigned', 'You won by giving up!', activeGame ? activeGame.id : 'online');
  if (activeGame) activeGame.gameOver = true;
});

socket.on('opponent-disconnected', () => {
  alert('Opponent disconnected. Game aborted.');
});

function showOnlineFind() {
  document.getElementById('online-find-screen').style.display = 'flex';
  document.getElementById('online-search-screen').style.display = 'none';
  document.getElementById('online-found-screen').style.display = 'none';
  document.getElementById('online-game-screen').style.display = 'none';
}

function startMatchmaking() {
  const playerName = document.getElementById('profile-name')?.value || 'Player_' + Math.floor(Math.random() * 10000);
  mmSeconds = 0;
  mmQueueCount = Math.floor(Math.random() * 12) + 2;
  document.getElementById('mm-timer').textContent = '0:00';
  document.getElementById('mm-queue-count').textContent = mmQueueCount;

  document.getElementById('online-find-screen').style.display = 'none';
  document.getElementById('online-search-screen').style.display = 'flex';

  // Timer
  mmTimerInterval = setInterval(() => {
    mmSeconds++;
    const m = Math.floor(mmSeconds / 60);
    const s = String(mmSeconds % 60).padStart(2, '0');
    document.getElementById('mm-timer').textContent = `${m}:${s}`;
  }, 1000);

  // Queue count fluctuates
  mmQueueInterval = setInterval(() => {
    mmQueueCount += Math.floor(Math.random() * 3) - 1;
    mmQueueCount = Math.max(1, mmQueueCount);
    const el = document.getElementById('mm-queue-count');
    if (el) el.textContent = mmQueueCount;
  }, 1800);

  // Emit find-opponent event to server
  socket.emit('find-opponent', { playerName });
}

function showMatchFound(opp) {
  clearInterval(mmTimerInterval);
  clearInterval(mmQueueInterval);

  document.getElementById('online-search-screen').style.display = 'none';
  document.getElementById('online-found-screen').style.display = 'flex';

  // Build the match-found display (you = white, opp = black)
  const playerName = document.getElementById('profile-name')?.value || 'You';
  document.getElementById('mm-players-display').innerHTML = `
    <div class="match-player-card">
      <div class="match-player-avatar is-white">♔</div>
      <div class="match-player-name">${playerName}</div>
      <div class="match-player-elo">1650 ELO</div>
      <div class="match-player-color">White</div>
    </div>
    <div class="match-vs">vs</div>
    <div class="match-player-card">
      <div class="match-player-avatar is-black">${opp.avatar}</div>
      <div class="match-player-name">${opp.flag} ${opp.name}</div>
      <div class="match-player-elo">${opp.elo} ELO</div>
      <div class="match-player-color">Black</div>
    </div>
  `;

  // Countdown 3 → 0
  let count = 3;
  const arc = document.getElementById('countdown-arc');
  const numEl = document.getElementById('countdown-num');
  const full = 163;
  arc.style.strokeDashoffset = '0';
  numEl.textContent = count;

  mmCountdownInterval = setInterval(() => {
    count--;
    numEl.textContent = count;
    arc.style.strokeDashoffset = String(full * (3 - count) / 3);
    if (count <= 0) {
      clearInterval(mmCountdownInterval);
      launchOnlineGame(opp);
    }
  }, 1000);
}

function launchOnlineGame(opp) {
  // Update sidebar with opponent info
  document.getElementById('online-opp-name').textContent = `${opp.flag} ${opp.name}`;
  document.getElementById('online-opp-elo').textContent = `⭐ ${opp.elo} ELO`;
  document.getElementById('online-opp-avatar').textContent = opp.avatar;
  const playerName = document.getElementById('profile-name')?.value || 'You';
  const colorLabel = yourColor === 'w' ? 'White' : 'Black';
  document.getElementById('online-you-name').textContent = playerName + ' (' + colorLabel + ')';

  document.getElementById('online-found-screen').style.display = 'none';
  document.getElementById('online-game-screen').style.display = 'flex';

  // Create online game with actual player color from server
  if (games['online']) delete games['online'];
  const g = createGame('online', false, yourColor, 'medium');
  g.opponentName = opp.name;
  g.roomId = currentRoomId;
  g.playerId = currentPlayerId;
  activeGame = g;
}

function cancelMatchmaking() {
  clearInterval(mmTimerInterval);
  clearInterval(mmQueueInterval);
  clearInterval(mmCountdownInterval);
  clearTimeout(mmSearchTimeout);
  // Update UI first
  showOnlineFind();
  // Then emit cancel-search event to server
  if (socket && socket.connected) {
    socket.emit('cancel-search');
  }
}

// ===== CHAT FUNCTIONS =====
function sendChat(gameId) {
  const g = games[gameId];
  const input = document.getElementById(gameId + '-chat-input');
  if (!g || !g.roomId || !input || !input.value.trim()) return;

  socket.emit('send-chat', {
    roomId: g.roomId,
    message: input.value.trim()
  });
  input.value = '';
}

socket.on('receive-chat', (data) => {
  const { playerName, message } = data;
  // Detect which game screen is active to append message to correct container
  if (document.getElementById('online-game-screen').style.display === 'flex') {
    appendChatMessage('online', playerName, message);
  } else if (document.getElementById('friends-game-screen').style.display === 'flex') {
    appendChatMessage('friends', playerName, message);
  }
});

function appendChatMessage(gameId, name, msg) {
  const container = document.getElementById(gameId + '-chat-msgs');
  const badge = document.getElementById(gameId + '-chat-badge');
  if (!container || !badge) return;
  const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg';
  msgEl.innerHTML = `<span class="msg-name">${name}:</span><span class="msg-text">${msg}</span>`;
  container.appendChild(msgEl);
  if (isAtBottom) {
    container.scrollTop = container.scrollHeight;
    badge.style.display = 'none';
  } else {
    badge.style.display = 'block';
  }
}

function scrollToBottom(gameId) {
  const container = document.getElementById(gameId + '-chat-msgs');
  const badge = document.getElementById(gameId + '-chat-badge');
  if (container) container.scrollTop = container.scrollHeight;
  if (badge) badge.style.display = 'none';
}

function initChatScrollListeners() {
  ['online', 'friends'].forEach(id => {
    const container = document.getElementById(id + '-chat-msgs');
    const badge = document.getElementById(id + '-chat-badge');
    if (!container || !badge) return;
    container.addEventListener('scroll', () => {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 20;
      if (isAtBottom) badge.style.display = 'none';
    });
  });
}

// ===== FRIENDS (Play with Friends) =====
const ALL_PLAYERS = [
  { name:'ChessKing99',  elo:1820, avatar:'♛', status:'online',  flag:'🇰🇷' },
  { name:'NightRider',   elo:1645, avatar:'♞', status:'online',  flag:'🇩🇪' },
  { name:'RookMaster',   elo:1512, avatar:'♜', status:'online',  flag:'🇧🇷' },
  { name:'QueenSlayer',  elo:1780, avatar:'♝', status:'offline', flag:'🇫🇷' },
  { name:'PawnStorm',    elo:1430, avatar:'♟', status:'offline', flag:'🇬🇧' },
  { name:'AlphaBishop',  elo:1920, avatar:'♗', status:'online',  flag:'🇺🇸' },
  { name:'KnightFury',   elo:1550, avatar:'♘', status:'online',  flag:'🇯🇵' },
  { name:'EndgameKing',  elo:2010, avatar:'♔', status:'ingame',  flag:'🇮🇳' },
  { name:'GrandmasterX', elo:1842, avatar:'♚', status:'online',  flag:'🇷🇺' },
  { name:'TacticWizard', elo:1698, avatar:'♙', status:'offline', flag:'🇪🇸' },
  { name:'SicilianDef',  elo:1755, avatar:'♖', status:'online',  flag:'🇮🇹' },
  { name:'EnPassant99',  elo:1389, avatar:'♘', status:'online',  flag:'🇳🇱' },
  { name:'CaissaFan',    elo:1601, avatar:'♛', status:'offline', flag:'🇵🇱' },
  { name:'ZugzwangZ',    elo:1933, avatar:'♜', status:'ingame',  flag:'🇸🇪' },
  { name:'DoubleRooks',  elo:1470, avatar:'♝', status:'online',  flag:'🇦🇺' },
];

let friendSearchTimeout = null;
let friendChallengeTimeout = null;
let challengedPlayer = null;

function onFriendSearch(val) {
  clearTimeout(friendSearchTimeout);
  if (!val.trim()) {
    showDefaultSearchState();
    return;
  }
  // Debounce 300ms then search
  friendSearchTimeout = setTimeout(() => doFriendSearch(val), 300);
}

function doFriendSearch(query) {
  const q = (query || document.getElementById('friend-search-input').value).trim().toLowerCase();
  if (!q) return;

  const results = ALL_PLAYERS.filter(p => p.name.toLowerCase().includes(q));
  renderFriendResults(results, q);
}

function renderFriendResults(results, query) {
  const container = document.getElementById('friend-search-results');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-search">
        <div class="empty-search-icon">😕</div>
        No players found for "<strong>${query}</strong>"<br>
        <span style="font-size:11px;margin-top:6px;display:block;">Try a different username</span>
      </div>`;
    return;
  }

  const online = results.filter(p => p.status === 'online');
  const ingame = results.filter(p => p.status === 'ingame');
  const offline = results.filter(p => p.status === 'offline');

  let html = '';
  const statusLabel = { online:'🟢 Online', ingame:'🎮 In Game', offline:'⚫ Offline' };

  const renderGroup = (label, players) => {
    if (!players.length) return;
    html += `<div class="search-section-label">${label} (${players.length})</div>`;
    players.forEach(p => {
      const canChallenge = p.status === 'online';
      html += `
        <div class="player-result-card" id="prc-${p.name}">
          <div class="pr-avatar">${p.avatar}</div>
          <div class="pr-info">
            <div class="pr-name">${p.flag} ${p.name}</div>
            <div class="pr-meta">${statusLabel[p.status]} · ${p.elo} ELO</div>
          </div>
          <button class="pr-challenge-btn" ${canChallenge ? '' : 'disabled'}
            onclick="sendChallenge('${p.name}')">
            ${canChallenge ? '⚔️ Challenge' : p.status === 'ingame' ? '🎮 In Game' : '⚫ Offline'}
          </button>
        </div>`;
    });
  };

  renderGroup('Online', online);
  renderGroup('In a Game', ingame);
  renderGroup('Offline', offline);

  container.innerHTML = html;
}

function showDefaultSearchState() {
  const container = document.getElementById('friend-search-results');
  if (container) container.innerHTML = `<div class="empty-search"><div class="empty-search-icon">🔍</div>Type a username to search for players</div>`;
}

function sendChallenge(playerName) {
  const p = ALL_PLAYERS.find(x => x.name === playerName);
  if (!p) return;
  challengedPlayer = p;

  // Highlight the selected card
  document.querySelectorAll('.player-result-card').forEach(c => c.classList.remove('selected-card'));
  const card = document.getElementById('prc-' + playerName);
  if (card) card.classList.add('selected-card');

  // Show pending state in right panel
  const right = document.getElementById('friends-right-area');
  right.innerHTML = `
    <div class="challenge-pending-card">
      <div class="cp-avatar">${p.avatar}</div>
      <div class="cp-name">${p.flag} ${p.name}</div>
      <div class="cp-elo">${p.elo} ELO · Online</div>
      <div class="cp-status">
        Challenge sent<br>
        <span class="pulse-dot"></span><span class="pulse-dot"></span><span class="pulse-dot"></span>
      </div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:20px;">Waiting for ${p.name} to accept…</div>
      <button class="action-btn secondary" onclick="cancelChallenge()">Cancel Challenge</button>
    </div>`;

  // Auto-accept after 1.8–3.5s
  const delay = 1800 + Math.random() * 1700;
  friendChallengeTimeout = setTimeout(() => {
    launchFriendGame(p);
  }, delay);
}

function cancelChallenge() {
  clearTimeout(friendChallengeTimeout);
  challengedPlayer = null;
  document.querySelectorAll('.player-result-card').forEach(c => c.classList.remove('selected-card'));
  document.getElementById('friends-right-area').innerHTML = `
    <div style="text-align:center;color:var(--text3);">
      <div style="font-size:52px;margin-bottom:16px;">♟</div>
      <div style="font-size:17px;font-weight:600;color:var(--text);margin-bottom:8px;">Challenge cancelled</div>
      <div style="font-size:14px;">Search for another player to challenge</div>
    </div>`;
}

function launchFriendGame(p) {
  document.getElementById('friends-opp-name').textContent = `${p.flag} ${p.name}`;
  document.getElementById('friends-opp-elo').textContent = `⭐ ${p.elo} ELO`;
  document.getElementById('friends-opp-avatar').textContent = p.avatar;

  document.getElementById('friends-search-screen').style.display = 'none';
  document.getElementById('friends-game-screen').style.display = 'flex';

  if (games['friends']) delete games['friends'];
  const g = createGame('friends', false, yourColor || 'w', 'medium');
  g.opponentName = p.name;
  g.roomId = currentRoomId;
  activeGame = g;
}

function cancelFriendGame() {
  clearTimeout(friendChallengeTimeout);
  challengedPlayer = null;
  if (games['friends']) delete games['friends'];
  document.getElementById('friends-search-screen').style.display = 'flex';
  document.getElementById('friends-game-screen').style.display = 'none';
  document.getElementById('friends-right-area').innerHTML = `
    <div style="text-align:center;color:var(--text3);">
      <div style="font-size:52px;margin-bottom:16px;">♟</div>
      <div style="font-size:17px;font-weight:600;color:var(--text);margin-bottom:8px;">Search for a player</div>
      <div style="font-size:14px;">Type a username in the search box and send them a challenge</div>
    </div>`;
}

// ===== COMPUTER SETUP =====
let selectedDiff = 'easy';
let selectedColor = 'white';

function selectDiff(el, diff) {
  document.querySelectorAll('.diff-option').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
  selectedDiff = diff;
}

function selectColor(el, color) {
  document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedColor = color;
}

function startComputerGame() {
  let playerColor = selectedColor === 'random'
    ? (Math.random() < 0.5 ? 'white' : 'black')
    : selectedColor;
  const pColor = playerColor === 'white' ? 'w' : 'b';

  document.getElementById('comp-setup-screen').style.display = 'none';
  document.getElementById('comp-game-screen').style.display = 'flex';

  if (pColor === 'w') {
    document.getElementById('comp-top-name').textContent = 'Computer (' + selectedDiff + ')';
    document.getElementById('comp-bottom-name').textContent = 'You (White)';
    document.getElementById('comp-top-avatar').textContent = '🤖';
    document.getElementById('comp-bottom-avatar').textContent = '♔';
  } else {
    document.getElementById('comp-top-name').textContent = 'You (Black)';
    document.getElementById('comp-bottom-name').textContent = 'Computer (' + selectedDiff + ')';
    document.getElementById('comp-top-avatar').textContent = '♚';
    document.getElementById('comp-bottom-avatar').textContent = '🤖';
  }

  const g = createGame('comp', true, pColor, selectedDiff);
  activeGame = g;

  if (pColor === 'b') {
    setTimeout(() => makeComputerMove(g), 600);
  }
}

function showCompSetup() {
  document.getElementById('comp-setup-screen').style.display = 'flex';
  document.getElementById('comp-game-screen').style.display = 'none';
  if (games['comp']) delete games['comp'];
}

// ===== INIT =====
function init() {
  updateBoardPreview('default');
  document.body.setAttribute('data-pieces', 'classic');
  createGame('offline');
  activeGame = games['offline'];
  showOnlineFind();
  renderPuzzleGrid();
  initChatScrollListeners();
}

init();
