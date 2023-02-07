// function for gameBoard information
const gameBoard = (() => {
    // create an array with nothing but 0's for 9 indexes
    // Initializing an Array with a Single Value:
    // https://stackoverflow.com/questions/4049847/initializing-an-array-with-a-single-value#28507704
    
    const defaultValue = ' ';
    const cellsArray = Array(9).fill(defaultValue);
    
    // set cell value function
    // set a specific cell's value to either 1, or 2
    const setCell = (cellIndex, playerSymbol) => {
        if (cellIndex <= 8 && cellIndex >= 0) {
                cellsArray[cellIndex] = playerSymbol;
                // console.log(gameBoard.listCells());
        } else {
            return console.error('index must be 0 to 8');
        }
    }
    
    // get cell value function
    const getCell = cellIndex => {
        if (cellIndex <= 8 && cellIndex >= 0) {
            return cellsArray[cellIndex];
        } else {
            return console.error('index must be 0 to 8');
        }
    }
    
    const listCells = () => {
        return cellsArray;
    }
    
    // reset all cell values function
    // resets all of the cell's to the value 0 (blank)
    const resetCells = () => {
        cellsArray.fill(defaultValue);
        displayController.refreshCells();
    }
    
    const getDefault = () => {
        return defaultValue;
    }
    
    return {
        setCell,
        getCell,
        listCells,
        resetCells,
        getDefault
    }
})();

// function for updating the display
const displayController = (() => {
    // how to grab all cells at once
    // https://www.w3schools.com/js/js_htmldom_nodelist.asp
    const cells = document.getElementsByClassName('cell');
    
    const refreshCells = () => {
        for (let i = 0 ; i < cells.length; i++) {
            cells[i].innerText = gameBoard.getCell(i);
        }        
    };
    
    refreshCells();
    
    const resetButton = document.getElementById("reset-btn");
    
    const resetBoard = () => {
        // console.log('Before: ' + gameBoard.listCells());
        gameBoard.resetCells();
        refreshCells();
        gameController.startRound();
        gameController.resultsMesssage_Reset();
        // console.log('After: ' + gameBoard.listCells());
    }
    
    resetButton.addEventListener('click', resetBoard);
    
    return {
        refreshCells,
    }
})();

