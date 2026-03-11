// 1. Transform<T> - функция преобразования массива
export type Transform<T> = (data: T[]) => T[];

// 2. Where<T> - фильтрация по полю
export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

// 3. Sort<T> - сортировка по полю
export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

// 4. Group<T, K> - группа объектов
export interface Group<T, K extends keyof T> {
    key: T[K];
    items: T[];
}

// 5. GroupBy<T> - группировка по полю
export type GroupBy<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;

// 6. GroupTransform<T, K> - преобразование групп
export type GroupTransform<T, K extends keyof T> = (groups: Group<T, K>[]) => Group<T, K>[];

// 7. Having<T> - фильтрация групп по предикату
export type Having<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;

// Объединение всех возможных шагов конвейера
export type PipelineStep<T> = 
    | Transform<T> 
    | GroupTransform<T, any>;

// ============================================================
// НОВЫЕ ТИПЫ для строгого порядка операций
// ============================================================

// Типы для представления различных этапов конвейера
export type WhereStep<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
export type GroupByStep<T> = <K extends keyof T>(key: K) => Transform<Group<T, K>>;
export type HavingStep<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => GroupTransform<T, K>;
export type SortStep<T> = <K extends keyof T>(key: K) => Transform<T>;

// Типы для Fluent Interface
export interface QueryBuilder<T> {
    where: <K extends keyof T>(key: K, value: T[K]) => QueryBuilderWithWhere<T>;
    groupBy: <K extends keyof T>(key: K) => QueryBuilderWithGroupBy<T>;
    having: <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => QueryBuilderWithHaving<T>;
    sort: <K extends keyof T>(key: K) => QueryBuilderWithSort<T>;
    build: () => Transform<T>;
}

export interface QueryBuilderWithWhere<T> {
    where: <K extends keyof T>(key: K, value: T[K]) => QueryBuilderWithWhere<T>;
    groupBy: <K extends keyof T>(key: K) => QueryBuilderWithGroupBy<T>;
    having: <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => QueryBuilderWithHaving<T>;
    sort: <K extends keyof T>(key: K) => QueryBuilderWithSort<T>;
    build: () => Transform<T>;
}

export interface QueryBuilderWithGroupBy<T> {
    groupBy: <K extends keyof T>(key: K) => QueryBuilderWithGroupBy<T>;
    having: <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => QueryBuilderWithHaving<T>;
    sort: <K extends keyof T>(key: K) => QueryBuilderWithSort<T>;
    build: () => Transform<Group<T, any>>;
}

export interface QueryBuilderWithHaving<T> {
    having: <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => QueryBuilderWithHaving<T>;
    sort: <K extends keyof T>(key: K) => QueryBuilderWithSort<T>;
    build: () => Transform<Group<T, any>>;
}

export interface QueryBuilderWithSort<T> {
    sort: <K extends keyof T>(key: K) => QueryBuilderWithSort<T>;
    build: () => Transform<T>;
}

// ============================================================
// НОВАЯ ФУНКЦИЯ queryWithOrder - с контролем порядка
// ============================================================

/**
 * Создает конвейер со строгим порядком операций:
 * where → groupBy → having → sort
 */
