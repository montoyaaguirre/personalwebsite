/* jslint browser:true */
define('viewing/board-widget',[], function() {
    'use strict';
    let clickCallback;

    function setPieceOrder(orderedPieces) {
        for (let i = 0; i < orderedPieces.length; i++) {
            const id = 'piece' + orderedPieces[i];
            const piece = document.getElementById(id);
            piece.setAttribute('data-order', i.toString());
        }
    }

    function render(containerId, imageUrl, numberOfPiecesPerSide) {
        const numberOfPieces = numberOfPiecesPerSide * numberOfPiecesPerSide;
        const boardDiv = document.getElementById(containerId);
        boardDiv.className = 'side' + numberOfPiecesPerSide;
        for (let i = 0; i < numberOfPieces; i++) {
            const columnIndex = i % numberOfPiecesPerSide;
            const rowIndex = Math.floor(i / numberOfPiecesPerSide);
            const piece = document.createElement('div');
            const image = document.createElement('img');
            piece.setAttribute(
                'id',
                'piece' + i
            );
            piece.setAttribute(
                'data-order',
                'i'
            );
            piece.setAttribute(
                'class',
                'piece col' + columnIndex + ' row' + rowIndex
            );
            image.setAttribute('src', imageUrl);
            image.setAttribute('data-piece', i);
            image.setAttribute('onmousedown', 'return false;');
            if (i !== numberOfPieces -1) {
                piece.appendChild(image);
            }
            if (clickCallback) {
                piece.addEventListener('click', function(event) {
                    clickCallback(event.target.getAttribute('data-piece'));
                }, false);
            }
            boardDiv.appendChild(piece);
        }
    }

    function clear(containerId) {
        const boardDiv = document.getElementById(containerId);
        while (boardDiv.firstChild) {
            boardDiv.removeChild(boardDiv.firstChild);
        }
    }

    function setClickCallback(callback) {
        if (callback) {
            clickCallback = callback;
        }
    }

    return {
        clear: clear,
        render: render,
        setPieceOrder: setPieceOrder,
        setClickCallback: setClickCallback,
    };
});

define('utils',[], function() {
    'use strict';

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    function swapElements(array, pieceA, pieceB) {
        const indexA = array.indexOf(pieceA);
        const indexB = array.indexOf(pieceB);
        array[indexA] = pieceB;
        array[indexB] = pieceA;
    }

    return {
        shuffleArray: shuffleArray,
        swapElements: swapElements,
    };
});

define('data-models/puzzle',['../utils'], function(utils) {
    'use strict';

    function Puzzle(numberOfPieces, shuffle) {
        const pieces = [];
        let emptyPieceIndex;
        _init(numberOfPieces, shuffle);

        function _init(numberOfPieces, shuffle) {
            shuffle = (shuffle === undefined) ? true : shuffle;
            if (
                numberOfPieces !== 9 &&
                numberOfPieces !== 16 &&
                numberOfPieces !== 25
            ) {
                console.log('The puzzle must contain 9, 16 or 25 pieces.');
                numberOfPieces = 16;
            }
            emptyPieceIndex = numberOfPieces -1;
            for (let i = 0; i < numberOfPieces; i++) {
                pieces.push(i);
            }
            if (shuffle) {
                utils.shuffleArray(pieces);
            }
        }

        function getPieces() {
            return pieces;
        }

        function move(pieceIndex) {
            if (!pieceIndex && pieceIndex !== 0) {
                return;
            }
            if (checkIfMovable(pieceIndex)) {
                utils.swapElements(pieces, pieceIndex, emptyPieceIndex);
            }
        }

        function checkIfMovable(pieceIndex) {
            const neighbors = _getNeighbors(pieceIndex);
            if (neighbors.indexOf(emptyPieceIndex) !== -1) {
                return true;
            }
            return false;
        }

        function _getNeighbors(pieceIndex) {
            const neighbors = [];
            pieceIndex = pieces.indexOf(pieceIndex);
            const side = Math.sqrt(numberOfPieces);
            // Up
            if (pieceIndex >= side) {
                neighbors.push(pieces[pieceIndex - side]);
            }
            // Right
            if ((pieceIndex + 1) % (side) !== 0) {
                neighbors.push(pieces[pieceIndex + 1]);
            }
            // Down
            if (pieceIndex < side * (side - 1)) {
                neighbors.push(pieces[pieceIndex + side]);
            }
            // Left
            if (pieceIndex % (side) !== 0) {
                neighbors.push(pieces[pieceIndex - 1]);
            }
            return neighbors;
        }

        function isInWinState() {
            for (let i = 0; i < pieces.length; i++) {
                if (i !== pieces[i]) {
                    return false;
                }
            }
            return true;
        }

        return {
            getPieces: getPieces,
            _getNeighbors: _getNeighbors,
            checkIfMovable: checkIfMovable,
            move: move,
            isInWinState: isInWinState,
        };
    }

    return Puzzle;
});

