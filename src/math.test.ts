import { describe, it, expect } from 'vitest';
import {
    createUser,
    createBook,
    calculateArea,
    getStatusColor,
    capitalizeFirstLetter,
    trimAndFormat,
    getFirstElement,
    findById,
    type User,
    type Book,
    type HasId
} from './test-typescript';

describe('createUser', () => {
    it('should create a user with all fields', () => {
        const user = createUser(1, 'Иван Иванов', 'ivan@example.com', true);
        expect(user).toEqual({
            id: 1,
            name: 'Иван Иванов',
            email: 'ivan@example.com',
            isActive: true
        });
    });

    it('should create a user without email', () => {
        const user = createUser(2, 'Петр Петров');
        expect(user).toEqual({
            id: 2,
            name: 'Петр Петров',
            email: undefined,
            isActive: true
        });
    });

    it('should set isActive to false when specified', () => {
        const user = createUser(3, 'Сидор Сидоров', undefined, false);
        expect(user.isActive).toBe(false);
    });
});

describe('createBook', () => {
    it('should create a book with all fields', () => {
        const book = createBook({
            title: 'Война и мир',
            author: 'Лев Толстой',
            year: 1867,
            genre: 'fiction'
        });
        
        expect(book).toEqual({
            title: 'Война и мир',
            author: 'Лев Толстой',
            year: 1867,
            genre: 'fiction'
        });
    });

    it('should create a book without year', () => {
        const book = createBook({
            title: 'Краткая история времени',
            author: 'Стивен Хокинг',
            genre: 'non-fiction'
        });
        
        expect(book.year).toBeUndefined();
        expect(book.genre).toBe('non-fiction');
    });
});

describe('calculateArea', () => {
    it('should calculate circle area correctly', () => {
        expect(calculateArea('circle', 5)).toBeCloseTo(Math.PI * 25, 5);
        expect(calculateArea('circle', 0)).toBe(0);
    });

    it('should calculate square area correctly', () => {
        expect(calculateArea('square', 4)).toBe(16);
        expect(calculateArea('square', 2.5)).toBe(6.25);
        expect(calculateArea('square', 0)).toBe(0);
    });
});

describe('getStatusColor', () => {
    it('should return correct colors', () => {
        expect(getStatusColor('active')).toBe('green');
        expect(getStatusColor('inactive')).toBe('gray');
        expect(getStatusColor('new')).toBe('blue');
    });
});

describe('StringFormatter functions', () => {
    describe('capitalizeFirstLetter', () => {
        it('should capitalize first letter', () => {
            expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
            expect(capitalizeFirstLetter('test')).toBe('Test');
        });

        it('should uppercase when flag is true', () => {
            expect(capitalizeFirstLetter('hello', true)).toBe('HELLO');
            expect(capitalizeFirstLetter('test', true)).toBe('TEST');
        });
    });

    describe('trimAndFormat', () => {
        it('should trim whitespace', () => {
            expect(trimAndFormat('  hello  ')).toBe('hello');
            expect(trimAndFormat('  world  ')).toBe('world');
        });

        it('should trim and uppercase', () => {
            expect(trimAndFormat('  hello  ', true)).toBe('HELLO');
            expect(trimAndFormat('  test  ', true)).toBe('TEST');
        });
    });
});

describe('getFirstElement', () => {
    it('should return first element of array', () => {
        expect(getFirstElement([1, 2, 3])).toBe(1);
        expect(getFirstElement(['a', 'b', 'c'])).toBe('a');
    });

    it('should return undefined for empty array', () => {
        expect(getFirstElement([])).toBeUndefined();
    });
});

describe('findById', () => {
    interface TestItem extends HasId {
        name: string;
    }

    const items: TestItem[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ];

    it('should find item by id', () => {
        expect(findById(items, 2)).toEqual({ id: 2, name: 'Item 2' });
    });

    it('should return undefined for non-existent id', () => {
        expect(findById(items, 999)).toBeUndefined();
    });

    it('should work with empty array', () => {
        expect(findById([], 1)).toBeUndefined();
    });
});
