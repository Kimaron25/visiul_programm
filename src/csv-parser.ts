import { readFile, writeFile } from 'node:fs/promises';

/**
 * Преобразует массив строк CSV в массив объектов
 * @param input - массив строк: первая строка - заголовки, остальные - данные
 * @param delimiter - разделитель
 * @returns массив объектов
 * @throws Error если данные некорректны
 */
export function csvToJSON(input: string[], delimiter: string): object[] {
    // Проверка на пустой вход
    if (!input || input.length === 0) {
        throw new Error('Input array is empty');
    }

    // Получаем заголовки из первой строки
    const headers = input[0].split(delimiter);
    
    // Проверяем, что заголовки не пустые
    if (headers.length === 0 || headers.some(h => h.trim() === '')) {
        throw new Error('Invalid headers');
    }

    const result: object[] = [];

    // Обрабатываем каждую строку данных (начиная со второй)
    for (let i = 1; i < input.length; i++) {
        const line = input[i];
        
        // Пропускаем пустые строки
        if (line.trim() === '') continue;
        
        const values = line.split(delimiter);
        
        // Проверка на несовпадение количества столбцов
        if (values.length !== headers.length) {
            throw new Error(`Line ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
        }

        const obj: Record<string, string | number> = {};
        
        // Создаем объект, приводя числа к числовому типу где возможно
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            let value: string | number = values[j].trim();
            
            // Пытаемся преобразовать в число, если это возможно
            if (/^-?\d+$/.test(value)) {
                value = parseInt(value, 10);
            } else if (/^-?\d+\.\d+$/.test(value)) {
                value = parseFloat(value);
            }
            
            obj[header] = value;
        }
        
        result.push(obj);
    }

    return result;
}

/**
 * Читает CSV файл, преобразует в JSON и записывает в выходной файл
 * @param input - путь к входному CSV файлу
 * @param output - путь к выходному JSON файлу
 * @param delimiter - разделитель
 */
export async function formatCSVFileToJSONFile(
    input: string, 
    output: string, 
    delimiter: string
): Promise<void> {
    try {
        // Читаем файл
        const fileContent = await readFile(input, 'utf-8');
        
        // Разбиваем содержимое на строки
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            throw new Error('Input file is empty');
        }
        
        // Преобразуем CSV в JSON
        const jsonData = csvToJSON(lines, delimiter);
        
        // Записываем результат с форматированием
        await writeFile(output, JSON.stringify(jsonData, null, 2), 'utf-8');
    } catch (error) {
        // Пробрасываем ошибку дальше
        throw new Error(`Failed to process CSV file: ${error instanceof Error ? error.message : String(error)}`);
    }
}