const gameController = (() => {
    
    const playerFactory = (symbol) => {
        return symbol;
    }
    
    const player1 = playerFactory('X');
    const player2 = playerFactory('O');
    
    let player = player1;
    
    const getPlayer = () => {
        return player;
    }
    
    const changePlayer = () => {
        if (player === player1) {
            player = player2;
            console.log('player changed:');
            console.log(player);
        } else {
            player = player1;
            console.log('player changed:');
            console.log(player);
        }
    }
    
    // Differences between HTMLCollection vs. NodeList
    // https://www.w3schools.com/jsref/met_document_queryselectorall.asp
    const cells = document.getElementsByClassName("cell");
    
    // Need to be careful about parameter names overwriting module names
    // having a parameter name called player will cause subsequent uses
    // of "player" to refer to that parameter and NOT the mdoule-scoped "player"
    const playerMove =  (cell, currentPlayer) => {
        if (isEmptyCell(cell)) {
            gameBoard.setCell(cell,currentPlayer);
            if(checkGameEnd()) {
                endRound();
            } else {
                changePlayer();
                computerMove(computerChoice_Random());
            }
        }
        displayController.refreshCells();
    }
    
    const computerMove = (cell) => {
        gameBoard.setCell(cell,player);
        if(checkGameEnd()) {
            endRound();
        } else {
            changePlayer();
        }
    }
    
    const computerChoice_Random = () => {
        const validChoices = []
        const cells = gameBoard.listCells();
        const defaultValue = gameBoard.getDefault();
        
        // record indeces of the unmarked cells
        let currentIndex = cells.indexOf(defaultValue);
        while (currentIndex !== -1) {
            validChoices.push(currentIndex);
            currentIndex = cells.indexOf(defaultValue, currentIndex + 1);
        }
        
        const computerRandomChoice =  Math.floor((Math.random() * (validChoices.length)));
        
        return validChoices[computerRandomChoice];
    }
        
    const startRound = () => {
        // Pass Parameters into an even listener
        // https://www.w3schools.com/js/js_htmldom_eventlistener.asp
        player = player1;
        for (let cell = 0; cell < cells.length; cell++) {
            cells[cell].addEventListener('click', function(){ playerMove(cell, player); });
        }
    }
    
    startRound();
    
    const endRound = () => {
        // How to remove eventListeners
        // How To Remove All Event Listeners From An Element Using JavaScript:
        // https://learnshareit.com/how-to-remove-all-event-listeners-from-an-element-using-javascript/
        for (let cell = 0; cell < cells.length; cell++) {
            const clone = cells[cell].cloneNode(true);
            const replace = cells[cell].replaceWith(clone);
            // console.log(cell);
        }
    }
    
    const checkDraw = () => {
        const cells = gameBoard.listCells();
        
        // Difference between for...in and for...of loops
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#for...of_statement
        let unmarkedCellCount = 0;
        for (const value of cells) {
            if ((value != player1) && (value != player2)) {
                unmarkedCellCount++;
            }
        }
        
        // CheckVictory is called to see if the last move is a winning move
        if (unmarkedCellCount === 0) {
            return true;
        } else {
            return false;
        }
    }
    
    const checkVictory = () => {
        const victoryConditions = [
            // An array of sub-arrays where each sub-array is
            // representative of a particular set of indexes 0 to 8 (9 total).
            // This will be used to more effeciently check if particular
            // cells have matching values.
            
            // Assumes a 3x3 grid starting from the upper left corner and
            // going from left to right for each row ending at the bottom right.
            
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
        
        // How to check where a specific value is in an array and all of its indeces if it is repeated.
        // "Finding all the occurrences of an element":
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
        const indicesOfPlayer = [];
        const cells = gameBoard.listCells();
        const symbolOfPlayer = player;
        
        let currentIndex = cells.indexOf(symbolOfPlayer);
        while (currentIndex !== -1) {
            indicesOfPlayer.push(currentIndex);
            currentIndex = cells.indexOf(symbolOfPlayer, currentIndex + 1);
        }
        // console.log(`Player: ${player}`);
        // console.log(`indicesOfPlayer:  ${indicesOfPlayer}`);
        
        // If all of a singlular victoryConditions' sub-array values are in the
        // the present indicesOfPlayer, that player has won. In other words, if
        // a victoryConditions' sub-array is a subset of the indicesOfPlayer array
        // then said player has won. This is due to a player potentially marking
        // more cells that do not directly contribute to three symbols in a row.
        // In other-other words... the victoryConditions' sub-array are a list of
        // MINIMAL requirements for victory (all of your marks might not be the 3
        // that get you victory).
        
        // Method of checking:
        // Javascript: Check if an Array is a Subset of Another Array
        // https://fjolt.com/article/javascript-check-if-array-is-subset
        let isSubset = (parentArray, subsetArray) => {
            return subsetArray.every((element) => {
                return parentArray.includes(element)
            })
        }
        
        // console.log(`indicesOfPlayer: ${indicesOfPlayer}`);
        for (let i = 0; i < victoryConditions.length; i++) {
            // console.log(isSubset);
            if (isSubset(indicesOfPlayer, victoryConditions[i])) {
                // console.log(`Victory! Player: ${player} won!`);
                return true
            }
        }
        
        // console.log(`No Victory`);
        return false
    }
    
    const messageDiv = document.getElementById('results-msg');
    
    const resultsMesssage_Draw = () => {
        messageDiv.innerText = `Round is a Draw.`;
    }
    
    const resultsMesssage_Win = () => {
        messageDiv.innerText = `Player ${player} Won.`;
    }
    
    const resultsMesssage_Reset = () => {
        messageDiv.innerText = ``;
    }
    
    const isEmptyCell = (cell) => {
        if ((gameBoard.getCell(cell) != player1) && (gameBoard.getCell(cell) != player2)) {
            return true;
        } else {
            return false;
        }
    }
    
    const checkGameEnd = () => {
        // Victory must be checked first or a final winning move
        // will be read as a draw instead
        if (checkVictory()) {
            resultsMesssage_Win();
            return true;
        } else if (checkDraw()) {
            resultsMesssage_Draw();
            return true;
        } else {
            return false;
        }
    }
    
    
    return {
        startRound,
        getPlayer,
        resultsMesssage_Reset,
        computerChoice_Random
    }
})();
