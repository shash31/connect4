import baseMinimax from './engines/minimax.js'
import alphaBetaMove from './engines/alphabeta.js'
import bigIntBitboard from './engines/bigIntBitboard.js'
import smiBitboard from './engines/smiBitboard.js'

self.onmessage = (event) => {
    const { board, engineType, depth, turn } = event.data

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
        const [move, metrics] = smiBitboard(board, depth, turn)

        postMessage({ move, metrics })
    }
}