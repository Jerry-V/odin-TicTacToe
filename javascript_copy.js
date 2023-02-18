const gameBoard = (() => {
    // Create an array where its values are its keys:
    // How to create an array of numbers in javascript
    // https://www.cloudhadoop.com/javascript-create-array-numbers/
    const defaultArray = [...Array(9).keys()];
    
    // Note: javascript will sometimes pass objects (like arrays)
    // as by-reference instead of by-value. Thus changing
    // cellsArray will change defaultArray (2 names, same memory chunk).
    // https://www.geeksforgeeks.org/pass-by-value-and-pass-by-reference-in-javascript/
    let cellsArray = Object.create(defaultArray);
    
    const maxIndex = cellsArray.length - 1;
    
    const setCell = (index, value) => {
        if (index <= maxIndex && index >= 0) {
            cellsArray[index] = value;
        } else {
            return console.error('gameBoard.setCell() Error');
        }
    }
    
    const getCell = (index) => {
        if (index <= maxIndex && index >= 0) {
            return cellsArray[index];
        } else {
            return console.error('gameBoard.getCell() Error');
        }
    }
    
    const listCells = () => {
        return cellsArray;
    }
    
    const resetCellsArray = () => {
        cellsArray = Object.create(defaultArray);
    }
    
    return {
        setCell,
        getCell,
        listCells,
        resetCellsArray,
    }
})();

const displayController = (() => {
    // how to grab all cells at once
    // https://www.w3schools.com/js/js_htmldom_nodelist.asp
    const cells = document.getElementsByClassName('cell');
    
    const refreshDisplay = () => {
        // Using regex to logical test:
        // https://www.w3schools.com/jsref/jsref_regexp_0-9.asp
        // https://www.w3schools.com/jsref/jsref_regexp_test.asp
        let pattern = /[0-9]/;
        let boardArray = gameBoard.listCells();
        for (let i = 0 ; i < cells.length; i++) {
            // Check if not a number, if so then display
            if(!pattern.test(boardArray[i])) {
                cells[i].innerText = gameBoard.getCell(i);
            } else {
                cells[i].innerText = '';
            }
        }
    };
    
    refreshDisplay();
    
    const resetButton = document.getElementById("reset-btn");
    
    const resetBoard = () => {
        gameBoard.resetCellsArray();
        // console.log(`Before refresh: ${gameBoard.listCells()}`);
        refreshDisplay();
        // console.log(`After refresh: ${gameBoard.listCells()}`);
        gameController.startRound();
        gameController.resultsMesssage_Reset();
    }
    
    resetButton.addEventListener('click', resetBoard);
    
    return {
        refreshDisplay,
    }
})();

