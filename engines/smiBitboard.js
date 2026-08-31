export default function rootNode(board, depth, turn) {
    // Convert array representation to bitboard
    
    for (let col = 0; col < 7; col++) {
        for (let row = 5; row >= 0; row--) {

        }
    }
    
    // Constants


    // Regular search
    const metrics = { nodes: 1, timeElapsedMs: 0}

    const start = performance.now();
    
    let moves = children(board)
    let best_move = moves[0]
    let alpha = -30
    let beta = 30
    for (const col of moves) {
        const i = make_move(board, col, turn)

        turn = turn == 1 ? 2 : 1
        let score = -negamax(board, depth - 1, turn, -beta, -alpha, metrics)
        if (score > 1) score--;
        if (score < -1) score++; 
        
        if (score > alpha) {
            alpha = score
            best_move = col
        }

        board[i][col] = 0 // unmaking move
        turn = turn == 1 ? 2 : 1
    }

    const end = performance.now();
    metrics.timeElapsedMs = end - start;

    console.log('Best score:', alpha)
    console.log('Best move:', best_move)

    return [best_move, metrics]
}

function negamax(board, depth, turn, alpha, beta, metrics) {
    metrics.nodes++
    let score = evaluate(board, turn)
    if ((score != 0) || (depth == 0)) return score

    let max_score = -30 // Higher than any possible score
    for (const col of children(board)) {
        const i = make_move(board, col, turn)

        turn = turn == 1 ? 2 : 1
        let score = -negamax(board, depth - 1, turn, -beta, -alpha, metrics)
        if (score > 1) score--;
        if (score < -1) score++; 

        board[i][col] = 0 // unmaking move
        turn = turn == 1 ? 2 : 1

        if (score > max_score) max_score = score
        if (score > alpha) alpha = score

        if (alpha >= beta) break
    }

    return max_score
}

function children(board) {

}

function make_move(board, col, turn) {

}


function evaluate(board, turn) {

}