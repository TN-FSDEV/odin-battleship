class UIEventBinder {
    constructor({ player, computer, renderer, onShipDrop, onComputerTurn }) {
        this.player = player;
        this.computer = computer;
        this.renderer = renderer;

        this.onShipDrop = onShipDrop;
        this.onComputerTurn = onComputerTurn;

        this.currentDragData = null;
    }

    bindPlayButton(playBtn, onStart) {
        playBtn.addEventListener("click", () => {
            if (this.player.myBoard.allShipsPlaced()) {
                onStart();
            } else {
                this.renderer.showMessage("Finish placing all your ships first.");
            }
        });
    }

    bindRestartButton(restartBtn) {
        restartBtn.addEventListener("click", () => {
            location.reload();
        });
    }

    bindAutoPlaceButton(autoBtn, renderPlayerBoard, renderShips, updateShipVisuals) {
        autoBtn.addEventListener("click", () => {
            if (this.player.myBoard.active) return;
            this.player.myBoard = new this.player.myBoard.constructor(); // create new board
            this.player.myBoard.autoPlaceShips();
            renderPlayerBoard();
            renderShips(true);
            updateShipVisuals();
            this.renderer.showMessage("Ships placed randomly.");
        });
    }

    bindPlayerCell(cell, x, y) {
        cell.addEventListener("dragover", e => {
            e.preventDefault();
            if (!this.currentDragData || this.player.myBoard.active) return;

            const { shipID, vertical } = this.currentDragData;
            const length = this.player.myBoard.fleet[shipID];

            this.renderer.clearHoverPreview();
            for (let i = 0; i < length; i++) {
                const xi = vertical ? x : x + i;
                const yi = vertical ? y + i : y;
                const preview = this.renderer.getPlayerCell(xi, yi);
                if (preview) preview.classList.add("hover-preview");
            }
        });

        cell.addEventListener("drop", e => {
            e.preventDefault();
            this.renderer.clearHoverPreview();
            if (!this.player.myBoard.active) this.onShipDrop(x, y, this.currentDragData);
        });

        cell.addEventListener("click", () => {
            if (this.player.myBoard.active) return;
            const data = this.player.myBoard.board[x][y];
            if (data?.ship) {
                const { shipID } = data;
                this.player.myBoard.removeShip(shipID);
                const shipDiv = document.querySelector(`[data-shipid='${shipID}']`);
                if (shipDiv) {
                    shipDiv.style.opacity = "1";
                    shipDiv.dataset.placed = "false";
                }
                this.renderer.updatePlayerShipVisuals(this.player.myBoard.placedShips);
                this.renderer.showMessage("Ship removed. Drag to reposition.");
            }
        });

        cell.addEventListener("contextmenu", e => {
            e.preventDefault();
            if (this.player.myBoard.active) return;
            const data = this.player.myBoard.board[x][y];
            if (data?.ship) {
                const { shipID } = data;
                const success = this.player.myBoard.rotateShip(shipID);
                if (success) {
                    this.renderer.updatePlayerShipVisuals(this.player.myBoard.placedShips);
                    this.renderer.showMessage("Ship rotated.");
                } else {
                    this.renderer.showMessage("Cannot rotate here.");
                }
            }
        });
    }

    bindComputerCell(cell, x, y, turnState) {
        cell.addEventListener("click", e => {
            e.preventDefault();
            if (!this._isPlayerTurnValid(cell, turnState)) return;

            const outcome = this.player.attack(this.computer.myBoard, [x, y]);
            if (!outcome) return;

            const { result } = outcome;
            this.renderer.applyHitOrMiss(cell, result.isHit);
            if (result.sunk) this.renderer.updateComputerMisses(this.computer.myBoard.missedHits);

            if (this.computer.myBoard.allShipsSunk()) {
                this.renderer.showMessage("You win!");
                this.renderer.showWinBanner("PLAYER WINS!");
                return;
            }

            if (this.player.repeatOnHit && result.isHit) {
                this.renderer.showMessage(result.sunk ? "You sank a ship! Go again!" : "Hit! Go again.");
            } else {
                turnState.value = "computer";
                setTimeout(() => this.onComputerTurn(turnState), 500);
            }
        });
    }

    bindShip(ship) {
        const shipID = Number(ship.dataset.shipid);

        ship.addEventListener("contextmenu", e => {
            e.preventDefault();
            if (this.player.myBoard.active) return;
            if (ship.dataset.placed === "false") {
                const isVert = ship.dataset.vertical === "true";
                ship.dataset.vertical = (!isVert).toString();
                ship.classList.toggle("vertical", !isVert);
                ship.classList.toggle("horizontal", isVert);
            }
        });

        ship.addEventListener("dragstart", e => {
            if (this.player.myBoard.active) return;
            this.currentDragData = {
                shipID,
                vertical: ship.dataset.vertical === "true"
            };
            e.dataTransfer.setData("text/plain", JSON.stringify(this.currentDragData));
        });
    }

    _isPlayerTurnValid(cell, turnState) {
        if (!this.player.myBoard.active || turnState.value !== "player") return false;
        if (cell.classList.contains("hit") || cell.classList.contains("miss")) {
            this.renderer.showMessage("You've already fired here!");
            return false;
        }
        return true;
    }
}

export default UIEventBinder;