export function queryWithOrder<T>(): QueryBuilder<T> {
    const whereOps: Transform<T>[] = [];
    const groupByOps: Transform<Group<T, any>>[] = [];
    const havingOps: GroupTransform<T, any>[] = [];
    const sortOps: Transform<T>[] = [];
    
    // Вспомогательная функция для создания build функции
    const createBuildFn = () => {
        return (data: T[]) => {
            let result: any = data;
            
            // Применяем where операции
            for (const op of whereOps) {
                result = op(result);
            }
            
            // Применяем groupBy операции
            for (const op of groupByOps) {
                result = op(result);
            }
            
            // Применяем having операции (фильтруем группы)
            for (const op of havingOps) {
                result = op(result);
            }
            
            // Если есть sort операции, нужно преобразовать группы обратно в массив пользователей
            if (sortOps.length > 0) {
                // Разворачиваем группы в массив пользователей
                if (Array.isArray(result) && result.length > 0 && 'items' in result[0]) {
                    result = result.flatMap((group: any) => group.items);
                }
                
                // Применяем sort операции
                for (const op of sortOps) {
                    result = op(result);
                }
            }
            
            return result as T[];
        };
    };
    
    const builder: QueryBuilder<T> = {
        // WHERE operation
        where: <K extends keyof T>(key: K, value: T[K]) => {
            const where = createWhere<T>();
            whereOps.push(where(key, value));
            
            const whereBuilder: QueryBuilderWithWhere<T> = {
                where: (k, v) => {
                    whereOps.push(where(k, v));
                    return whereBuilder;
                },
                groupBy: <K2 extends keyof T>(k: K2) => {
                    const groupBy = createGroupBy<T>();
                    groupByOps.push(groupBy(k) as Transform<Group<T, any>>);
                    
                    const groupByBuilder: QueryBuilderWithGroupBy<T> = {
                        groupBy: (k2) => {
                            groupByOps.push(groupBy(k2) as Transform<Group<T, any>>);
                            return groupByBuilder;
                        },
                        having: <K3 extends keyof T>(predicate: (group: Group<T, K3>) => boolean) => {
                            const having = createHaving<T>();
                            havingOps.push(having(predicate));
                            
                            const havingBuilder: QueryBuilderWithHaving<T> = {
                                having: (p) => {
                                    havingOps.push(having(p));
                                    return havingBuilder;
                                },
                                sort: <K4 extends keyof T>(k4: K4) => {
                                    const sort = createSort<T>();
                                    sortOps.push(sort(k4));
                                    
                                    const sortBuilder: QueryBuilderWithSort<T> = {
                                        sort: (k5) => {
                                            sortOps.push(sort(k5));
                                            return sortBuilder;
                                        },
                                        build: createBuildFn
                                    };
                                    return sortBuilder;
                                },
                                build: createBuildFn
                            };
                            return havingBuilder;
                        },
                        sort: <K4 extends keyof T>(k4: K4) => {
                            const sort = createSort<T>();
                            sortOps.push(sort(k4));
                            
                            const sortBuilder: QueryBuilderWithSort<T> = {
                                sort: (k5) => {
                                    sortOps.push(sort(k5));
                                    return sortBuilder;
                                },
                                build: createBuildFn
                            };
                            return sortBuilder;
                        },
                        build: createBuildFn
                    };
                    return groupByBuilder;
                },
                having: <K3 extends keyof T>(predicate: (group: Group<T, K3>) => boolean) => {
                    const having = createHaving<T>();
                    havingOps.push(having(predicate));
                    
                    const havingBuilder: QueryBuilderWithHaving<T> = {
                        having: (p) => {
                            havingOps.push(having(p));
                            return havingBuilder;
                        },
                        sort: <K4 extends keyof T>(k4: K4) => {
                            const sort = createSort<T>();
                            sortOps.push(sort(k4));
                            
                            const sortBuilder: QueryBuilderWithSort<T> = {
                                sort: (k5) => {
                                    sortOps.push(sort(k5));
                                    return sortBuilder;
                                },
                                build: createBuildFn
                            };
                            return sortBuilder;
                        },
                        build: createBuildFn
                    };
                    return havingBuilder;
                },
                sort: <K4 extends keyof T>(k4: K4) => {
                    const sort = createSort<T>();
                    sortOps.push(sort(k4));
                    
                    const sortBuilder: QueryBuilderWithSort<T> = {
                        sort: (k5) => {
                            sortOps.push(sort(k5));
                            return sortBuilder;
                        },
                        build: createBuildFn
                    };
                    return sortBuilder;
                },
                build: createBuildFn
            };
            return whereBuilder;
        },
        
        // GROUPBY operation
        groupBy: <K extends keyof T>(key: K) => {
            const groupBy = createGroupBy<T>();
            groupByOps.push(groupBy(key) as Transform<Group<T, any>>);
            
            const groupByBuilder: QueryBuilderWithGroupBy<T> = {
                groupBy: (k) => {
                    groupByOps.push(groupBy(k) as Transform<Group<T, any>>);
                    return groupByBuilder;
                },
                having: <K3 extends keyof T>(predicate: (group: Group<T, K3>) => boolean) => {
                    const having = createHaving<T>();
                    havingOps.push(having(predicate));
                    
                    const havingBuilder: QueryBuilderWithHaving<T> = {
                        having: (p) => {
                            havingOps.push(having(p));
                            return havingBuilder;
                        },
                        sort: <K4 extends keyof T>(k4: K4) => {
                            const sort = createSort<T>();
                            sortOps.push(sort(k4));
                            
                            const sortBuilder: QueryBuilderWithSort<T> = {
                                sort: (k5) => {
                                    sortOps.push(sort(k5));
                                    return sortBuilder;
                                },
                                build: createBuildFn
                            };
                            return sortBuilder;
                        },
                        build: createBuildFn
                    };
                    return havingBuilder;
                },
                sort: <K4 extends keyof T>(k4: K4) => {
                    const sort = createSort<T>();
                    sortOps.push(sort(k4));
                    
                    const sortBuilder: QueryBuilderWithSort<T> = {
                        sort: (k5) => {
                            sortOps.push(sort(k5));
                            return sortBuilder;
                        },
                        build: createBuildFn
                    };
                    return sortBuilder;
                },
                build: createBuildFn
            };
            return groupByBuilder;
        },
        
        // HAVING operation
        having: <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => {
            const having = createHaving<T>();
            havingOps.push(having(predicate));
            
            const havingBuilder: QueryBuilderWithHaving<T> = {
                having: (p) => {
                    havingOps.push(having(p));
                    return havingBuilder;
                },
                sort: <K4 extends keyof T>(k4: K4) => {
                    const sort = createSort<T>();
                    sortOps.push(sort(k4));
                    
                    const sortBuilder: QueryBuilderWithSort<T> = {
                        sort: (k5) => {
                            sortOps.push(sort(k5));
                            return sortBuilder;
                        },
                        build: createBuildFn
                    };
                    return sortBuilder;
                },
                build: createBuildFn
            };
            return havingBuilder;
        },
        
        // SORT operation
        sort: <K extends keyof T>(key: K) => {
            const sort = createSort<T>();
            sortOps.push(sort(key));
            
            const sortBuilder: QueryBuilderWithSort<T> = {
                sort: (k5) => {
                    sortOps.push(sort(k5));
                    return sortBuilder;
                },
                build: createBuildFn
            };
            return sortBuilder;
        },
        
        // BUILD operation
        build: createBuildFn
    };
    
    return builder;
}

// ============================================================
// СТАРАЯ ФУНКЦИЯ query (оставлена для обратной совместимости)
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
// ОРИГИНАЛЬНЫЕ ФУНКЦИИ
// ============================================================

// Создает функцию Where для типа T
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

// Создает функцию Having для типа T
export function createHaving<T>(): Having<T> {
    return <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => 
        (groups: Group<T, K>[]) => groups.filter(predicate);
}

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