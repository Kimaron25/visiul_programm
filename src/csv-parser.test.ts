import { describe, it, expect, vi, beforeEach } from 'vitest';
import { csvToJSON, formatCSVFileToJSONFile } from './csv-parser';
import { readFile, writeFile } from 'node:fs/promises';

// Мокаем модуль fs/promises
vi.mock('node:fs/promises');

describe('csvToJSON', () => {
    describe('корректные входные данные', () => {
        it('должен преобразовать простой CSV с точкой с запятой', () => {
            const input = ['name;age;city', 'John;25;New York', 'Jane;30;London'];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { name: 'John', age: 25, city: 'New York' },
                { name: 'Jane', age: 30, city: 'London' }
            ]);
        });

        it('должен преобразовать CSV с запятой', () => {
            const input = ['name,age,city', 'John,25,New York', 'Jane,30,London'];
            const result = csvToJSON(input, ',');
            
            expect(result).toEqual([
                { name: 'John', age: 25, city: 'New York' },
                { name: 'Jane', age: 30, city: 'London' }
            ]);
        });

        it('должен обрабатывать числа с плавающей точкой', () => {
            const input = ['product;price;quantity', 'Apple;1.5;10', 'Banana;2.75;5'];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { product: 'Apple', price: 1.5, quantity: 10 },
                { product: 'Banana', price: 2.75, quantity: 5 }
            ]);
        });

        it('должен игнорировать пустые строки', () => {
            const input = ['id;value', '1;100', '', '2;200', '   ', '3;300'];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { id: 1, value: 100 },
                { id: 2, value: 200 },
                { id: 3, value: 300 }
            ]);
        });

        it('должен сохранять строки, которые не являются числами', () => {
            const input = ['code;description', 'A001;Item 1', 'B002;Item 2 with spaces'];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { code: 'A001', description: 'Item 1' },
                { code: 'B002', description: 'Item 2 with spaces' }
            ]);
        });

        it('должен работать с примером из задания', () => {
            const input = ["p1;p2;p3;p4", "1;A;b;c", "2;B;v;d"];
            const result = csvToJSON(input, ';');
            
            expect(result).toEqual([
                { p1: 1, p2: 'A', p3: 'b', p4: 'c' },
                { p1: 2, p2: 'B', p3: 'v', p4: 'd' }
            ]);
        });
    });

    describe('некорректные входные данные', () => {
        it('должен выбрасывать ошибку при пустом массиве', () => {
            expect(() => csvToJSON([], ';')).toThrow('Input array is empty');
        });

        it('должен выбрасывать ошибку при несовпадении количества столбцов', () => {
            const input = ['header1;header2', 'value1', 'value1;value2;value3'];
            
            expect(() => csvToJSON(input, ';')).toThrow(/Column count mismatch/);
        });

        it('должен выбрасывать ошибку при пустых заголовках', () => {
            const input = [';', '1;2'];
            
            expect(() => csvToJSON(input, ';')).toThrow('Invalid headers');
        });

        it('должен выбрасывать ошибку при null/undefined', () => {
            expect(() => csvToJSON(null as any, ';')).toThrow();
            expect(() => csvToJSON(undefined as any, ';')).toThrow();
        });
    });
});

