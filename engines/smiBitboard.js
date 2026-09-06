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
    // // printBitboard((current_player.left >> 7) | (current_player.right << 21))
    // // printBitboard((current_player.left >> 14) | (current_player.right << 14))
    // // printBitboard((current_player.left >> 21) | (current_player.right << 7))
    // printBitboard(current_player.right)
    // console.log('MASK')
    // printBitboard(mask.left)
    // // printBitboard((mask.left >> 7) | (mask.right << 21))
    // // printBitboard((mask.left >> 14) | (mask.right << 14))
    // // printBitboard((mask.left >> 21) | (mask.right << 7))
    // printBitboard(mask.right)

    // const childs = children(mask);
    // for (const child of childs) {
    //     const [new_mask, new_current_player] = make_move(mask, current_player, child)

    //     console.log('current player:')
    //     printBitboard(new_current_player.left)
    //     printBitboard(new_current_player.right)
    //     console.log('Mask:')
    //     printBitboard(new_mask.left)
    //     printBitboard(new_mask.right)
    // }

    // console.log('opp:', evaluate(current_player.left^mask.left, current_player.right^mask.right))
    // console.log('cur:', evaluate(current_player.left, current_player.right))

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
    // if ((score != 0) || (depth == 0)) { if (score != 0) {
    //     console.log('score:', score)
    //     console.log('depth:', depth);
    //     console.log('metrics:',metrics);
    //     printBitboard(mask.left);
    //     printBitboard(mask.right);
    //     console.log('mask');
    //     printBitboard(current_player.left);
    //     printBitboard(current_player.right);
    //     console.log('current player');
    // };return score}
    
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
    const new_mask = { left: mask.left, right: mask.right }
    new_current_player.left = current_player.left^mask.left
    new_current_player.right = current_player.right^mask.right
    
    if (col <= 3) {
        new_mask.left |= (mask.left + (1 << (col*7)))
    } else {
        new_mask.right |= (mask.right + (1 << ((col-4)*7)))
    }

    return [new_mask, new_current_player]
}


function evaluate(leftboard, rightboard) {
    // 1: Vertical, 7: Horizontal, 6: Down Diagonal Right, 8: Up Diagonal Right
    const directions = [7, 6, 8];

    // leftboard (columns 0-3); rightboard (columns 4-6)

    // Vertical direction only needs to be checked on left and right boards
    let map = leftboard & (leftboard >> 1);
    if ((map & (map >> 2)) != 0) {
        // console.log(1)
        return -23
    }
    map = rightboard & (rightboard >> 1);
    if ((map & (map >> 2)) != 0) {
        // console.log(1)
        return -23
    }

    const midboard1 = (leftboard >> 7) | ((rightboard & 0x7F) << 21); // 0x7F = bits 0-6 only // Columns 1-4
    const midboard2 = (leftboard >> 14) | ((rightboard & 0x3FFF) << 14); // 0x3FFF = bits 0-13 (cols 4-5) // Columns 2-5
    const rightside = (leftboard >> 21) | (rightboard << 7); // Columns 3-6
    for (let direction of directions) {
        // Shift bits and find overlaps
        // Checking columns 0-3
        map = leftboard & (leftboard >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            // console.log(direction)
            return -23;
        }

        // Checking columns 1-4
        map = midboard1 & (midboard1 >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            // console.log(direction)
            return -23;
        }

        // Checking columns 2-5
        map = midboard2 & (midboard2 >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            // console.log(direction)
            return -23;
        }

        // Checking columns 3-6
        map = rightside & (rightside >> direction);
        if ((map & (map >> (2 * direction))) != 0) {
            // console.log(direction)
            return -23;
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
