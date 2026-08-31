export default function chooseBaseMinimaxMove(board, depth, turn) {
    const metrics = { nodes: 1, timeElapsedMs: 0}

    const start = performance.now();
    
    let moves = children(board)
    let best_move = moves[0]
    let best_score = -30
    for (const col of moves) {
        const i = make_move(board, col, turn)

        turn = turn == 1 ? 2 : 1
        let score = -negamax(board, depth - 1, turn, metrics)
        if (score > 1) score--;
        if (score < -1) score++; 
        
        if (score > best_score) {
            best_score = score
            best_move = col
        }

        board[i][col] = 0 // unmaking move
        turn = turn == 1 ? 2 : 1
    }

    const end = performance.now();
    metrics.timeElapsedMs = end - start;

    console.log('Best score:', best_score)
    console.log('Best move:', best_move)

    return [best_move, metrics]
}

function negamax(board, depth, turn, metrics) {
    metrics.nodes++
    let score = evaluate(board, turn)
    if ((score != 0) || (depth == 0)) return score

    let moves = children(board)
    if (moves.length == 0) return 0; // Tie
    
    let max_score = -30 // Higher than any possible score
    for (const col of moves) {
        const i = make_move(board, col, turn)

        turn = turn == 1 ? 2 : 1
        let score = -negamax(board, depth - 1, turn, metrics)
        if (score > 1) score--;
        if (score < -1) score++; 
        
        if (score > max_score) max_score = score

        board[i][col] = 0 // unmaking move
        turn = turn == 1 ? 2 : 1
    }

    return max_score
}

function children(board) {
    let moves = [3, 4, 2, 5, 1, 6, 0]
    for (let i = 0; i < moves.length; i++) {
        if (board[0][moves[i]] != 0) { 
            moves.splice(i, 1); 
            i--
        }
    }

    return moves
}

function make_move(board, col, turn) {
    for (let i = 5; i >= 0; i--) {
        if (board[i][col] == 0) {
            board[i][col] = turn
            return i; // Return row number for easy unmake
        }
    }
    console.error('Not valid move')
    console.log(board)
    console.log(col)
    console.log(turn)
    console.log('in make_move')
}


function evaluate(board, turn) {
    let oppTurn = turn == 2 ? 1 : 2
    for (let row = 5; row >= 3; row--) {
        for (let col = 0; col < 7; col++) {
            if (board[row][col] == oppTurn) {
                let i; let j
                let win = true;
                // Check E
                if (col <= 3) {
                    for (j = col + 1; j < (col + 4); j++) {
                        if (board[row][j] != oppTurn) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return -23;
                }

                // Check NE
                win = true;
                if (col <= 3) {
                    for (i = row - 1, j = col + 1; (i > (row - 4)) && (j < (col + 4)); i--, j++) {
                        if (board[i][j] != oppTurn) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return -23;
                }

                // Check N
                win = true;
                for (i = row - 1; i > (row - 4); i--) {
                    if (board[i][col] != oppTurn) {
                        win = false;
                        break;
                    }
                }
                if (win) return -23;

                // Check NW
                win = true;
                if (col >= 3) {
                    for (i = row - 1, j = col - 1; (i > (row - 4)) && (j > (col - 4)); i--, j--) {
                        if (board[i][j] != oppTurn) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return -23;
                }
            }
        }
    }

    return 0;
}