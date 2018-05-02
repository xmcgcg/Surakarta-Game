// Board image source: http://teenprograms.pbworks.com/w/page/20404843/GlobalGames
// Piece image source: https://www.wpclipart.com/blanks/buttons/glossy_buttons/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isEqual(other) {
        if (!(other instanceof Coord)) {
            return false;
        } else {
            return this.x === other.x && this.y === other.y;
        }
    }

    toString() {
        return `(${this.x}, ${this.y}) `;
    }
}

/**
 * Properties:
 * @prop {string} colour: the colour of the piece
 */
class Piece extends React.PureComponent {
    render() {
        const colour = this.props.colour;
        return <img alt={colour + "_piece.png"} src={"src/img/" + colour + "_piece.png"} />;
        // {"./img/" + colour + "_piece.png"}
    }
}

/**
 * Properties:
 * @prop {string} colour: the colour of the piece if it exists
 * @prop {bool} isClickable: true if the slot is clickable, false if not
 * @prop {bool} isSelected: true if the piece in the slot is selected
 * @prop {function: () => void} onClick: handles the click on the slot
 */
class Slot extends React.Component {
    render() {
        const props = this.props;
        // const piece = props.colour === "" ? null : <Piece colour={props.colour} />;
        if (props.isClickable) {
            return <div className={(props.isSelected ? "selected " : "") + "clickable slot " + props.colour} onClick={props.onClick}></div>;
            // style={{backgroundImage: "url(./img/" + props.colour + "_piece.png)"}}
        } else {
            return <div className={"slot " + props.colour}></div>;
        }
    }
}

/**
 * Properties:
 * @prop {string} playerColour1: the colour of the pieces of player 1
 * @prop {string} playerColour2: the colour of the pieces of player 2
 */
class Board extends React.Component {
    constructor(props) {
        super(props);
        
        this.gameStates = {PLAYER1_TURN: 1, PLAYER2_TURN: 2, PLAYER1_WIN: 3, PLAYER2_WIN: 4};
        this.directions = {UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1]};
        Object.freeze(this.gameStates);
        Object.freeze(this.directions);

