const BOTTOM_MASK = Array.from({length: 7}, (_, col) => 1n << BigInt(7 * col));
const TOP_MASK = Array.from({length: 7}, (_, col) => 1n << BigInt(7 * col + 5));

export default function rootNode(board, depth, turn) {
    // Convert array representation to bitboard
    let mask = 0n;
    let current_player = 0n;
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 6; row++) {
            if (board[row][col] != 0) {
                mask |= (1n << BigInt((5 - row) + (7*col)))
                if (board[row][col] == turn) {
                    current_player |= (1n << BigInt((5 - row) + (7*col)))
                }
            }
        }
    }

    // Regular search
    const metrics = { nodes: 1, timeElapsedMs: 0}

    const start = performance.now();
    
    let moves = children(mask)
    let best_move = moves[0]
    let alpha = -30
    let beta = 30
    for (const col of moves) {
        const [new_mask, new_current_player] = make_move(mask, current_player, col)

        let score = -negamax(new_mask, new_current_player, depth - 1, -beta, -alpha, metrics)
        if (score > 1) score--;
        if (score < -1) score++; 
        
        if (score > alpha) {
            alpha = score
            best_move = col
        }
    }

    const end = performance.now();
    metrics.timeElapsedMs = end - start;

    console.log('Best score:', alpha)
    console.log('Best move:', best_move)

    return [best_move, metrics]
}

function negamax(mask, current_player, depth, alpha, beta, metrics) {
    metrics.nodes++
    let score = evaluate(current_player^mask)
    // if ((score != 0) || (depth == 0)) return score
    if ((score != 0) || (depth == 0)) {
        if (score != 0) {
            console.log('score:', score);
            console.log('depth:', depth);
            console.log('metrics:', metrics);
            printBitboard(mask);
            console.log('mask');
            printBitboard(current_player);
            console.log('current player');
        }
        return score
    }

    let moves = children(mask)
    if (moves.length == 0) return 0; // Tie
    
    let max_score = -30 // Higher than any possible score
    for (const col of moves) {
        const [new_mask, new_current_player] = make_move(mask, current_player, col)

        let score = -negamax(new_mask, new_current_player, depth - 1, -beta, -alpha, metrics)
        if (score > 1) score--;
        if (score < -1) score++; 

        if (score > max_score) max_score = score
        if (score > alpha) alpha = score

        if (alpha >= beta) break
    }

    return max_score
}

function children(mask) {
    let moves = [3, 4, 2, 5, 1, 6, 0]
    for (let i = 0; i < moves.length; i++) {
        if ((mask & TOP_MASK[moves[i]]) !== 0n) {
            moves.splice(i, 1)
            i--;
        }
    }

    return moves
}

function make_move(mask, current_player, col) {
    current_player ^= mask
    mask |= mask + BOTTOM_MASK[col]
    return [mask, current_player]
}


function evaluate(playerBoard) {
    // Directions to check based on your board layout packing
    const directions = [1n, 7n, 6n, 8n]; // Horizontal, Vertical, Diagonal 1, Diagonal 2

    for (let direction of directions) {
        // Shift bits and find overlaps
        let map = playerBoard & (playerBoard >> direction);
        if ((map & (map >> (2n * direction))) !== 0n) {
            return -23; // Found 4-in-a-row simultaneously anywhere on the board!
        }
    }
    return 0;
}

function get_bit(board, index) {
    return (board & (1n << BigInt(index))) !== 0n;
}

function printBitboard(board) {
    let boardstr = '';
    for (let i = 6; i >= 0; i--) {
        for (let j = 0; j < 7; j++) {
            boardstr += get_bit(board, (7*j)+i) ? '1 ' : '0'
        }
        boardstr += '\n'
    }
    console.log(boardstr)
    console.log(board)
}