describe('formatCSVFileToJSONFile', () => {
    // Сбрасываем моки перед каждым тестом
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('успешная обработка', () => {
        it('должен читать CSV файл и записывать JSON', async () => {
            // Настраиваем заглушку readFile
            const mockCSV = 'name;age;city\nJohn;25;New York\nJane;30;London';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            // Вызываем тестируемую функцию
            await formatCSVFileToJSONFile('input.csv', 'output.json', ';');
            
            // Проверяем, что readFile был вызван с правильным путем
            expect(readFile).toHaveBeenCalledTimes(1);
            expect(readFile).toHaveBeenCalledWith('input.csv', 'utf-8');
            
            // Проверяем, что writeFile был вызван с правильными параметрами
            expect(writeFile).toHaveBeenCalledTimes(1);
            expect(writeFile).toHaveBeenCalledWith(
                'output.json',
                JSON.stringify([
                    { name: 'John', age: 25, city: 'New York' },
                    { name: 'Jane', age: 30, city: 'London' }
                ], null, 2),
                'utf-8'
            );
        });

        it('должен обрабатывать CSV с запятой как разделителем', async () => {
            const mockCSV = 'name,age,city\nJohn,25,New York\nJane,30,London';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            await formatCSVFileToJSONFile('input.csv', 'output.json', ',');
            
            expect(writeFile).toHaveBeenCalledWith(
                'output.json',
                JSON.stringify([
                    { name: 'John', age: 25, city: 'New York' },
                    { name: 'Jane', age: 30, city: 'London' }
                ], null, 2),
                'utf-8'
            );
        });

        it('должен игнорировать пустые строки в файле', async () => {
            const mockCSV = 'id;value\n1;100\n\n2;200\n   \n3;300';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            await formatCSVFileToJSONFile('input.csv', 'output.json', ';');
            
            expect(writeFile).toHaveBeenCalledWith(
                'output.json',
                JSON.stringify([
                    { id: 1, value: 100 },
                    { id: 2, value: 200 },
                    { id: 3, value: 300 }
                ], null, 2),
                'utf-8'
            );
        });
    });

    describe('обработка ошибок', () => {
        it('должен выбрасывать ошибку при проблемах с чтением файла', async () => {
            // Настраиваем заглушку readFile на ошибку
            vi.mocked(readFile).mockRejectedValue(new Error('File not found'));
            
            // Проверяем, что функция выбрасывает ошибку
            await expect(
                formatCSVFileToJSONFile('nonexistent.csv', 'output.json', ';')
            ).rejects.toThrow('Failed to process CSV file: File not found');
            
            // Проверяем, что writeFile не вызывался
            expect(writeFile).not.toHaveBeenCalled();
        });

        it('должен выбрасывать ошибку при несовпадении количества колонок', async () => {
            const mockCSV = 'header1;header2\nvalue1\nvalue1;value2;value3';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            await expect(
                formatCSVFileToJSONFile('input.csv', 'output.json', ';')
            ).rejects.toThrow('Failed to process CSV file');
            
            expect(writeFile).not.toHaveBeenCalled();
        });

        it('должен выбрасывать ошибку при пустом файле', async () => {
            vi.mocked(readFile).mockResolvedValue('');
            
            await expect(
                formatCSVFileToJSONFile('empty.csv', 'output.json', ';')
            ).rejects.toThrow('Input file is empty');
            
            expect(writeFile).not.toHaveBeenCalled();
        });

        it('должен выбрасывать ошибку при некорректных заголовках', async () => {
            const mockCSV = ';\n1;2';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            await expect(
                formatCSVFileToJSONFile('input.csv', 'output.json', ';')
            ).rejects.toThrow('Failed to process CSV file');
            
            expect(writeFile).not.toHaveBeenCalled();
        });
    });

    describe('проверка вызовов с разными параметрами', () => {
        it('должен вызывать writeFile с разными путями', async () => {
            const mockCSV = 'col1;col2\na;b';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            await formatCSVFileToJSONFile('data.csv', 'result.json', ';');
            
            expect(writeFile).toHaveBeenCalledWith(
                'result.json',
                JSON.stringify([{ col1: 'a', col2: 'b' }], null, 2),
                'utf-8'
            );
        });

        it('должен правильно обрабатывать числовые значения', async () => {
            const mockCSV = 'int;float\n42;3.14';
            vi.mocked(readFile).mockResolvedValue(mockCSV);
            
            await formatCSVFileToJSONFile('numbers.csv', 'numbers.json', ';');
            
            expect(writeFile).toHaveBeenCalledWith(
                'numbers.json',
                JSON.stringify([{ int: 42, float: 3.14 }], null, 2),
                'utf-8'
            );
        });
    });
});