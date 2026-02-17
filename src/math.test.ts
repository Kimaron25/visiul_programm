import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
} from './math';

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
        const user = createUser(2, 'Петр Петров', undefined, false);
        
        expect(user).toEqual({
            id: 2,
            name: 'Петр Петров',
            email: undefined,
            isActive: false
        });
    });

    it('should set isActive to true by default', () => {
        const user = createUser(3, 'Сидор Сидоров');
        
        expect(user.isActive).toBe(true);
        expect(user.email).toBeUndefined();
    });

    it('should have correct types', () => {
        const user = createUser(4, 'Тест Тестов');
        
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.isActive).toBe('boolean');
    });
});

describe('createBook', () => {
    it('should create a book with all fields', () => {
        const bookData: Book = {
            title: 'Война и мир',
            author: 'Лев Толстой',
            year: 1867,
            genre: 'fiction'
        };
        
        const book = createBook(bookData);
        
        expect(book).toEqual(bookData);
        expect(book.year).toBe(1867);
    });

    it('should create a book without year', () => {
        const bookData: Book = {
            title: 'Краткая история времени',
            author: 'Стивен Хокинг',
            genre: 'non-fiction'
        };
        
        const book = createBook(bookData);
        
        expect(book).toEqual(bookData);
        expect(book.year).toBeUndefined();
    });

    it('should handle different genres', () => {
        const fictionBook: Book = {
            title: '1984',
            author: 'Джордж Оруэлл',
            genre: 'fiction'
        };
        
        const nonFictionBook: Book = {
            title: 'Sapiens',
            author: 'Юваль Ной Харари',
            genre: 'non-fiction'
        };
        
        expect(createBook(fictionBook).genre).toBe('fiction');
        expect(createBook(nonFictionBook).genre).toBe('non-fiction');
    });
});

describe('calculateArea', () => {
    it('should calculate circle area correctly', () => {
        const radius = 5;
        const expectedArea = Math.PI * radius * radius;
        
        expect(calculateArea('circle', radius)).toBeCloseTo(expectedArea, 5);
    });

    it('should calculate square area correctly', () => {
        const side = 4;
        const expectedArea = side * side;
        
        expect(calculateArea('square', side)).toBe(expectedArea);
    });

    it('should handle zero values', () => {
        expect(calculateArea('circle', 0)).toBe(0);
        expect(calculateArea('square', 0)).toBe(0);
    });

    it('should handle decimal values', () => {
        expect(calculateArea('square', 2.5)).toBe(6.25);
        expect(calculateArea('circle', 2.5)).toBeCloseTo(Math.PI * 6.25, 5);
    });
});

describe('getStatusColor', () => {
    it('should return correct color for active status', () => {
        expect(getStatusColor('active')).toBe('green');
    });

    it('should return correct color for inactive status', () => {
        expect(getStatusColor('inactive')).toBe('gray');
    });

    it('should return correct color for new status', () => {
        expect(getStatusColor('new')).toBe('blue');
    });

    it('should handle all status types', () => {
        const statuses: Array<'active' | 'inactive' | 'new'> = ['active', 'inactive', 'new'];
        const expectedColors = ['green', 'gray', 'blue'];
        
        statuses.forEach((status, index) => {
            expect(getStatusColor(status)).toBe(expectedColors[index]);
        });
    });
});

describe('StringFormatter functions', () => {
    describe('capitalizeFirstLetter', () => {
        it('should capitalize first letter of string', () => {
            expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
            expect(capitalizeFirstLetter('test')).toBe('Test');
        });

        it('should uppercase entire string when uppercase flag is true', () => {
            expect(capitalizeFirstLetter('hello world', true)).toBe('HELLO WORLD');
            expect(capitalizeFirstLetter('test', true)).toBe('TEST');
        });

        it('should handle empty string', () => {
            expect(capitalizeFirstLetter('')).toBe('');
            expect(capitalizeFirstLetter('', true)).toBe('');
        });

        it('should handle single character', () => {
            expect(capitalizeFirstLetter('a')).toBe('A');
            expect(capitalizeFirstLetter('a', true)).toBe('A');
        });
    });

    describe('trimAndFormat', () => {
        it('should trim whitespace from string', () => {
            expect(trimAndFormat('  hello world  ')).toBe('hello world');
            expect(trimAndFormat('   test   ')).toBe('test');
        });

        it('should trim and uppercase when uppercase flag is true', () => {
            expect(trimAndFormat('  hello world  ', true)).toBe('HELLO WORLD');
            expect(trimAndFormat('   test   ', true)).toBe('TEST');
        });

        it('should handle string with no whitespace', () => {
            expect(trimAndFormat('hello')).toBe('hello');
            expect(trimAndFormat('hello', true)).toBe('HELLO');
        });

        it('should handle empty string', () => {
            expect(trimAndFormat('')).toBe('');
            expect(trimAndFormat('', true)).toBe('');
        });
    });
});

describe('getFirstElement', () => {
    it('should return first element of number array', () => {
        const numbers = [1, 2, 3, 4, 5];
        expect(getFirstElement(numbers)).toBe(1);
    });

    it('should return first element of string array', () => {
        const strings = ['apple', 'banana', 'cherry'];
        expect(getFirstElement(strings)).toBe('apple');
    });

    it('should return undefined for empty array', () => {
        const emptyArray: number[] = [];
        expect(getFirstElement(emptyArray)).toBeUndefined();
    });

    it('should work with different types', () => {
        const booleanArray = [true, false, true];
        const objectArray = [{ id: 1 }, { id: 2 }];
        
        expect(getFirstElement(booleanArray)).toBe(true);
        expect(getFirstElement(objectArray)).toEqual({ id: 1 });
    });
});

describe('findById', () => {
    interface TestItem extends HasId {
        name: string;
        value: number;
    }

    const testItems: TestItem[] = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
    ];

    it('should find item by existing id', () => {
        const found = findById(testItems, 2);
        expect(found).toEqual({ id: 2, name: 'Item 2', value: 200 });
    });

    it('should return undefined for non-existing id', () => {
        const found = findById(testItems, 999);
        expect(found).toBeUndefined();
    });

    it('should work with different types of objects', () => {
        interface Product extends HasId {
            name: string;
            price: number;
        }

        interface Employee extends HasId {
            name: string;
            position: string;
        }

        const products: Product[] = [
            { id: 1, name: 'Laptop', price: 1000 },
            { id: 2, name: 'Mouse', price: 50 }
        ];

        const employees: Employee[] = [
            { id: 101, name: 'Alice', position: 'Manager' },
            { id: 102, name: 'Bob', position: 'Developer' }
        ];

        expect(findById(products, 1)).toEqual({ id: 1, name: 'Laptop', price: 1000 });
        expect(findById(employees, 102)).toEqual({ id: 102, name: 'Bob', position: 'Developer' });
    });

    it('should handle empty array', () => {
        const emptyArray: TestItem[] = [];
        expect(findById(emptyArray, 1)).toBeUndefined();
    });
});