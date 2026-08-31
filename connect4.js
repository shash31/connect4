const root = document.documentElement;

const boardElem = document.getElementById("board")
const columnElems = document.querySelectorAll('.column')

// For drop animations
for (const col of columnElems) {
    let i = 1;
    for (const child of col.children) {
        child.children[0].style.setProperty('--drop-height', `-${i*100}%`)
        i++
    }
}

boardElem.addEventListener('click', dropUI)
document.getElementById('reset').addEventListener('click', reset)
document.getElementById('undo').addEventListener('click', undo)
document.getElementById('enginemove').addEventListener('click', engineMove)

let opp = document.getElementById('opp')
let depth = document.getElementById('depth')

let turn = 'red'

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
        boardElem.removeEventListener('click', dropUI)
    }
}

engineworker.onmessage = (event) => {
    console.log('received move')
    console.log(event.data)

    boardElem.addEventListener('click', dropUI)

    const { move, metrics } = event.data

    make_move(move)

    nps.textContent = `${Math.trunc(metrics.nodes / metrics.timeElapsedMs)}`
    nodes_searched.textContent = `${metrics.nodes}`
    time_taken.textContent = `${metrics.timeElapsedMs.toFixed(2)}ms`
}

function changeTurn() {
    if (turn === 'red') {
        turn = 'blue'
        root.style.setProperty('--hover-color', 'var(--blue-hover)')
    } else {
        turn = 'red'
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

    engineMove(); // If needed
}

function make_move(col) {
    for (let i = 5; i >= 0; i--) {
        if (board[i][col] == 0) {
            board[i][col] = turn
            moves.push(col)
            console.log(board)
            console.log(moves)

            const circle = columnElems[col].children[i].children[0]
            circle.classList.add(turn)
            circle.style.animation = 'dropCoin 0.5s ease-in'

            changeTurn()

            if (checkWin(board)) {
                console.log(`${turn} won`)
                boardElem.removeEventListener('click', dropUI)
            }

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

    const col = moves.pop()
    changeTurn()

    for (let i = 0; i < 6; i++) {
        if (board[i][col] != 0) {
            columnElems[col].children[i].children[0].classList.remove(turn)
            board[i][col] = 0
            break
        }
    }
}

function reset() {
    turn = 'red'
    root.style.setProperty('--hover-color', '#FF000040')
    board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
    ]
    moves = []
    for (const col of columnElems) {
        for (const child of col.children) {
            child.children[0].classList.remove('red')
            child.children[0].classList.remove('blue')
            child.children[0].style.animation = 'none'
        }
    }
    boardElem.addEventListener('click', dropUI)
}