/* jslint browser:true */
define('index',[
    './viewing/board-widget',
    './data-models/puzzle',
], function(
    board,
    Puzzle
) {
    'use strict';

    let remainingTime = 5;
    let elapsedTime = 0;
    let piecesPerSide = 4;
    let puzzle;
    let imgUrl = 'https://montoyalabs.com/images/monks.jpg';
    const img404 = 'https://cdn.browshot.com/static/images/not-found.png';

    const options = {
        piecesPerSide: null,
        url: null,
    };

    let clockInterval = initGame();
    initOptionsMenu();
    let gameRunning = false;

    function handlePieceClick(pieceNumber) {
        if (!gameRunning) {
            return;
        }
        puzzle.move(parseInt(pieceNumber));
        board.setPieceOrder(puzzle.getPieces());
        if (puzzle.isInWinState()) {
            clearInterval(clockInterval);
        }
    }

    function initGame() {
        setHeader('Puzzle starting in ' + (remainingTime + 1));
        board.setClickCallback(handlePieceClick);
        board.render(
            'board',
            imgUrl,
            piecesPerSide
        );
        puzzle = new Puzzle(piecesPerSide * piecesPerSide, false);
        board.setPieceOrder(puzzle.getPieces());
        return setInterval(updateTiming, 1000);
    }

    function initOptionsMenu() {
        document.getElementById('options-icon').addEventListener(
            'click',
            () => {
                displayOptions();
            }
        );
        const imageUrlPreview = document.getElementById('image-preview');
        imageUrlPreview.setAttribute('src', imgUrl);
        const imageUrlInput = document.getElementById('image-url');
        imageUrlInput.setAttribute('value', '');
        imageUrlInput.addEventListener('input', (event) => {
            checkImageURL(event.target.value, setPreviewURL);
        });
        document.getElementById('button3x3').addEventListener('click', () => {
            setOptionPieces(3);
        });
        document.getElementById('button4x4').addEventListener('click', () => {
            setOptionPieces(4);
        });
        document.getElementById('button5x5').addEventListener('click', () => {
            setOptionPieces(5);
        });
        document.getElementById('ok-button').addEventListener('click', () => {
            submitOptions(true);
        });
        document.getElementById('cancel-button').addEventListener(
            'click',
            () => {
                submitOptions(false);
            }
        );
    }

    function displayOptions() {
        const imageUrlPreview = document.getElementById('image-preview');
        imageUrlPreview.setAttribute('src', imgUrl);
        const imageUrlInput = document.getElementById('image-url');
        imageUrlInput.setAttribute('value', '');
        // Hide Header
        document.getElementById('header').style.display = 'none';
        // Hide Puzzle
        document.getElementById('board').style.display = 'none';
        // Show options
        document.getElementById('options').style.display = 'flex';
    }

    function submitOptions(save) {
        if (save) {
            if (options.piecesPerSide) {
                setPiecesPerSide(options.piecesPerSide);
            }
            if (options.url) {
                setPuzzleImage(options.url);
            }
            board.clear('board');
            clockInterval = initGame();
        }
        // Hide options
        document.getElementById('options').style.display = 'none';
        // Hide Header
        document.getElementById('header').style.display = 'flex';
        // Hide Puzzle
        document.getElementById('board').style.display = 'grid';
    }

    function setPreviewURL(url) {
        const preview = document.getElementById('image-preview');
        preview.setAttribute('src', url);
    }

    function setPiecesPerSide(numberOfPieces) {
        piecesPerSide = numberOfPieces;
    }

    function setOptionPieces(numberOfPieces) {
        options.piecesPerSide = numberOfPieces;
    }

    function setOptionURL(url) {
        options.url = url;
    }

    function setPuzzleImage(url) {
        imgUrl = url;
    }

    function checkImageURL(url, callback, timeout) {
        timeout = timeout || 3000;
        const timedOut = false;
        const img = new Image();
        img.onerror = img.onabort = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(img404);
            }
        };
        img.onload = function() {
            if (!timedOut) {
                clearTimeout(timer);
                setOptionURL(url);
                callback(url);
            }
        };
        const timer = setTimeout(function() {
            console.log('image request timed out');
        }, timeout);
        img.src = url;
    }

    function updateTiming() {
        if (remainingTime > 0) {
            setHeader('Puzzle starting in ' + remainingTime);
            remainingTime--;
        } else {
            const time =
                new Date(elapsedTime * 1000).toISOString().substr(11, 8);
            setHeader('Timer: ' + time);
            if (elapsedTime === 0) {
                gameRunning = true;
                puzzle = new Puzzle(piecesPerSide * piecesPerSide);
                board.setPieceOrder(puzzle.getPieces());
            }
            elapsedTime++;
        }
    }

    function setHeader(header) {
        const puzzleHeader = document.getElementById('app');
        puzzleHeader.innerHTML = '<h1>'+ header + '</h1>';
    }
});

