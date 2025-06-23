class UIRenderer {
    constructor(playerBoardDiv, computerBoardDiv, shipContainer, messageDiv) {
        this.playerBoardDiv = playerBoardDiv;
        this.computerBoardDiv = computerBoardDiv;
        this.shipContainer = shipContainer;
        this.messageDiv = messageDiv;
        this.winBanner = this._createWinBanner();
    }

    renderBoard(boardEl, owner, boardSize, attachFn) {
        boardEl.innerHTML = "";
        boardEl.className = `board ${owner}`;
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.x = x;
                cell.dataset.y = y;
                attachFn(cell, x, y);
                boardEl.appendChild(cell);
            }
        }
    }

    renderShips(fleet, placedShips, addListeners, grayOut = false) {
        this.shipContainer.innerHTML = "";
        fleet.forEach((length, shipID) => {
            const placed = placedShips[shipID];
            const isVertical = placed?.isVertical ?? true;
            const isPlaced = !!placed;
            const shipEl = this._createShipElement(length, shipID, isVertical, isPlaced || grayOut);
            addListeners(shipEl);
            this.shipContainer.appendChild(shipEl);
        });
    }

    _createShipElement(length, shipID, isVertical, grayOut) {
        const ship = document.createElement("div");
        ship.classList.add("draggable-ship", isVertical ? "vertical" : "horizontal");
        if (grayOut) ship.style.opacity = "0.5";

        ship.draggable = true;
        ship.dataset.length = length;
        ship.dataset.shipid = shipID;
        ship.dataset.vertical = isVertical.toString();
        ship.dataset.placed = grayOut.toString();

        for (let i = 0; i < length; i++) {
            const part = document.createElement("div");
            part.classList.add("ship-part");
            ship.appendChild(part);
        }

        return ship;
    }

    updatePlayerShipVisuals(placedShips) {
        this.playerBoardDiv.querySelectorAll(".cell").forEach(cell => cell.classList.remove("ship"));
        Object.values(placedShips).forEach(({ coords }) => {
            coords.forEach(([x, y]) => {
                const cell = this._getCell(this.playerBoardDiv, x, y);
                if (cell) cell.classList.add("ship");
            });
        });
    }

    updateComputerMisses(missedHits) {
        missedHits.forEach(key => {
            const [x, y] = key.split(",").map(Number);
            const cell = this._getCell(this.computerBoardDiv, x, y);
            if (cell && !cell.classList.contains("hit") && !cell.classList.contains("miss")) {
                cell.classList.add("miss");
            }
        });
    }

    clearHoverPreview() {
        this.playerBoardDiv.querySelectorAll(".hover-preview").forEach(cell =>
            cell.classList.remove("hover-preview")
        );
    }

    applyHitOrMiss(cell, isHit) {
        cell.classList.add(isHit ? "hit" : "miss");
    }

    getPlayerCell(x, y) {
        return this._getCell(this.playerBoardDiv, x, y);
    }

    _getCell(boardEl, x, y) {
        return boardEl.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
    }

    _createWinBanner() {
        const banner = document.createElement("div");
        banner.id = "win-banner";
        document.body.appendChild(banner);
        return banner;
    }

    showWinBanner(text) {
        this.winBanner.textContent = text;
        this.winBanner.style.display = "block";
    }

    showMessage(msg) {
        this.messageDiv.textContent = msg;
    }
}

export default UIRenderer;
