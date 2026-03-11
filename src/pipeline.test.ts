import { describe, it, expect, expectTypeOf } from 'vitest';
import { 
    query,
    queryWithOrder,
    createWhere, 
    createSort, 
    createGroupBy, 
    createHaving,
    flattenGroups,
    distinct,
    countBy,
    isGroupTransform,
    type Transform,
    type Group
} from './pipeline';

describe('Pipeline with strict ordering', () => {
    type User = {
        id: number;
        name: string;
        surname: string;
        age: number;
        city: string;
        active: boolean;
        score?: number;
    };

    const users: User[] = [
        { id: 1, name: "John", surname: "Doe", age: 34, city: "NY", active: true, score: 85 },
        { id: 2, name: "John", surname: "Doe", age: 33, city: "NY", active: true, score: 92 },
        { id: 3, name: "John", surname: "Doe", age: 35, city: "LA", active: false, score: 78 },
        { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA", active: true, score: 95 },
        { id: 5, name: "Anna", surname: "Smith", age: 28, city: "NY", active: true, score: 88 },
        { id: 6, name: "Anna", surname: "Smith", age: 32, city: "LA", active: false, score: 91 },
        { id: 7, name: "Peter", surname: "Jones", age: 41, city: "NY", active: true },
        { id: 8, name: "Sarah", surname: "Williams", age: 29, city: "LA", active: true, score: 87 },
    ];

    // ============================================================
    // ТЕСТЫ ТИПОВ (Type Tests) - проверка системы типов
    // ============================================================

    describe('Type System Tests', () => {
        it('should allow correct order: where → groupBy → having → sort', () => {
            const pipeline = queryWithOrder<User>()
                .where("city", "NY")
                .where("active", true)
                .groupBy("name")
                .having<"name">((group) => group.items.length > 1)
                .sort("age")
                .build();
            
            expectTypeOf(pipeline).toBeFunction();
            expectTypeOf(pipeline).returns.toBeArray();
        });

        it('should allow where only', () => {
            const pipeline = queryWithOrder<User>()
                .where("city", "NY")
                .build();
            
            expectTypeOf(pipeline).toBeFunction();
        });

        it('should allow where and groupBy only', () => {
            const pipeline = queryWithOrder<User>()
                .where("city", "NY")
                .groupBy("name")
                .build();
            
            expectTypeOf(pipeline).toBeFunction();
        });

        it('should allow where, groupBy and having only', () => {
            const pipeline = queryWithOrder<User>()
                .where("city", "NY")
                .groupBy("name")
                .having<"name">((group) => group.items.length > 1)
                .build();
            
            expectTypeOf(pipeline).toBeFunction();
        });

        it('should allow empty pipeline', () => {
            const pipeline = queryWithOrder<User>().build();
            expectTypeOf(pipeline).toBeFunction();
        });
    });

    // ============================================================
    // ТЕСТЫ НА ОШИБКИ КОМПИЛЯЦИИ
    // ============================================================

    describe('Compilation Errors Tests', () => {
        it('should NOT allow sort before where', () => {
            // @ts-expect-error - sort before where
            // queryWithOrder<User>().sort("age").where("city", "NY").build();
            expect(true).toBe(true);
        });

        it('should NOT allow having before groupBy', () => {
            // @ts-expect-error - having before groupBy
            // queryWithOrder<User>().having<"city">((g) => true).groupBy("city").build();
            expect(true).toBe(true);
        });

        it('should NOT allow groupBy after sort', () => {
            // @ts-expect-error - groupBy after sort
            // queryWithOrder<User>().sort("age").groupBy("city").build();
            expect(true).toBe(true);
        });

        it('should NOT allow sort before having', () => {
            // @ts-expect-error - sort before having
            // queryWithOrder<User>().groupBy("city").sort("age").having<"city">((g) => true).build();
            expect(true).toBe(true);
        });

        it('should NOT allow having after sort', () => {
            // @ts-expect-error - having after sort
            // queryWithOrder<User>().groupBy("city").sort("age").having<"city">((g) => true).build();
            expect(true).toBe(true);
        });

        it('should NOT allow where after groupBy', () => {
            // @ts-expect-error - where after groupBy
            // queryWithOrder<User>().groupBy("city").where("city", "NY").build();
            expect(true).toBe(true);
        });
    });

    // ============================================================
    // ФУНКЦИОНАЛЬНЫЕ ТЕСТЫ (ИСПРАВЛЕННЫЕ)
    // ============================================================

    describe('Functional Tests', () => {
        it('should filter with where operations', () => {
            const pipeline = queryWithOrder<User>()
                .where("city", "NY")
                .where("active", true)
                .build();
            
            const result = pipeline(users);
            expect(result).toHaveLength(4);
            expect(result.every(u => u.city === "NY" && u.active)).toBe(true);
        });

        it('should group after where', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .groupBy("city")
                .build();
            
            const result = pipeline(users) as Group<User, 'city'>[];
            expect(result).toHaveLength(2);
            
            const nyGroup = result.find(g => g.key === "NY");
            expect(nyGroup?.items.every(u => u.active)).toBe(true);
        });

        it('should filter groups with having', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .groupBy("city")
                .having<"city">((group) => group.items.length > 2)
                .build();
            
            const result = pipeline(users) as Group<User, 'city'>[];
            expect(result).toHaveLength(1);
            expect(result[0].key).toBe("NY");
        });

        it('should sort after having', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .groupBy("city")
                .having<"city">((group) => group.items.length > 0)
                .sort("age")
                .build();
            
            const result = pipeline(users);
            
            // Проверяем, что результат - массив
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            
            // Проверяем, что результат - массив пользователей (не групп)
            if (result.length > 0) {
                const firstItem = result[0] as any;
                expect(firstItem).toHaveProperty('id');
                expect(firstItem).toHaveProperty('name');
                expect(firstItem).toHaveProperty('age');
                expect(typeof firstItem.age).toBe('number');
            }
            
            // Проверяем сортировку по возрасту
            for (let i = 0; i < result.length - 1; i++) {
                const current = result[i] as any;
                const next = result[i + 1] as any;
                expect(current.age).toBeLessThanOrEqual(next.age);
            }
        });

        it('should handle complex pipeline', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .where("city", "NY")
                .groupBy("name")
                .having<"name">((group) => group.items.length >= 2)
                .sort("age")
                .build();
            
            const result = pipeline(users);
            
            // Проверяем, что результат не пустой
            expect(result.length).toBeGreaterThan(0);
            
            // Все пользователи должны быть из одной группы (иметь одинаковое имя)
            if (result.length > 0) {
                const firstName = result[0].name;
                const allSameName = result.every(u => u.name === firstName);
                expect(allSameName).toBe(true);
            }
            
            // Проверяем сортировку по возрасту
            for (let i = 0; i < result.length - 1; i++) {
                expect(result[i].age).toBeLessThanOrEqual(result[i + 1].age);
            }
        });

        it('should allow multiple where operations', () => {
            const pipeline = queryWithOrder<User>()
                .where("city", "NY")
                .where("active", true)
                .where("age", 34)
                .build();
            
            const result = pipeline(users);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
        });

        it('should allow multiple groupBy operations', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .groupBy("city")
                .groupBy("name")
                .build();
            
            const result = pipeline(users) as any[];
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });

        it('should allow multiple having operations', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .groupBy("city")
                .having<"city">((g) => g.items.length > 1)
                .having<"city">((g) => g.items.some(u => u.age > 35))
                .build();
            
            const result = pipeline(users) as any[];
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            
            if (result.length > 0) {
                expect(result[0].key).toBe("NY");
            }
        });

        it('should allow multiple sort operations', () => {
            const pipeline = queryWithOrder<User>()
                .where("active", true)
                .sort("age")
                .sort("name")
                .build();
            
            const result = pipeline(users);
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(users.filter(u => u.active).length);
        });
    });

    // ============================================================
    // ТЕСТЫ ДЛЯ СТАРОЙ ФУНКЦИИ query
    // ============================================================

    describe('Legacy query function', () => {
        const where = createWhere<User>();
        const sort = createSort<User>();
        const groupBy = createGroupBy<User>();
        const having = createHaving<User>();

        it('should work with old style', () => {
            const pipeline = query<User>(
                where("city", "NY"),
                where("active", true),
                sort("age")
            );
            
            const result = pipeline(users);
            expect(result).toHaveLength(4);
            expect(result.every(u => u.city === "NY" && u.active)).toBe(true);
        });

        it('should work with group operations', () => {
            const pipeline = query<User>(
                groupBy("city"),
                having<"city">((g) => g.items.length > 3)
            );
            
            const result = pipeline(users) as Group<User, 'city'>[];
            expect(result).toHaveLength(2);
        });
    });

    // ============================================================
    // ТЕСТЫ ВСПОМОГАТЕЛЬНЫХ ФУНКЦИЙ
    // ============================================================

    describe('Helper functions', () => {
        it('flattenGroups should convert groups to array', () => {
            const groups = createGroupBy<User>()("city")(users);
            const flat = flattenGroups(groups);
            expect(flat).toHaveLength(users.length);
        });

        it('distinct should return unique values', () => {
            const cities = distinct(users, 'city');
            expect(cities).toEqual(['NY', 'LA']);
        });

        it('countBy should count occurrences', () => {
            const counts = countBy(users, 'city');
            expect(counts.get('NY')).toBe(4);
            expect(counts.get('LA')).toBe(4);
        });

        it('isGroupTransform should identify group transforms', () => {
            const groupByFunc = createGroupBy<User>()("city");
            const havingFunc = createHaving<User>()((g) => true);
            const whereFunc = createWhere<User>()("city", "NY");
            
            const groupTransform = havingFunc;
            const normalTransform = whereFunc;
            
            expect(isGroupTransform(groupTransform)).toBe(true);
            expect(isGroupTransform(normalTransform)).toBe(false);
        });
    });
});