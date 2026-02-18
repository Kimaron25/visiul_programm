export interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

export function createUser(id: number, name: string, email?: string, isActive: boolean = true): User {
    return {
        id,
        name,
        email,
        isActive
    };
}

export type Genre = 'fiction' | 'non-fiction';

export interface Book {
    title: string;
    author: string;
    year?: number;
    genre: Genre;
}

export function createBook(book: Book): Book {
    return book;
}

export function calculateArea(shape: 'circle', radius: number): number;
export function calculateArea(shape: 'square', side: number): number;
export function calculateArea(shape: 'circle' | 'square', param: number): number {
    if (shape === 'circle') {
        return Math.PI * param * param;
    } else {
        return param * param;
    }
}

export type Status = 'active' | 'inactive' | 'new';

export function getStatusColor(status: Status): string {
    switch(status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'gray';
        case 'new':
            return 'blue';
    }
}

export type StringFormatter = (str: string, uppercase?: boolean) => string;

export const capitalizeFirstLetter: StringFormatter = (str, uppercase = false) => {
    let result = str.charAt(0).toUpperCase() + str.slice(1);
    if (uppercase) {
        return result.toUpperCase();
    }
    return result;
};

export const trimAndFormat: StringFormatter = (str, uppercase = false) => {
    let result = str.trim();
    if (uppercase) {
        return result.toUpperCase();
    }
    return result;
};

export function getFirstElement<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
}

export interface HasId {
    id: number;
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return items[i];
        }
    }
    return undefined;
}

console.log('=== 1. Функция createUser ===');
const user1 = createUser(1, "Иван Иванов", "ivan@example.com");
const user2 = createUser(2, "Петр Петров", undefined, false);
console.log('Пользователь 1:', user1);
console.log('Пользователь 2:', user2);

console.log('\n=== 2. Функция createBook ===');
const book1 = createBook({
    title: "Война и мир",
    author: "Лев Толстой",
    year: 1867,
    genre: "fiction"
});
const book2 = createBook({
    title: "Краткая история времени",
    author: "Стивен Хокинг",
    genre: "non-fiction"
});
console.log('Книга 1 (с годом):', book1);
console.log('Книга 2 (без года):', book2);

console.log('\n=== 3. Функция calculateArea ===');
const circleArea = calculateArea('circle', 5);
const squareArea = calculateArea('square', 4);
console.log(`Площадь круга радиусом 5: ${circleArea.toFixed(2)}`);
console.log(`Площадь квадрата со стороной 4: ${squareArea}`);

console.log('\n=== 4. Функция getStatusColor ===');
console.log(`Цвет для 'active': ${getStatusColor('active')}`);
console.log(`Цвет для 'new': ${getStatusColor('new')}`);
console.log(`Цвет для 'inactive': ${getStatusColor('inactive')}`);

console.log('=== Тестирование StringFormatter ===');

console.log('1. capitalizeFirstLetter:');
console.log('   "hello world" ->', capitalizeFirstLetter("hello world")); 
console.log('   "hello world", true ->', capitalizeFirstLetter("hello world", true)); 
console.log('   "test" ->', capitalizeFirstLetter("test")); 
console.log('   "test", true ->', capitalizeFirstLetter("test", true)); 


console.log('\n2. trimAndFormat:');
console.log('   "  hello world  " ->', trimAndFormat("  hello world  ")); 
console.log('   "  hello world  ", true ->', trimAndFormat("  hello world  ", true)); 
console.log('   "   test   " ->', trimAndFormat("   test   ")); 
console.log('   "   test   ", true ->', trimAndFormat("   test   ", true)); 

console.log('\n=== 6. Функция getFirstElement ===');
const numbers = [1, 2, 3, 4, 5];
const strings = ["apple", "banana", "cherry"];
const emptyArray: number[] = [];
console.log('Первый элемент массива чисел:', getFirstElement(numbers));
console.log('Первый элемент массива строк:', getFirstElement(strings));
console.log('Первый элемент пустого массива:', getFirstElement(emptyArray));

console.log('\n=== 7. Функция findById ===');
interface Product extends HasId {
    name: string;
    price: number;
}

interface Employee extends HasId {
    name: string;
    position: string;
}

const products: Product[] = [
    { id: 1, name: "Laptop", price: 1000 },
    { id: 2, name: "Mouse", price: 50 },
    { id: 3, name: "Keyboard", price: 100 }
];

const employees: Employee[] = [
    { id: 101, name: "Alice", position: "Manager" },
    { id: 102, name: "Bob", position: "Developer" }
];

console.log('Поиск продукта с id=2:', findById(products, 2));
console.log('Поиск сотрудника с id=101:', findById(employees, 101));
console.log('Поиск несуществующего id=999:', findById(products, 999));