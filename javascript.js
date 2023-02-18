// function for gameBoard information
const gameBoard = (() => {
    // create an array with nothing but 0's for 9 indexes
    // Initializing an Array with a Single Value:
    // https://stackoverflow.com/questions/4049847/initializing-an-array-with-a-single-value#28507704
    
    const defaultValue = 'a';
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
        getDefault,
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
    // of "player" to refer to that parameter and NOT the module-scoped "player"
    const playerMove =  (cell, currentPlayer) => {
        if (isEmptyCell(cell)) {
            gameBoard.setCell(cell,currentPlayer);
            if(checkGameEnd()) {
                endRound();
            } else {
                changePlayer();
                computerMove(computerChoice_Random());
                // computerExpertMove(gameBoard.listCells(), player2);
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
        
    const computerExpertMove = () => {
        
        let bestChoice = minimax(gameBoard.listCells(), player2);
        
        console.log(bestChoice);
        
        console.log(`minimax ended`);
        
        gameBoard.setCell(bestChoice, player2);
        
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
    
    const checkVictory = () => {
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
    
    // Method of checking subsets:
    // Javascript: Check if an Array is a Subset of Another Array
    // https://fjolt.com/article/javascript-check-if-array-is-subset
    const isSubset = (parentArray, subsetArray) => {
        return subsetArray.every((element) => {
            return parentArray.includes(element)
        })
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
    
    const emptySpots = (inputBoard) => {
        // console.log(`empty spots code begin`);
        let emptyIndexSpots = [];
        for (let i = 0; i < inputBoard.length; i++) {
            // console.log(i);
            if (inputBoard[i] === gameBoard.getDefault()) {
                // console.log(`stuff pushed`)
                emptyIndexSpots.push(i);
            }
        }
        // console.log(`${emptyIndexSpots} empty spots code end`);
        return emptyIndexSpots;
    }

    const playerVictory = (inputBoard, inputPlayer) => {
        const indicesOfPlayer = [];
        const cells = inputBoard;
        const symbolOfPlayer = inputPlayer;
        
        let currentIndex = cells.indexOf(symbolOfPlayer);
        
        while (currentIndex !== -1) {
            indicesOfPlayer.push(currentIndex);
            currentIndex = cells.indexOf(symbolOfPlayer, currentIndex + 1);
        }
        
        for (let i = 0; i < victoryConditions.length; i++) {
            if (isSubset(indicesOfPlayer, victoryConditions[i])) {
                return true
            }
        }
                
        return false
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
    
    // For the idea on how to "grade" base case utility values (ratings for Win/Loss/Draw)
        // Coding an UNBEATABLE Tic Tac Toe AI (Game Theory Minimax Algorithm EXPLAINED)
        // Kylie Ying
        // https://youtu.be/fT3YWCKvuQE
    
    // For guidance on the minimax algorithm and how to implement it
        // JavaScript Tic Tac Toe Project Tutorial - Unbeatable AI w/ Minimax Algorithm
        // freeCodeCamp.org
        // https://youtu.be/P2TcQ3h0ipQ
    
    // Plan:
    // The function will return an object containing an 'index' value
    // coresponding to an empty spot on the board and a 'score' value associated
    // with that index. This index will be the calculated place for the given player
    // to place their mark if they want to win in the least number of moves.
    
    // Take inputs of a board array and the current player
    // the board array consists of elements that are either:
    //      the default value
    //      player1's symbol
    //      player2's symbol
    // The current player is either player1 or player2 which are
    // objects that return a unique symbol per player ("X" & "O")
    const minimax = (currentBoard, currentPlayer) => {
        // Record array of index's in board that are empty (available for a move)
        let emptySpotsArray = emptySpots(currentBoard);
        console.log(emptySpotsArray);
        let numberOfSpots = emptySpotsArray.length;
        
        // Check win base cases:
        //      player 1 win, return their score (+/-)
        //      player 2 win, return their score (-/+)
        //      tie, return tie score
        //          Have score be calulated based upon the number empty spots remaining,
        //          where if there are more spots unused upon a victory corresponding to
        //          a higher score than if there are less spots unused and a victory.
        //          Formula: (+/-)1 * n, where n is the number of unused spots remaining
        //          and the '1' to differentiate it from the tie's score of 0. The score's
        //          magnitute can increate but it's sign is determined by the player.
        if (playerVictory(currentBoard, currentPlayer)) {
            // console.log(`P1 Victory detected`);
            return {score: 10}
        } else if (playerVictory(currentBoard, currentPlayer)) {
            // console.log(`P2 Victory detected`);
            return {score: -10}
        } else if (numberOfSpots === 0) {
            // console.log(`Draw detected`);
            return {score: 0}
        }
        
        // Create/reset an array that stores "move" objects.
        // Each move object will be filled later with "index" and "score" keys
        // where index is the chosen move's empty square that will be filled and
        // the score is the means that players (the algorithm) can rank which move
        // is more valuable to get to a victory faster.
        
        let availableMoves = [];
        
        // Iterate through the previously created array of empty spots
        //      Create/reset an empty 'move' object that will be modified and then
        //      pushed to the 'moves' array.
        //      Store in the 'move' object the current spot (index).
        //      Change the board's current index to the current player's mark,
        //      this will be reverted later for the next iterative step. This is how
        //      each possible move can be explored, with all of its possible sub-moves.
        for (let i = 0; i < numberOfSpots; i++) {
            // console.log(`loop ${i} started`)
            
            let move = {index: i}
            let previousBoardValue = currentBoard[i];
            currentBoard[i] = currentPlayer;
            
        //      Recursive part of the algorithm:
        //      Check who the current player is:
        //          If player2, then:
        //              Store in a temporary obj variable the results of calling
        //              the minimax function passed with the changed board and player1.
        //              Then assign the temporary obj's 'score' value to the 'move' object's
        //              'score' value.
        //          If player1, then:
        //              Same as above, but call the minimax with player2 instead.
            if (currentPlayer === player2) {
                let miniMaxResult = minimax(currentBoard, player1);
                move.score = miniMaxResult.score;
                // console.log(`Recursion p2`);
            } else if (currentPlayer === player1) {
                let miniMaxResult = minimax(currentBoard, player2);
                move.score = miniMaxResult.score;
                // console.log(`Recursion p1`);                
            } else {
                // console.log(`Error in recursion`);
            }
            
            //      Revert the board back to what it was at the begining (undo the chosen move).
            //      This can be done by changing the current position back to the default value.
            //      Add the now modified 'move' object to the 'moves' array.
            currentBoard[i] = previousBoardValue;
                        
            //  End of looping code
        }
        
        
        //  Create a variable to record the index of the correspondingly best move for the
        //  passed-through player.
        let bestMoveIndex;
        
        //  Check if player2
        //      Create a temporary variable for the current player's score with a large
        //      magnitude corresponding
        //      to the worse score this player can have, for a (+) player that would
        //      be -infinity or a sufficently large (-) number.
        //      Iterate through the moves array and check if each move's score is better
        //      than the current player's score. If so, then update their score to that
        //      value and update the previously created 'best move' variable to the index
        //      corresponding to that score.
        //  if player 1
        //      Same as above but w/ opposite signs; if player2 wants to max, then
        //      player1 wants to min and vice versa.
        if (currentPlayer === player2) {
            let bestScore = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < availableMoves.length; i++) {
                if (availableMoves[i].score > bestScore) {
                    bestScore = availableMoves[i].score;
                    bestMoveIndex = i;
                }
            }
        } else if (currentPlayer === player1) {
            let bestScore = Number.POSITIVE_INFINITY;
            for (let i = 0; i < availableMoves.length; i++) {
                if (availableMoves[i].score < bestScore) {
                    bestScore = availableMoves[i].score;
                    bestMoveIndex = i;
                }
            }
        }
        
        // Finally, the minimax function should return an object containing
        // the index of the best move and that move's score. Exp: {index: 2, score: -10}.
        return availableMoves[bestMoveIndex];
    }
    
        return {
            startRound,
            getPlayer,
            resultsMesssage_Reset,
            computerChoice_Random
        }
    })();
    