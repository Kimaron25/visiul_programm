/**
 * Типобезопасный конвейер преобразований над массивами объектов
 * Lab 4 - Type-safe pipeline transformations
 */

// ============================================================
// 1. Transform<T> - функция преобразования массива
// ============================================================
export type Transform<T> = (data: T[]) => T[];

// ============================================================
// 2. Where<T> - фильтрация по полю
// ============================================================
export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

// ============================================================
// 3. Sort<T> - сортировка по полю
// ============================================================
export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

// ============================================================
// 4. Group<T, K> - группа объектов
// ============================================================
export interface Group<T, K extends keyof T> {
    key: T[K];
    items: T[];
}

// ============================================================
// 5. GroupBy<T> - группировка по полю
// ============================================================
export type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;

// ============================================================
// 6. GroupTransform<T, K> - преобразование групп
// ============================================================
export type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];

// ============================================================
// 7. Having<T> - фильтрация групп по предикату
// ============================================================
export type Having<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;

// ============================================================
// Вспомогательные типы
// ============================================================

// Объединение всех возможных шагов конвейера
export type PipelineStep<T> = 
    | Transform<T> 
    | GroupTransform<T, any>;

// ============================================================
// 8. query - функция создания конвейера
// ============================================================

/**
 * Создает конвейер из последовательности шагов преобразования
 * @param steps - переменное количество шагов (where, sort, groupBy, having)
 * @returns функция, применяющая все шаги к входным данным
 */
export function query<T>(...steps: PipelineStep<T>[]): Transform<T> {
    return (data: T[]) => {
        let result: any = data;
        
        for (const step of steps) {
            result = step(result);
        }
        
        return result as T[];
    };
}

// ============================================================
// Фабрики для создания функций преобразования
// ============================================================

/**
 * Создает функцию Where для типа T
 */
export function createWhere<T>(): Where<T> {
    return <K extends keyof T>(key: K, value: T[K]) => 
        (data: T[]) => data.filter(item => item[key] === value);
}

/**
 * Создает функцию Sort для типа T
 */
export function createSort<T>(): Sort<T> {
    return <K extends keyof T>(key: K) => 
        (data: T[]) => [...data].sort((a, b) => {
            const av = a[key];
            const bv = b[key];
            
            // Обработка undefined/null
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            
            if (av < bv) return -1;
            if (av > bv) return 1;
            return 0;
        });
}

/**
 * Создает функцию GroupBy для типа T
 */
export function createGroupBy<T>(): GroupBy<T> {
    return <K extends keyof T>(key: K) => 
        (data: T[]) => {
            const groups = data.reduce((acc, item) => {
                const groupKey = item[key];
                const keyString = String(groupKey);
                
                if (!acc[keyString]) {
                    acc[keyString] = {
                        key: groupKey,
                        items: []
                    };
                }
                
                acc[keyString].items.push(item);
                return acc;
            }, {} as Record<string, Group<T, K>>);
            
            return Object.values(groups);
        };
}

/**
 * Создает функцию Having для типа T
 */
export function createHaving<T>(): Having<T> {
    return <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => 
        (groups: Group<T, K>[]) => groups.filter(predicate);
}

// ============================================================
// Вспомогательные функции для удобства использования
// ============================================================

/**
 * Проверяет, является ли шаг групповым преобразованием
 */
/**
 * Проверяет, является ли шаг групповым преобразованием
 */
export function isGroupTransform<T>(step: PipelineStep<T>): step is GroupTransform<T, any> {
    if (typeof step !== 'function') return false;
    
    try {
        // Создаем тестовые данные для проверки
        const testData = [] as any[];
        const result = step(testData);
        
        // Если результат не массив - это не Transform и не GroupTransform
        if (!Array.isArray(result)) return false;
        
        // Проверяем, есть ли у результата свойства, характерные для групп
        if (result.length === 0) {
            // Для пустого результата сложно определить, поэтому проверяем по имени функции
            const funcStr = step.toString().toLowerCase();
            return funcStr.includes('group') || funcStr.includes('having');
        }
        
        // Проверяем первый элемент на наличие полей key и items
        const firstItem = result[0];
        const hasGroupStructure = firstItem && 
                                 'key' in firstItem && 
                                 'items' in firstItem &&
                                 Array.isArray(firstItem.items);
        
        return hasGroupStructure;
    } catch {
        // Если вызов вызывает ошибку, пробуем определить по сигнатуре
        const funcStr = step.toString().toLowerCase();
        return funcStr.includes('group') && !funcStr.includes('data');
    }
}

/**
 * Преобразует массив групп обратно в плоский массив
 */
export function flattenGroups<T, K extends keyof T>(groups: Group<T, K>[]): T[] {
    return groups.flatMap(group => group.items);
}

/**
 * Получает уникальные значения поля из массива объектов
 */
export function distinct<T, K extends keyof T>(data: T[], key: K): T[K][] {
    const values = new Set<T[K]>();
    data.forEach(item => values.add(item[key]));
    return Array.from(values);
}

/**
 * Подсчитывает количество элементов в каждой группе
 */
export function countBy<T, K extends keyof T>(data: T[], key: K): Map<T[K], number> {
    const counts = new Map<T[K], number>();
    data.forEach(item => {
        const value = item[key];
        counts.set(value, (counts.get(value) || 0) + 1);
    });
    return counts;
}