const gameController = (() => {
    const player1 = 'X';
    const player2 = 'O';
    let currentPlayer = player1;
    const victoryConditions = [
        //Horizontals
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // Verticals
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // Diagonals
        [0, 4, 8],
        [2, 4, 6]
    ]
    
    // Differences between HTMLCollection vs. NodeList
    // https://www.w3schools.com/jsref/met_document_queryselectorall.asp
    const cells = document.getElementsByClassName("cell");
    
    const changePlayer = () => {
        // console.log(`Before player change: ${currentPlayer}`);
        if (currentPlayer === player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
        // console.log(`After player change: ${currentPlayer}`);
    }
    
    const isEmpty = (index) => {
        let symbol = gameBoard.getCell(index);
        return ((symbol !== player1) && (symbol !== player2)) ? true : false;
    }
    
    // Method of checking subsets:
    // Javascript: Check if an Array is a Subset of Another Array
    // https://fjolt.com/article/javascript-check-if-array-is-subset
    const isSubset = (parentArray, subsetArray) => {
        return subsetArray.every((element) => {
            return parentArray.includes(element)
        })
    }
    
    const checkWin = (inputBoard, playerSymbol) => {
        // How to check where a specific value is in an array and all of its indeces if it is repeated.
        // "Finding all the occurrences of an element":
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
        const indicesOfPlayer = [];
        const cells = inputBoard;
        let currentIndex = cells.indexOf(playerSymbol);
        
        while (currentIndex !== -1) {
            indicesOfPlayer.push(currentIndex);
            currentIndex = cells.indexOf(playerSymbol, currentIndex + 1);
        }
        
        for (let i = 0; i < victoryConditions.length; i++) {
            if (isSubset(indicesOfPlayer, victoryConditions[i])) {
                return true
            }
        }
        
        return false
    }
    
    const checkFull = () => {
        const board = gameBoard.listCells();
        
        // Difference between for...in and for...of loops
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#for...of_statement
        let unmarkedCellCount = 0;
        
        for (const cell of board) {
            if ((cell !== player1) && (cell !== player2)) {
                unmarkedCellCount++;
            }
        }
        
        if (unmarkedCellCount === 0) {
            return true;
        } else {
            return false;
        }
    }
    
    const messageDiv = document.getElementById('results-msg');
    
    const resultsMesssage_Reset = () => {
        messageDiv.innerText = ``;
    }
    

    
    const stopRound = () => {
        // How to remove eventListeners
        // How To Remove All Event Listeners From An Element Using JavaScript:
        // https://learnshareit.com/how-to-remove-all-event-listeners-from-an-element-using-javascript/
        for (let i = 0; i < cells.length; i++) {
            const clone = cells[i].cloneNode(true);
            const replace = cells[i].replaceWith(clone);
        }
        currentPlayer = player1;
    }
    
    const startRound = () => {
        // Pass Parameters into an even listener
        // https://www.w3schools.com/js/js_htmldom_eventlistener.asp
        player = player1;
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', function(){ playerMove(i, currentPlayer); });
        }
    }
    
    startRound();
    
    const playerMove = (index, currentPlayer) => {
        let currentBoard = gameBoard.listCells();
        if (isEmpty(index)) {
            if (currentPlayer === player1) {
                gameBoard.setCell(index, currentPlayer);
                if(checkWin(currentBoard, currentPlayer)) {
                    messageDiv.innerText = `Player ${currentPlayer} Won.`;
                    stopRound();
                } else if (checkFull()) {
                    messageDiv.innerText = `Round is a Draw.`;
                    stopRound();
                } else {
                    changePlayer();
                    let choice = minimax(currentBoard, player2).index;
                    gameBoard.setCell(choice, player2);
                    if(checkWin(currentBoard, player2)) {
                        messageDiv.innerText = `Player ${player2} Won.`;
                        stopRound();
                    } else if (checkFull()) {
                        messageDiv.innerText = `Round is a Draw.`;
                        stopRound();
                    } else {
                        changePlayer();
                    }
                }
            } else {
                console.error(`Error in playerMove`)
            }

        }
        displayController.refreshDisplay();
    }
    
    const emptySpots = (inputBoard) => {
        // Returns array of index's in inputBoard that are "empty"
        let emptyIndexSpots = [];        
        let pattern = /[0-9]/;
        
        for (let i = 0 ; i < inputBoard.length; i++) {
            if(pattern.test(inputBoard[i])) {
                emptyIndexSpots.push(i);
            }
        }
        
        return emptyIndexSpots;
    }
    
    const minimax = (inputBoard, inputPlayer) => {
        let emptySpotsArray = emptySpots(inputBoard);
        
        if (checkWin(inputBoard, player1)) {
            return {score: 10}
        } else if (checkWin(inputBoard, player2)) {
            return {score: -10}
        } else if (emptySpotsArray.length === 0) {
            return {score: 0}
        }
        
        let availableMoves = [];
        
        for (let i = 0; i < emptySpotsArray.length; i++) {
            let boardIndex = emptySpotsArray[i];
            let move = {index: boardIndex, score: undefined};
            let previousBoardValue = inputBoard[boardIndex];
            inputBoard[boardIndex] = inputPlayer;
            
            if (inputPlayer === player1) {
                let miniMaxResult = minimax(inputBoard, player2);
                move.score = miniMaxResult.score;
            } else if (inputPlayer === player2) {
                let miniMaxResult = minimax(inputBoard, player1);
                move.score = miniMaxResult.score;
            } else {
                console.error(`Error in recursion`);
            }
            
            inputBoard[boardIndex] = previousBoardValue;
            
            availableMoves.push(move);
        }
        
        let bestMoveIndex = undefined;
        let bestScore = undefined;
        
        if (inputPlayer === player1) {
            bestScore = -10000;
            for (let i = 0; i < availableMoves.length; i++) {
                if (availableMoves[i].score > bestScore) {
                    bestScore = availableMoves[i].score;
                    bestMoveIndex = i;
                }
            }
        } else if (inputPlayer === player2) {
            bestScore = 10000;
            for (let i = 0; i < availableMoves.length; i++) {
                if (availableMoves[i].score < bestScore) {
                    bestScore = availableMoves[i].score;
                    bestMoveIndex = i;
                }
            }
        } else {
            console.error(`Error in score updating`);
        }
        // console.log(`minimax executed`);
        return availableMoves[bestMoveIndex];
    }
    
    return {
        startRound,
        resultsMesssage_Reset, emptySpots
    }
})();

// const AIModule = (() => {
    
    
//     return {
//         minimax,
//     }
// })();