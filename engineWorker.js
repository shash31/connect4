import baseMinimax from './engines/minimax.js'
import alphaBetaMove from './engines/alphabeta.js'

self.onmessage = (event) => {
    const { board, engineType, depth, turn } = event.data

    console.log('got move')
    console.log(event.data)

    if (engineType == 'baseminimax') {
        const [move, metrics] = baseMinimax(board, depth, turn)

        postMessage({ move, metrics })
    } else if (engineType == 'alphabeta') {
        const [move, metrics] = alphaBetaMove(board, depth, turn)

        postMessage({ move, metrics })
    }
}