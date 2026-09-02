export default function rootNode(board, depth, turn) {
    // Convert array representation to bitboard
    const current_player = { left: 0, right: 0 }
    const mask = { left: 0, right: 0 }
    for (let col = 0; col < 4; col++) {
        for (let row = 5; row >= 0; row--) {
            if (board[row][col] == turn) {
                let n = (1 << (col*7)+(5-row))
                current_player.left |= n
                mask.left |= n
            } else if (board[row][col] != 0) {
                let n = (1 << (col*7)+(5-row))
                mask.left |= n
            }
        }
    }
    for (let col = 4; col < 7; col++) {
        for (let row = 5; row >= 0; row--) {
            if (board[row][col] == turn) {
                let n = (1 << ((col-4)*7)+(5-row))
                current_player.right |= n
                mask.right |= n
            } else if (board[row][col] != 0) {
                let n = (1 << ((col-4)*7)+(5-row))
                mask.right |= n
            }
        }
    }

    // console.log('Player: ', turn)
    // printBitboard(current_player.left)
    // printBitboard((current_player.left >> 7) | (current_player.right << 21))
    // printBitboard((current_player.left >> 14) | (current_player.right << 14))
    // printBitboard((current_player.left >> 21) | (current_player.right << 7))
    // console.log('MASK')
    // printBitboard(mask.left)
    // printBitboard((mask.left >> 7) | (mask.right << 21))
    // printBitboard((mask.left >> 14) | (mask.right << 14))
    // printBitboard((mask.left >> 21) | (mask.right << 7))

    // console.log(evaluate(current_player.left^mask.left, current_player.right^mask.right))

    // return;

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
    let score = evaluate(current_player.left^mask.left, current_player.right^mask.right)
    if ((score != 0) || (depth == 0)) return score

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
        if (moves[i] <= 3) {
            if ((mask.left & (1 << (moves[i]*7)+5)) != 0) {
                moves.splice(i, 1)
                i--;
            }
        } else {
            if ((mask.right & (1 << ((moves[i]-4)*7)+5)) != 0) {
                moves.splice(i, 1)
                i--;
            }
        }
    }

    return moves
}

function make_move(mask, current_player, col) {
    const new_current_player = { left: 0, right: 0 }
    const new_mask = { left: 0, right: 0 }
    new_current_player.left = current_player.left^mask.left
    new_current_player.right = current_player.right^mask.right
    
    if (col <= 3) {
        new_mask.left = mask.left | (mask.left + (1 << (col*7)))
    } else {
        new_mask.right = mask.right | (mask.right + (1 << ((col-4)*7)))
    }

    return [new_mask, new_current_player]
}


function evaluate(leftboard, rightboard) {
    // Directions to check based on your board layout packing
    const directions = [1, 7, 6, 8]; // Horizontal, Vertical, Diagonal 1, Diagonal 2

    // leftboard (columns 0-3); rightboard (columns 4-6)

    const midboard1 = (leftboard >> 7) | (rightboard << 21); // Columns 1-4
    const midboard2 = (leftboard >> 14) | (rightboard << 14); // Columns 2-5
    const rightside = (leftboard >> 21) | (rightboard << 7); // Columns 3-6
    for (let direction of directions) {
        // Shift bits and find overlaps
        // Checking columns 0-3
        let map = leftboard & (leftboard >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            return -23; // Found 4-in-a-row simultaneously anywhere on the board!
        }

        // Checking columns 1-4
        map = midboard1 & (midboard1 >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            return -23; // Found 4-in-a-row simultaneously anywhere on the board!
        }

        // Checking columns 2-5
        map = midboard2 & (midboard2 >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            return -23; // Found 4-in-a-row simultaneously anywhere on the board!
        }

        // Checking columns 3-6
        map = rightside & (rightside >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            return -23; // Found 4-in-a-row simultaneously anywhere on the board!
        }
    }
    return 0;
}

function get_bit(board, index) {
    return (board & (1 << index)) != 0;
}

function printBitboard(board) {
    let boardstr = '';
    for (let i = 6; i >= 0; i--) {
        for (let j = 0; j < 4; j++) {
            boardstr += get_bit(board, (7*j)+i) ? '1 ' : '0'
        }
        boardstr += '\n'
    }
    console.log(boardstr)
    console.log(board)
}
