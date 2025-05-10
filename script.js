document.addEventListener('DOMContentLoaded', () => {
    // Game state variables
    const state = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameActive: true,
        gameMode: 'player', // 'player' or 'ai'
        scores: {
            X: 0,
            O: 0
        },
        winPatterns: [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ]
    };

    // DOM Elements
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-button');
    const vsPlayerButton = document.getElementById('vs-player');
    const vsAIButton = document.getElementById('vs-ai');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');

    // Initialize scores display
    scoreX.textContent = state.scores.X;
    scoreO.textContent = state.scores.O;

    // Event Listeners
    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(parseInt(cell.getAttribute('data-index'))));
    });

    resetButton.addEventListener('click', resetGame);
    vsPlayerButton.addEventListener('click', () => setGameMode('player'));
    vsAIButton.addEventListener('click', () => setGameMode('ai'));

    // Game Mode Functions
    function setGameMode(mode) {
        state.gameMode = mode;
        if (mode === 'player') {
            vsPlayerButton.classList.add('active');
            vsAIButton.classList.remove('active');
        } else {
            vsPlayerButton.classList.remove('active');
            vsAIButton.classList.add('active');
        }
        resetGame();
    }

    // Cell Click Handler
    function handleCellClick(index) {
        // Return if cell is filled or game is not active
        if (state.board[index] !== '' || !state.gameActive) return;

        // Update the board state
        state.board[index] = state.currentPlayer;
        cells[index].textContent = state.currentPlayer;
        cells[index].classList.add(state.currentPlayer.toLowerCase());
        
        // Add animation effect when marking a cell
        cells[index].style.transform = "scale(1.05)";
        setTimeout(() => {
            cells[index].style.transform = "scale(1)";
        }, 200);

        // Check for game result
        if (checkWin()) {
            const winner = state.currentPlayer;
            state.scores[winner]++;
            updateScoreDisplay();
            highlightWinningCells();
            endGame(`Player ${winner} wins!`);
        } else if (checkDraw()) {
            endGame("It's a draw!");
        } else {
            // Switch players
            state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
            updateStatus(`Player ${state.currentPlayer}'s turn`);
            
            // If AI mode and it's O's turn, make AI move
            if (state.gameMode === 'ai' && state.currentPlayer === 'O' && state.gameActive) {
                setTimeout(makeAIMove, 600);
            }
        }
    }

    // Make AI Move
    function makeAIMove() {
        if (!state.gameActive) return;
        
        let bestScore = -Infinity;
        let move;
        
        // Simple minimax approach for AI
        for (let i = 0; i < 9; i++) {
            // If cell is empty
            if (state.board[i] === '') {
                // Try this move
                state.board[i] = 'O';
                // Calculate score for this move
                const score = minimaxScore(state.board, 0, false);
                // Undo the move
                state.board[i] = '';
                
                // Update best move if better
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        // Make the best move
        if (move !== undefined) {
            handleCellClick(move);
        }
    }
    
    // Simplified minimax helper for AI
    function minimaxScore(board, depth, isMaximizing) {
        // Terminal states
        const winner = getWinner(board);
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (isBoardFull(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    bestScore = Math.max(bestScore, minimaxScore(board, depth + 1, false));
                    board[i] = '';
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    bestScore = Math.min(bestScore, minimaxScore(board, depth + 1, true));
                    board[i] = '';
                }
            }
            return bestScore;
        }
    }
    
    // Helper function for minimax to determine winner
    function getWinner(board) {
        for (const pattern of state.winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    // Helper function for minimax to check if board is full
    function isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    // Check for win
    function checkWin() {
        return state.winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                state.winningPattern = pattern;
                return true;
            }
            return false;
        });
    }

    // Highlight winning cells
    function highlightWinningCells() {
        if (state.winningPattern) {
            state.winningPattern.forEach(index => {
                cells[index].classList.add('winner');
            });
        }
    }

    // Check for draw
    function checkDraw() {
        return state.board.every(cell => cell !== '');
    }

    // End game
    function endGame(message) {
        state.gameActive = false;
        updateStatus(message);
    }

    // Update status message
    function updateStatus(message) {
        statusDisplay.textContent = message;
    }

    // Update score display
    function updateScoreDisplay() {
        scoreX.textContent = state.scores.X;
        scoreO.textContent = state.scores.O;
    }

    // Reset game
    function resetGame() {
        state.board = Array(9).fill('');
        state.currentPlayer = 'X';
        state.gameActive = true;
        state.winningPattern = null;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        updateStatus(`Player X's turn`);
    }
});