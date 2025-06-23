import Ship from "../src/ship";

describe('Ship Class', () => {
    it('initializes with given length and zero hits', () => {
        const ship = new Ship(3);
        expect(ship.length).toBe(3);
        expect(ship.hits).toBe(0);
    });

    it('increments hits when hit()', () => {
        const ship = new Ship(3);
        ship.hit();
        expect(ship.hits).toBe(1);
        ship.hit();
        expect(ship.hits).toBe(2);
    });

    it('does not exceed max hits (length)', () => {
        const ship = new Ship(2);
        ship.hit();
        ship.hit();
        ship.hit(); // Extra hit
        expect(ship.hits).toBe(2);
    });

    it('isSunk() returns false before enough hits', () => {
        const ship = new Ship(4);
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(false);
    });

    it('isSunk() returns true when hits >= length', () => {
        const ship = new Ship(2);
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });
});