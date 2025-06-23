class Player {
    constructor(board, isAI = false, repeatOnHit = false) {
        this.myBoard = board;
        this.isAI = isAI;
        this.repeatOnHit = repeatOnHit;

        this.hitStack = [];
    }

    attack(enemyBoard, [x, y]) {
        const result = enemyBoard.receiveAttack([x, y]);
        if (!result) return null;

        if (result.isHit) this.hitStack.push([x, y]);
        if (result.sunk) this.hitStack = [];

        return { coords: [x, y], result };
    }

    decideAttack(enemyBoard) {
        if (!this.isAI) return null;

        const coords = this._getNextTarget(enemyBoard);
        return this.attack(enemyBoard, coords);
    }

    _getNextTarget(enemyBoard) {
        if (this.hitStack.length > 0) {
            const candidates = this._getAdjacentTargets(this.hitStack);
            for (const [x, y] of candidates) {
                const key = `${x},${y}`;
                const cell = enemyBoard.board[x]?.[y];
                const alreadyTried = cell?.isHit || enemyBoard.missedHits.has(key);
                if (!alreadyTried) return [x, y];
            }
        }

        let x, y, key;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            key = `${x},${y}`;
        } while (
            enemyBoard.board[x][y]?.isHit ||
            enemyBoard.missedHits.has(key)
        );

        return [x, y];
    }

    _getAdjacentTargets(hits) {
        const coords = [];

        if (hits.length >= 2) {
            const [x1, y1] = hits[0];
            const [x2, y2] = hits[1];

            const isHorizontal = y1 === y2;
            const isVertical = x1 === x2;

            const sorted = hits.slice().sort(([a, b], [c, d]) =>
                isHorizontal ? a - c : b - d
            );

            const [start, end] = sorted;

            if (isHorizontal) {
                coords.push([start[0] - 1, start[1]]);
                coords.push([end[0] + 1, end[1]]);
            } else if (isVertical) {
                coords.push([start[0], start[1] - 1]);
                coords.push([end[0], end[1] + 1]);
            }
        } else {
            const [x, y] = hits[0];
            coords.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
        }

        return coords.filter(([x, y]) => x >= 0 && x < 10 && y >= 0 && y < 10);
    }
}

export default Player;