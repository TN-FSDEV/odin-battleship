import Player from "./player.js";
import Gameboard from "./gameboard.js";
import UIRenderer from "./UIRenderer.js";
import UIEventBinder from "./UIEventBinder.js";

class DOMController {
    constructor() {
        this.player = new Player(new Gameboard(), false, true);
        this.computer = new Player(new Gameboard(), true, true);
        this.turn = { value: "player" };

        this.playerBoardDiv = document.getElementById("player-board");
        this.computerBoardDiv = document.getElementById("computer-board");
        this.shipContainer = document.getElementById("ship-container");
        this.messageDiv = document.getElementById("message");
        this.playBtn = document.getElementById("play");
        this.restartBtn = document.getElementById("restart");
        this.autoPlaceBtn = document.getElementById("auto-place");

        this.renderer = new UIRenderer(
            this.playerBoardDiv,
            this.computerBoardDiv,
            this.shipContainer,
            this.messageDiv
        );

        this.eventBinder = new UIEventBinder({
            player: this.player,
            computer: this.computer,
            renderer: this.renderer,
            onShipDrop: this._handleShipDrop.bind(this),
            onComputerTurn: this._computerTurn.bind(this)
        });
    }

    setup() {
        this.computer.myBoard.autoPlaceShips();

        this.eventBinder.bindPlayButton(this.playBtn, () => {
            this.player.myBoard.active = true;
            this.computer.myBoard.active = true;
            this._renderComputerBoard();
            this.renderer.showMessage("Game started! Your turn.");
            this.playBtn.style.display = "none";
            this.restartBtn.style.display = "inline";
        });

        this.eventBinder.bindRestartButton(this.restartBtn);

        this.eventBinder.bindAutoPlaceButton(
            this.autoPlaceBtn,
            this._renderPlayerBoard.bind(this),
            this._renderShips.bind(this),
            this._updatePlayerShipVisuals.bind(this)
        );

        this._renderPlayerBoard();
        this._renderShips();
        this.renderer.showMessage("Drag your ships to place them");
    }

    _renderPlayerBoard() {
        this.renderer.renderBoard(
            this.playerBoardDiv,
            "player",
            this.player.myBoard.size,
            (cell, x, y) => this.eventBinder.bindPlayerCell(cell, x, y)
        );
    }

    _renderComputerBoard() {
        this.renderer.renderBoard(
            this.computerBoardDiv,
            "computer",
            this.computer.myBoard.size,
            (cell, x, y) => this.eventBinder.bindComputerCell(cell, x, y, this.turn)
        );
    }

    _renderShips(grayOut = false) {
        const placedShips = this.player.myBoard.placedShips;
        const fleet = this.player.myBoard.fleet;

        this.renderer.renderShips(fleet, placedShips, ship =>
            this.eventBinder.bindShip(ship),
            grayOut
        );
    }

    _handleShipDrop(x, y, dragData) {
        const { shipID, vertical } = dragData;
        const placed = this.player.myBoard.placeShip([x, y], vertical, shipID);
        if (!placed) {
            this.renderer.showMessage("Invalid ship placement.");
            return;
        }

        const shipDiv = this.shipContainer.querySelector(`[data-shipid='${shipID}']`);
        if (shipDiv) {
            shipDiv.style.opacity = "0.5";
            shipDiv.dataset.placed = "true";
        }

        this._updatePlayerShipVisuals();
    }

    _updatePlayerShipVisuals() {
        this.renderer.updatePlayerShipVisuals(this.player.myBoard.placedShips);
    }

    _computerTurn(turnState = this.turn) {
        const loop = () => {
            const outcome = this.computer.decideAttack(this.player.myBoard);
            if (!outcome) return;

            const { coords: [x, y], result } = outcome;
            const cell = this.renderer.getPlayerCell(x, y);
            this.renderer.applyHitOrMiss(cell, result.isHit);

            if (this.player.myBoard.allShipsSunk()) {
                this.renderer.showMessage("Computer wins!");
                this.renderer.showWinBanner("COMPUTER WINS!");
                return;
            }

            if (this.computer.repeatOnHit && result.isHit) {
                setTimeout(loop, 400);
            } else {
                this.turn.value = "player";
                this.renderer.showMessage("Your turn.");
            }
        };

        loop();
    }
}

export default DOMController;
