const root = document.documentElement;

const boardElem = document.getElementById("board")
const columnElems = document.querySelectorAll('.column')

const resetBtn = document.getElementById('reset')
const undoBtn = document.getElementById('undo')
const engineBtn = document.getElementById('enginemove')

// For drop animations
for (const col of columnElems) {
    let i = 1;
    for (const child of col.children) {
        child.children[0].style.setProperty('--drop-height', `-${i*100}%`)
        i++
    }
}

boardElem.addEventListener('click', dropUI)
resetBtn.addEventListener('click', reset)
undoBtn.addEventListener('click', undo)
engineBtn.addEventListener('click', engineMove)

const statusDisp = document.getElementById('status')

let opp = document.getElementById('opp')
let depth = document.getElementById('depth')

let turn = 1 // Red = 1; Blue = 2
let winFlag = false

let board = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
]

let moves = []

const engineworker = new Worker('./engineWorker.js', { type: 'module' });
const nps = document.getElementById('nps')
const nodes_searched = document.getElementById('nodes')
const time_taken = document.getElementById('timeelapsed')

function engineMove() {
    // Engine delegation
    if (opp.value != 'twoplayer') {
        console.log('sending move to AI')
        engineworker.postMessage({ board: board, engineType: opp.value, depth: depth.value, turn});
        statusDisp.textContent = 'Engine is thinking...'
        
        // Remove click listeners
        boardElem.removeEventListener('click', dropUI)
        resetBtn.removeEventListener('click', reset)
        undoBtn.removeEventListener('click', undo)
        engineBtn.removeEventListener('click', engineMove)
    }
}

engineworker.onmessage = (event) => {
    console.log('received move')
    console.log(event.data)

    // Add click listeners
    boardElem.addEventListener('click', dropUI)
    resetBtn.addEventListener('click', reset)
    undoBtn.addEventListener('click', undo)
    engineBtn.addEventListener('click', engineMove)

    const { move, metrics } = event.data

    statusDisp.textContent = 'Your move'

    make_move(move)

    nps.textContent = `${Math.trunc(metrics.nodes / (metrics.timeElapsedMs / 1000))}`
    nodes_searched.textContent = `${metrics.nodes}`
    time_taken.textContent = `${metrics.timeElapsedMs.toFixed(2)} ms`
}

function changeTurn() {
    if (turn == 1) {
        turn = 2
        root.style.setProperty('--hover-color', 'var(--blue-hover)')
    } else {
        turn = 1
        root.style.setProperty('--hover-color', 'var(--red-hover)')
    }
}

function dropUI(e) {
    let col;
    if (e.target.classList.contains('column')) {
        col = e.target.dataset.col;
    } else if (e.target.classList.contains('circle-wrapper')) {
        col = e.target.parentElement.dataset.col;
    } else if (e.target.classList.contains('circle')) {
        col = e.target.parentElement.parentElement.dataset.col;
    } 

    make_move(col)

    if (!winFlag) engineMove(); // If needed
    // engineMove()
}

function make_move(col) {
    for (let i = 5; i >= 0; i--) {
        if (board[i][col] == 0) {
            board[i][col] = turn
            moves.push(col)
            console.log(board)
            console.log(moves)

            const circle = columnElems[col].children[i].children[0]
            circle.classList.add(turn == 1 ? 'red' : 'blue')
            circle.style.animation = 'dropCoin 0.5s ease-in'

            if (checkWin(board)) {
                winFlag = true;
                statusDisp.textContent = `${turn == 1 ? 'Red' : 'Blue'} won!!`
                console.log(`${turn} won`)
                boardElem.removeEventListener('click', dropUI)
            } else {
                // Checking draw
                let draw = true
                for (let i = 0; i < 7; i++) {
                    if (board[0][i] == 0) {
                        draw = false;
                        break;
                    }
                }
                if (draw) {
                    statusDisp.textContent = 'Draw'
                    boardElem.removeEventListener('click', dropUI)
                }
            }

            changeTurn()

            break
        }
    }
}

function checkWin(board) {
    for (let row = 5; row >= 0; row--) {
        for (let col = 0; col < 7; col++) {
            if (board[row][col] == turn) {
                let i; let j
                let win = true;
                // Check E
                if (col <= 3) {
                    for (j = col + 1; j < (col + 4); j++) {
                        if (board[row][j] != board[row][col]) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return true;
                }

                // Check NE
                if ((col <= 3) && (row >= 3)) {
                    win = true;
                    for (i = row - 1, j = col + 1; (i > (row - 4)) && (j < (col + 4)); i--, j++) {
                        if (board[i][j] != board[row][col]) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return true;
                }

                // Check N
                if (row >= 3) {
                    win = true;
                    for (i = row - 1; i > (row - 4); i--) {
                        if (board[i][col] != board[row][col]) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return true;
                }

                // Check NW
                if ((col >= 3) && (row >= 3)) {
                    win = true;
                    for (i = row - 1, j = col - 1; (i > (row - 4)) && (j > (col - 4)); i--, j--) {
                        if (board[i][j] != board[row][col]) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return true;
                }
            }
        }
    }

    return false;
}

function undo() {
    if (moves.length == 0) return

    statusDisp.textContent = ''

    const col = moves.pop()
    changeTurn()

    for (let i = 0; i < 6; i++) {
        if (board[i][col] != 0) {
            columnElems[col].children[i].children[0].classList.remove(turn == 1 ? 'red' : 'blue')
            board[i][col] = 0
            break
        }
    }
}

function reset() {
    turn = 1
    root.style.setProperty('--hover-color', 'var(--red-hover)')
    board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
    ]
    moves = []
    winFlag = false
    statusDisp.textContent = ''
    for (const col of columnElems) {
        for (const child of col.children) {
            child.children[0].classList.remove('red')
            child.children[0].classList.remove('blue')
            child.children[0].style.animation = 'none'
        }
    }
    boardElem.addEventListener('click', dropUI)
}
