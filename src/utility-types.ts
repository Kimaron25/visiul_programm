/**
 * Задание 6: Утилитарные типы TypeScript
 * Lab 6 - Utility Types with Type Tests
 */

// ============================================================
// 1. DeepReadonly<T> - рекурсивный readonly
// ============================================================

/**
 * Делает все свойства объекта (и вложенные объекты) readonly
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object 
        ? DeepReadonly<T[P]> 
        : T[P];
};

// Пример работы:
// type User = { name: string, address: { city: string } }
// DeepReadonly<User> -> { readonly name: string, readonly address: { readonly city: string } }

// ============================================================
// 2. PickedByType<T, U> - выбирает свойства типа U
// ============================================================

/**
 * Выбирает из объекта T только те свойства, которые имеют тип U
 */
export type PickedByType<T, U> = {
    [P in keyof T as T[P] extends U ? P : never]: T[P];
};

// Пример работы:
// type User = { id: number, name: string, age: number }
// PickedByType<User, number> -> { id: number, age: number }
// PickedByType<User, string> -> { name: string }

// ============================================================
// 3. EventHandlers<T> - генерирует обработчики событий
// ============================================================

/**
 * Преобразует объект с типами событий в объект с обработчиками onEventName
 * 
 * Пример:
 * type Events = { click: MouseEvent; scroll: UIEvent; }
 * EventHandlers<Events> -> { onClick: (event: MouseEvent) => void; onScroll: (event: UIEvent) => void; }
 */
export type EventHandlers<T> = {
    [K in keyof T as K extends string ? `on${Capitalize<K>}` : never]: (event: T[K]) => void;
};

// Вспомогательный тип для capitalize (встроенный в TypeScript)
// Используем встроенный Capitalize<K>

// ============================================================
// Дополнительные утилитарные типы для демонстрации
// ============================================================

/**
 * Делает все свойства опциональными рекурсивно
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Делает все свойства обязательными рекурсивно
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Заменяет null и undefined на never
 */
export type NonNullableDeep<T> = T extends object
    ? { [P in keyof T]: NonNullableDeep<NonNullable<T[P]>> }
    : NonNullable<T>;

/**
 * Получает типы значений объекта
 */
export type ValueOf<T> = T[keyof T];

/**
 * Делает определенные ключи обязательными
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Делает определенные ключи опциональными
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;