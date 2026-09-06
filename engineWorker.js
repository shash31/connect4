import baseMinimax from './engines/minimax.js'
import alphaBetaMove from './engines/alphabeta.js'
import bigIntBitboard from './engines/bigIntBitboard.js'
import smiBitboard from './engines/smiBitboard.js'

self.onmessage = (event) => {
    // const { board, engineType, depth, turn } = event.data
    let { board, engineType, depth, turn } = event.data

    console.log(event.data)

    if (engineType == 'baseminimax') {
        const [move, metrics] = baseMinimax(board, depth, turn)

        postMessage({ move, metrics })
    } else if (engineType == 'alphabeta') {
        const [move, metrics] = alphaBetaMove(board, depth, turn)

        postMessage({ move, metrics })
    } else if (engineType == 'bigIntBitboard') {
        const [move, metrics] = bigIntBitboard(board, depth, turn)

        postMessage({ move, metrics })
    } else if (engineType == 'smibitboard') {
        // smiBitboard(board, depth, turn)
        // board = [
        //     [0, 0, 1, 2, 2, 0, 0],
        //     [0, 0, 2, 2, 1, 0, 0],
        //     [2, 0, 2, 2, 1, 2, 0],
        //     [1, 0, 1, 1, 2, 1, 0],
        //     [1, 0, 1, 2, 1, 1, 0],
        //     [1, 2, 1, 2, 1, 2, 2]
        // ]
        // const [move, metrics] = smiBitboard(board, depth, 1)

        const [move, metrics] = smiBitboard(board, depth, turn)

        postMessage({ move, metrics })
    }
}