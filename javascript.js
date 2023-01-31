// function for gameBoard information
const gameBoard = (() => {
    // create an array with nothing but 0's for 9 indexes
    // Initializing an Array with a Single Value:
    // https://stackoverflow.com/questions/4049847/initializing-an-array-with-a-single-value#28507704
    const cellsArray = Array(9).fill(0);
    
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
        cellsArray.fill(0);
        displayController.updateCells();
    }
    
    return {
        setCell,
        getCell,
        listCells,
        resetCells
    }
})();

// function for updating the display
const displayController = (() => {
    // how to grab all cells at once
    // https://www.w3schools.com/js/js_htmldom_nodelist.asp
    const cells = document.getElementsByClassName('cell');
    
    const updateCells = () => {
        for (let i = 0 ; i < cells.length; i++) {
            cells[i].innerText = gameBoard.getCell(i);
        }        
    };
    
    updateCells();
    
    const resetButton = document.getElementById("reset-btn");
    
    const resetBoard = () => {
        console.log('Before: ' + gameBoard.listCells());
        gameBoard.resetCells();
        updateCells();
        console.log('After: ' + gameBoard.listCells());
    }
    
    resetButton.addEventListener('click', resetBoard);
    

    
    return {
        updateCells,
        cells,
    }
})();

const gameController = (() => {
    
    const playerFactory = (symbol) => {
        return symbol
    }
    
    const player1 = playerFactory('X');
    const player2 = playerFactory('K');
    
    const cells = displayController.cells;
    
    let player = player1;
    
    const playerTurn = (event) => {
        event.preventDefault();
        gameBoard.setCell(i, player);
        displayController.updateCells();
    }
    
    for (let i = 0; i <= cells.length-1; i++) {
        cells[i].addEventListener('click', playerTurn);
    }
    
})();

