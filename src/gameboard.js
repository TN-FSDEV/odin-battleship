import Ship from "./ship.js";

class Gameboard {
    constructor() {
        this.size = 10;
        this.board = Array.from({ length: this.size }, () => Array(this.size).fill(null));
        this.fleet = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // Ship lengths
        this.placedShips = {}; // shipID -> { coords, ship, isVertical }
        this.missedHits = new Set();
        this.active = false;
    }

    allShipsPlaced() {
        return Object.keys(this.placedShips).length === this.fleet.length;
    }

    allShipsSunk() {
        return Object.values(this.placedShips).every(({ ship }) => ship.isSunk());
    }

    placeShip([x, y], isVertical = true, shipID) {
        if (this.active) return false;
        if (this.placedShips[shipID]) return false;

        const length = this.fleet[shipID];
        if (length == null) return false;

        if (!this._canPlaceShip([x, y], length, isVertical)) return false;

        const ship = new Ship(length);
        const coords = [];

        for (let i = 0; i < length; i++) {
            const xi = isVertical ? x : x + i;
            const yi = isVertical ? y + i : y;
            this.board[xi][yi] = { ship, shipID, isHit: false };
            coords.push([xi, yi]);
        }

        this.placedShips[shipID] = { coords, ship, isVertical };

        return true;
    }

    receiveAttack([x, y]) {
        const key = `${x},${y}`;
        const cell = this.board[x][y];

        if (cell?.isHit || this.missedHits.has(key)) return { isHit: false, sunk: false };

        if (cell?.ship) {
            cell.isHit = true;
            cell.ship.hit();

            const sunk = cell.ship.isSunk();
            const result = { isHit: true, sunk, shipID: cell.shipID };

            if (sunk) {
                const coords = this.placedShips[cell.shipID].coords;
                this._revealAdjacentToSunkShip(coords);
            }

            return result;
        } else {
            this.missedHits.add(key);
            return { isHit: false, sunk: false };
        }
    }

    rotateShip(shipID) {
        if (this.active) return false;

        const selectedShip = this.placedShips[shipID];
        if (!selectedShip) return false;

        const { coords, isVertical } = selectedShip;
        const head = coords[0];
        const length = this.fleet[shipID];
        const newIsVertical = !isVertical;

        this.removeShip(shipID);

        if (!this._canPlaceShip(head, length, newIsVertical)) {
            this.placeShip(head, isVertical, shipID);
            return false;
        }

        return this.placeShip(head, newIsVertical, shipID);
    }

    removeShip(shipID) {
        if (this.active) return false;

        const selectedShip = this.placedShips[shipID];
        if (!selectedShip) return;

        const { coords } = selectedShip;
        coords.forEach(([x, y]) => {
            this.board[x][y] = null;
        });

        delete this.placedShips[shipID];
    }

    autoPlaceShips() {
        this.fleet.forEach((_, shipID) => {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * this.size);
                const y = Math.floor(Math.random() * this.size);
                const setVertical = Math.random() < 0.5;
                placed = this.placeShip([x, y], setVertical, shipID);
            }
        });
    }

    _canPlaceShip([x, y], length, isVertical) {
        for (let i = 0; i < length; i++) {
            const xi = isVertical ? x : x + i;
            const yi = isVertical ? y + i : y;

            if (!this._isValidCoord(xi, yi)) return false;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const nx = xi + dx;
                    const ny = yi + dy;
                    if (this._isValidCoord(nx, ny) && this.board[nx][ny] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    _revealAdjacentToSunkShip(coords) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 0], [0, 1],
            [1, -1], [1, 0], [1, 1],
        ];

        for (const [x, y] of coords) {
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                const key = `${nx},${ny}`;

                if (
                    this._isValidCoord(nx, ny) &&
                    !this.board[nx][ny] &&
                    !this.missedHits.has(key)
                ) {
                    this.missedHits.add(key);
                }
            }
        }
    }

    _isValidCoord(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
}

export default Gameboard;