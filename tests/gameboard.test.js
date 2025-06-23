import Gameboard from '../src/gameboard.js';
import Ship from "../src/ship.js";

jest.mock('../src/ship.js', () => {
    return jest.fn().mockImplementation((length) => {
        let hits = 0;
        return {
            length,
            hit: jest.fn(() => hits++),
            isSunk: jest.fn(() => hits >= length),
        };
    });
});

beforeEach(() => {
    Ship.mockClear();
});

describe('Gameboard Class', () => {
    let board;

    beforeEach(() => {
        board = new Gameboard();
    });

    test('initializes with correct defaults', () => {
        expect(board.board.length).toBe(10);
        expect(board.fleet.length).toBe(10);
        expect(Object.keys(board.placedShips)).toHaveLength(0);
        expect(board.missedHits.size).toBe(0);
        expect(board.active).toBe(false);
    });

    describe('placeShip()', () => {
        it('places a ship successfully', () => {
            const result = board.placeShip([0, 0], true, 0);
            expect(result).toBe(true);
            expect(board.placedShips[0]).toBeDefined();
            expect(Ship).toHaveBeenCalledWith(4);
        });

        it('fails to place a ship if out of bounds', () => {
            const result = board.placeShip([9, 9], true, 0);
            expect(result).toBe(false);
        });

        it('fails if shipID already placed', () => {
            board.placeShip([0, 0], true, 0);
            const result = board.placeShip([2, 2], false, 0);
            expect(result).toBe(false);
        });

        it('fails if board is active', () => {
            board.active = true;
            const result = board.placeShip([0, 0], true, 0);
            expect(result).toBe(false);
        });
    });

    describe('removeShip()', () => {
        it('removes placed ship from board and placedShips', () => {
            board.placeShip([0, 0], true, 0);
            board.removeShip(0);

            expect(board.placedShips[0]).toBeUndefined();
            for (let i = 0; i < 4; i++) {
                expect(board.board[0][i]).toBeNull();
            }
        });

        it('does nothing if ship not found', () => {
            expect(() => board.removeShip(42)).not.toThrow();
        });

        it('does not remove if board is active', () => {
            board.placeShip([0, 0], true, 0);
            board.active = true;
            const removed = board.removeShip(0);
            expect(board.placedShips[0]).toBeDefined();
        });
    });

    describe('rotateShip()', () => {
        it('rotates ship successfully if space allows', () => {
            board.placeShip([0, 0], true, 0);
            const result = board.rotateShip(0);
            expect(result).toBe(true);
        });

        it('fails if rotated ship goes out of bounds', () => {
            board.placeShip([9, 9], true, 0);
            const result = board.rotateShip(0);
            expect(result).toBe(false);
        });

        it('fails if board is active', () => {
            board.placeShip([0, 0], true, 0);
            board.active = true;
            const result = board.rotateShip(0);
            expect(result).toBe(false);
        });
    });

    describe('receiveAttack()', () => {
        it('registers a miss if no ship', () => {
            const result = board.receiveAttack([5, 5]);
            expect(result).toEqual({ isHit: false, sunk: false });
            expect(board.missedHits.has('5,5')).toBe(true);
        });

        it('registers a hit and calls ship.hit()', () => {
            board.placeShip([0, 0], true, 0);
            const result = board.receiveAttack([0, 0]);

            expect(result.isHit).toBe(true);
            expect(Ship.mock.results[0].value.hit).toHaveBeenCalledTimes(1);
        });

        it('ignores duplicate hits', () => {
            board.placeShip([0, 0], true, 0);
            board.receiveAttack([0, 0]);
            const result = board.receiveAttack([0, 0]);

            expect(result).toEqual({ isHit: false, sunk: false });
        });

        it('marks ship as sunk and reveals adjacent on sink', () => {
            board.placeShip([0, 0], true, 9); // length 1
            const result = board.receiveAttack([0, 0]);

            expect(result.sunk).toBe(true);
            expect(board.missedHits.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('autoPlaceShips()', () => {
        it('places all ships without overlaps or errors', () => {
            board.autoPlaceShips();
            expect(Object.keys(board.placedShips)).toHaveLength(10);
        });
    });

    describe('allShipsPlaced()', () => {
        it('returns true only when all ships are placed', () => {
            expect(board.allShipsPlaced()).toBe(false);
            board.autoPlaceShips();
            expect(board.allShipsPlaced()).toBe(true);
        });
    });

    describe('allShipsSunk()', () => {
        it('returns false if not all ships are sunk', () => {
            board.placeShip([0, 0], true, 9); // length 1
            expect(board.allShipsSunk()).toBe(false);
        });

        it('returns true if all ships sunk', () => {
            board.placeShip([0, 0], true, 9); // length 1
            board.receiveAttack([0, 0]);
            expect(board.allShipsSunk()).toBe(true);
        });
    });
});
