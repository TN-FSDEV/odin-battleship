import Player from "../src/player.js";

describe('Player Class', () => {
    let mockBoard;

    beforeEach(() => {
        mockBoard = {
            receiveAttack: jest.fn(),
            board: Array.from({ length: 10 }, () =>
                Array.from({ length: 10 }, () => ({}))
            ),
            missedHits: new Set(),
        };
    });

    describe('constructor', () => {
        it('initializes with default values', () => {
            const player = new Player(mockBoard);
            expect(player.myBoard).toBe(mockBoard);
            expect(player.isAI).toBe(false);
            expect(player.repeatOnHit).toBe(false);
            expect(player.hitStack).toEqual([]);
        });

        it('initializes AI and repeatOnHit correctly', () => {
            const player = new Player(mockBoard, true, true);
            expect(player.isAI).toBe(true);
            expect(player.repeatOnHit).toBe(true);
        });
    });

    describe('attack()', () => {
        it('returns null if receiveAttack returns null', () => {
            mockBoard.receiveAttack.mockReturnValue(null);
            const player = new Player(mockBoard);
            const result = player.attack(mockBoard, [3, 4]);
            expect(result).toBeNull();
        });

        it('pushes to hitStack on hit', () => {
            mockBoard.receiveAttack.mockReturnValue({ isHit: true });
            const player = new Player(mockBoard);
            const result = player.attack(mockBoard, [2, 2]);

            expect(result).toEqual({ coords: [2, 2], result: { isHit: true } });
            expect(player.hitStack).toContainEqual([2, 2]);
        });

        it('clears hitStack if ship is sunk', () => {
            mockBoard.receiveAttack.mockReturnValue({ isHit: true, sunk: true });
            const player = new Player(mockBoard);
            player.hitStack = [[1, 1], [2, 2]];

            const result = player.attack(mockBoard, [3, 3]);

            expect(result.coords).toEqual([3, 3]);
            expect(player.hitStack).toEqual([]);
        });

        it('does not modify hitStack on miss', () => {
            mockBoard.receiveAttack.mockReturnValue({ isHit: false });
            const player = new Player(mockBoard);
            player.hitStack = [[1, 1]];

            player.attack(mockBoard, [5, 5]);

            expect(player.hitStack).toEqual([[1, 1]]);
        });
    });

    describe('decideAttack()', () => {
        it('returns null if not an AI player', () => {
            const player = new Player(mockBoard, false);
            const result = player.decideAttack(mockBoard);
            expect(result).toBeNull();
        });

        it('attacks using _getNextTarget() if AI', () => {
            const player = new Player(mockBoard, true);

            mockBoard.receiveAttack.mockReturnValue({ isHit: false });

            const result = player.decideAttack(mockBoard);

            expect(result).toHaveProperty('coords');
            expect(result).toHaveProperty('result');
        });

        it('prefers adjacent targets if hitStack is not empty', () => {
            const player = new Player(mockBoard, true);

            player.hitStack = [[5, 5]];

            mockBoard.receiveAttack.mockImplementation(([x, y]) => ({
                isHit: true,
                coords: [x, y],
            }));

            const result = player.decideAttack(mockBoard);

            const [x, y] = result.coords;
            expect([[4, 5], [6, 5], [5, 4], [5, 6]]).toContainEqual([x, y]);
        });
    });
});

