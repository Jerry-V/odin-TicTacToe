const gameBoard = (() => {
    // Create an array where its values are its keys:
    // How to create an array of numbers in javascript
    // https://www.cloudhadoop.com/javascript-create-array-numbers/
    const defaultArray = [...Array(9).keys()];
    
    // Note: javascript will sometimes pass objects (like arrays)
    // as by-reference instead of by-value. Thus changing
    // cellsArray would change defaultArray (2 names, same memory chunk).
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
    // How to grab all cells at once:
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
        refreshDisplay();
        gameController.startRound();
        gameController.resultsMesssage_Reset();
    }
    
    resetButton.addEventListener('click', resetBoard);
    
    return {
        refreshDisplay,
        resetBoard
    }
})();

const gameController = (() => {
    const player1 = `X`;
    const player2 = 'O';
    let _currentPlayer = player1;
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
        // Need to be careful about parameter names overwriting module names.
        // Having a parameter named "currentPlayer" will cause subsequent uses
        // of "currentPlayer" to refer to that parameter and NOT the module-scoped
        // version. This tripped me up several times until I recognized
        // what was happening. b/c of this I added the "_" to the module-scoped
        // variable to help distinguish this from function-parameter versions.
        if (_currentPlayer === player1) {
            _currentPlayer = player2;
        } else {
            _currentPlayer = player1;
        }
    }
    
    const isEmpty = (index) => {
        let symbol = gameBoard.getCell(index);
        return ((symbol !== player1) && (symbol !== player2)) ? true : false;
    }
    
    const isSubset = (parentArray, subsetArray) => {
        // Method of checking subsets:
        // Javascript: Check if an Array is a Subset of Another Array
        // https://fjolt.com/article/javascript-check-if-array-is-subset
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
        
        // If all of a singlular victoryConditions' sub-array values are in the
        // the present indicesOfPlayer, that player has won. In other words, if
        // a victoryConditions' sub-array is a subset of the indicesOfPlayer array
        // then said player has won. This is due to a player potentially marking
        // more cells than needed to directly contribute to three symbols in a row.
        // In other-other words... the victoryConditions' sub-array are a list of
        // MINIMAL requirements for victory (all of your marks might not be the 3
        // that get you victory). I remember some comments about how this method may
        // fail if there are duplicates of values, but I didn't investigate that.
        // Either case is moot since no duplicate values are introduced in my code.
        for (let i = 0; i < victoryConditions.length; i++) {
            if (isSubset(indicesOfPlayer, victoryConditions[i])) {
                return true
            }
        }
        
        return false
    }
    
    const checkFull = () => {
        // This function enables detection of the "draw" end-state
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
        messageDiv.classList.add("invisible");
    }
    
    const resultsMessage = (inputPlayer, isWin) => {
        if (isWin === true) {
            messageDiv.innerText = `Player ${inputPlayer} Won.`;
            messageDiv.classList.remove("invisible");
        } else {
            messageDiv.innerText = `Round is a Draw.`;
            messageDiv.classList.remove("invisible");
        }
    }
    
    const stopRound = () => {
        // How to remove eventListeners, this prevents additional moves
        // beyond an end-state condition such as a win/loss/draw.
        // How To Remove All Event Listeners From An Element Using JavaScript:
        // https://learnshareit.com/how-to-remove-all-event-listeners-from-an-element-using-javascript/
        for (let i = 0; i < cells.length; i++) {
            const clone = cells[i].cloneNode(true);
            // Even though replace isn't used again, this overall
            // method is a quick way to disable the cell's clickability.
            const replace = cells[i].replaceWith(clone);
        }
        _currentPlayer = player1;
    }
    
    // Using event handlers with drop down menus:
    // What event handler do I need to use for a drop down menu list in JavaScript?
    // https://stackoverflow.com/questions/33932395/what-event-handler-do-i-need-to-use-for-a-drop-down-menu-list-in-javascript
    // https://www.w3schools.com/jsref/event_onchange.asp
    const dropdownItem = document.getElementById(`gameModeSelect`);
    let gameMode = dropdownItem.value;
    document.getElementById("gameModeSelect").onchange = function() {
        getSelection();
        stopRound();
        displayController.resetBoard();
    };
    
    const getSelection = () => {
        gameMode = dropdownItem.value;
    }
    
    const startRound = () => {
        // Pass Parameters into an even listener
        // https://www.w3schools.com/js/js_htmldom_eventlistener.asp
        player = player1;
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', function(){ playerMove(i, _currentPlayer, gameMode); });
        }
    }
    
    startRound();
    
    const playerMove = (index, inputPlayer, gameMode) => {
        let currentBoard = gameBoard.listCells();
        
        if (isEmpty(index)) {

            gameBoard.setCell(index, inputPlayer);
            
            if (checkWin(currentBoard, inputPlayer)) {
                resultsMessage(inputPlayer, true);
                stopRound();
            } else if (checkFull()) {
                resultsMessage(inputPlayer, false);
                stopRound();
            } else if (gameMode === `computer`) {
                changePlayer();
                
                // Using "_currentPlayer" b/c "changePlayer()" does not
                // change "inputPlayer", it only changes "_currentPlayer".
                // I.e. I need the module-scoped value, not the parameter.
                // (This was producing a bug that tripped me up until I
                // realized what was happening, I don't want to forget :D)
                let choice = minimax(currentBoard, _currentPlayer).index;
                gameBoard.setCell(choice, _currentPlayer);
                
                if(checkWin(currentBoard, _currentPlayer)) {
                    resultsMessage(_currentPlayer, true);
                    stopRound();
                } else if (checkFull()) {
                    resultsMessage(_currentPlayer, false);
                    stopRound();
                } else {
                    changePlayer();
                }
            } else if (gameMode === `human`) {
                changePlayer()
            } else {
                console.error(`turn bug`)
            }
        }

        displayController.refreshDisplay();
    }
    
    const emptySpots = (inputBoard) => {
        // Returns array of the indecies in inputBoard that are "empty"
        let emptyIndexSpots = [];        
        let pattern = /[0-9]/;    
        
        for (let i = 0 ; i < inputBoard.length; i++) {
            if(pattern.test(inputBoard[i])) {
                emptyIndexSpots.push(i);
            }
        }
        
        return emptyIndexSpots;
    }
    
    // Minimax algorithm research:
    
    // Videos I watched to understand what the Minimax
    // algorithm is and how it works:
        // The minimax algorithm in 3 minutes
        // a bit of intelligence
        // https://www.youtube.com/watch?v=N5DRomy0F08
        
        // Algorithms Explained – minimax and alpha-beta pruning
        // Sebastian Lague
        // https://www.youtube.com/watch?v=l-hh51ncgDI
    
    // For the idea on how to "grade" base case utility values (ratings for Win/Loss/Draw).
    // I ended up not using it, but it is a method that can be hybridized with a minimax
    // function that accepts a parameter of "depth" such as one shown by Sebastian Lague's
    // video. This would enable the minimax algorithm to not require guaranteed ends to the
    // game, such as tic-tac-toe, but instead would let the algorithm look a certain number
    // of moves "ahead" of what the board currently is at (like chess). To prevent predictability
    // this can also be hybridized with a randomizing function if two or more choices end up
    // with the same or similar score. This way the computer would be intelligent, though not
    // PURELY deterministic, making the same choices every single time a game is played a specific
    // way. It would choose among the better moves, but not always the same move among them.
    // Sometimes the best move doesn't seem the best given a certain depth of forsight.
        // Coding an UNBEATABLE Tic Tac Toe AI (Game Theory Minimax Algorithm EXPLAINED)
        // Kylie Ying
        // https://youtu.be/fT3YWCKvuQE
    
    // For guidance on the minimax algorithm and how to implement it
        // JavaScript Tic Tac Toe Project Tutorial - Unbeatable AI w/ Minimax Algorithm
        // freeCodeCamp.org
        // https://youtu.be/P2TcQ3h0ipQ
    
    const minimax = (inputBoard, inputPlayer) => {
        let emptySpotsArray = emptySpots(inputBoard);
        
        // Base cases for recursion
        if (checkWin(inputBoard, player1)) {
            return {score: 10}
        } else if (checkWin(inputBoard, player2)) {
            return {score: -10}
        } else if (emptySpotsArray.length === 0) {
            return {score: 0}
        }
        
        let availableMoves = [];
        
        // Recursion section
        for (let i = 0; i < emptySpotsArray.length; i++) {
            let boardIndex = emptySpotsArray[i];
            let move = {index: boardIndex, score: undefined};
            let previousBoardValue = inputBoard[boardIndex];
            
            // Explore what making a move in this spot would implicate
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
            
            // Reset the board in order to explore other choices
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
        
        return availableMoves[bestMoveIndex];
    }
    
    return {
        startRound,
        resultsMesssage_Reset, emptySpots
    }
})();