        this.state = {
            player1Pieces: this.getStartingCoords(1).map((coord) => new Coord(coord[0], coord[1])),
            player2Pieces: this.getStartingCoords(2).map((coord) => new Coord(coord[0], coord[1])),
            currentGameState: Math.floor(Math.random() * 2) + 1,
            selectedPiece: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    getStartingCoords(playerNumber) {
        if (playerNumber === 1) {
            return [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]];
        } else {
            return [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]];
        }
    }

    getNewGameState() {
        const state = this.state;
        if (state.player1Pieces.length === 0) {
            return this.gameStates.PLAYER2_WIN;
        } else if (state.player2Pieces.length === 0) {
            return this.gameStates.PLAYER1_WIN;
        } else if (state.currentGameState === this.gameStates.PLAYER1_TURN) {
            return this.gameStates.PLAYER2_TURN;
        } else {
            return this.gameStates.PLAYER1_TURN;
        }
    }

    getMessage() {
        const allStates = this.gameStates;
        const currentState = this.state.currentGameState;
        if (currentState === allStates.PLAYER1_TURN) {
            return "Player 1's turn";
        } else if (currentState === allStates.PLAYER2_TURN) {
            return "Player 2's turn";
        } else if (currentState === allStates.PLAYER1_WIN) {
            return "Player 1 WIN!";
        } else {
            return "Player 2 WIN!";
        }
    }

    isPieceExist(player, coords) {
        const state = this.state;
        const pieces = player === 1 ? state.player1Pieces : state.player2Pieces;
        return pieces.find(piece => piece.isEqual(coords));
    }

    checkNormalMove(start, end) {
        if (!this.isPieceExist(1, start) && !this.isPieceExist(2, start)) {
            return false;
        } else if (this.isPieceExist(1, end) || this.isPieceExist(2, end)) {
            return false;
        }

        const xAbs = Math.abs(start.x - end.x);
        const yAbs = Math.abs(start.y - end.y);
        return (xAbs === 0 || xAbs === 1) && (yAbs === 0 || yAbs === 1);
    }

    checkCircularMove(coords) {
        const size = 6;
        const x = coords.x;
        const y = coords.y;
        if (x === -1) {
            if (y === 0 || y === size - 1) {
                return null;
            } else if (y < size / 2) {
                return [new Coord(y, 0) , "RIGHT"];
            } else {
                return [new Coord(size - 1 - y, size - 1), "LEFT"];
            }
        } else if (x === size) {
            if (y === 0 || y === size - 1) {
                return null;
            } else if (y < size / 2) {
                return [new Coord(size - 1 - y, 0), "RIGHT"];
            } else {
                return [new Coord(y, size - 1), "LEFT"];
            }
        } else if (y === -1) {
            if (x === 0 || x === size - 1) {
                return null;
            } else if (x < size / 2) {
                return [new Coord(0, x), "DOWN"];
            } else {
                return [new Coord(size - 1, size - 1 - x), "UP"];
            }
        } else if (y === size) {
            if (x === 0 || x === size - 1) {
                return null;
            } else if (x < size / 2) {
                return [new Coord(0, size - 1 - x), "DOWN"];
            } else {
                return [new Coord(size - 1, x), "UP"];
            }
        } else {
            return undefined;
        }
    }

    checkCaptureSingleStep(coords, direction) {
        const move = Array.from(this.directions[direction]);
        const newCoords = new Coord(coords.x + move[0], coords.y + move[1]);

        const circularMoveResult = this.checkCircularMove(newCoords);
        if (circularMoveResult === undefined) {
            return [newCoords, direction];
        } else {
            return circularMoveResult;
        }
    }

    checkCaptureMove(start, end) {
        if (!this.isPieceExist(1, start) && !this.isPieceExist(2, start)) {
            return false;
        } else if (this.isPieceExist(1, start) && !this.isPieceExist(2, end)) {
            return false;
        } else if (this.isPieceExist(2, start) && !this.isPieceExist(1, end)) {
            return false;
        }

        for (let prop in this.directions) {
            let moveFailed = false;
            let currentCoords = start;
            let currentDirection = prop;
            let movedInCircularTrack = false;
            while (!currentCoords.isEqual(end)) {
                if (!currentCoords.isEqual(start) && (this.isPieceExist(1, currentCoords) || this.isPieceExist(2, currentCoords))) {
                    moveFailed = true;
                    break;
                }

                const moveResult = this.checkCaptureSingleStep(currentCoords, currentDirection);
                if (moveResult === null) {
                    moveFailed = true;
                    break;
                }

                if (moveResult[1] !== currentDirection) {
                    movedInCircularTrack = true;
                }
                [currentCoords, currentDirection] = moveResult;
            }
            if (!moveFailed && movedInCircularTrack) {
                return true;
            }
        }

        return false;
    }

    checkMove(start, end) {
        return this.checkNormalMove(start, end) || this.checkCaptureMove(start, end);
    }

    executeMove(start, end) {
        const player = this.isPieceExist(1, start) ? 1 : 2;
        /*
        let pieces = player === 1 ? state.player1Pieces : state.player2Pieces;
        pieces.splice(pieces.findIndex(piece => piece.isEqual(start)));
        pieces.push(start);
        */
        
        if (!this.isPieceExist(player, end)) {
            if (player === 1) {
                this.setState(function(prevState, props) {
                    let pieces = prevState.player1Pieces;
                    pieces.splice(pieces.findIndex(piece => piece.isEqual(start)), 1);
                    pieces.push(end);
                    
                    if (this.isPieceExist(2, end)) {
                        let enemyPieces = prevState.player2Pieces;
                        enemyPieces.splice(enemyPieces.findIndex(piece => piece.isEqual(end)), 1);
                        return {player1Pieces: pieces, player2Pieces: enemyPieces};
                    } else {
                        return {player1Pieces: pieces};
                    }
                });
            } else {
                this.setState(function(prevState, props) {
                    let pieces = prevState.player2Pieces;
                    pieces.splice(pieces.findIndex(piece => piece.isEqual(start)), 1);
                    pieces.push(end);

                    if (this.isPieceExist(1, end)) {
                        let enemyPieces = prevState.player1Pieces;
                        enemyPieces.splice(enemyPieces.findIndex(piece => piece.isEqual(end)), 1);
                        return {player2Pieces: pieces, player1Pieces: enemyPieces};
                    } else {
                        return {player2Pieces: pieces};
                    }
                });
            }
        }
    }

    handleClick(coords) {
        const state = this.state;
        const piece = state.selectedPiece;
        if (piece === null) {
            this.setState({selectedPiece: new Coord(coords.x, coords.y)});
        } else if (piece.isEqual(coords)) {
            this.setState({selectedPiece: null});
        } else {
            const isValid = this.checkMove(piece, coords);
            if (isValid) {
                this.executeMove(piece, coords);
                this.setState(function(prevState, props) {
                    return {
                        selectedPiece: null,
                        currentGameState: this.getNewGameState()
                    };
                });
            } else {
                alert("Invalid Move!");
            }
        }
    }

    handleReset() {
        this.setState({
            player1Pieces: this.getStartingCoords(1).map((coord) => new Coord(coord[0], coord[1])),
            player2Pieces: this.getStartingCoords(2).map((coord) => new Coord(coord[0], coord[1])),
            currentGameState: Math.floor(Math.random() * 2) + 1,
            selectedPiece: null
        });
    }

    isClickable(coords) {
        const state = this.state;
        const status = state.currentGameState;
        const allStates = this.gameStates;
        
        if (status === allStates.PLAYER1_WIN || status === allStates.PLAYER2_WIN) {
            return false;
        }
        else if (state.selectedPiece === null) {
            const player = status === allStates.PLAYER1_TURN ? 1 : 2;
            return this.isPieceExist(player, coords);
        } else {
            return true;
        }
    }

    renderSlot(coords) {
        const props = this.props;
        const state = this.state;
        const colour = this.isPieceExist(1, coords) ? props.playerColour1 : (this.isPieceExist(2, coords) ? props.playerColour2 : "");
        const isSelected = state.selectedPiece === null ? false : state.selectedPiece.isEqual(coords);
        if (this.isClickable(coords)) {
            return <Slot colour={colour} isClickable={true} isSelected={isSelected} onClick={() => this.handleClick(coords)} />;
        } else {
            return <Slot colour={colour} isClickable={false} />;
        }
    }

    renderBoard() {
        let slots = []
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                slots.push(this.renderSlot(new Coord(i, j)));
            }
        }

        return <div className="board">{slots}</div>;
    }

    render() {
        return (
        <div className="outer">
            <div className="reset">
                <button onClick={this.handleReset}>Reset</button>
            </div>
            <div className="message">{this.getMessage()}</div>
            {this.renderBoard()}
        </div>
    );
    }
}

ReactDOM.render(<Board playerColour1="aqua" playerColour2="purple" />, document.getElementById('root'));
registerServiceWorker();
