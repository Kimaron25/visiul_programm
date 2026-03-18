import { describe, it, expect, expectTypeOf } from 'vitest';
import {
    DeepReadonly,
    PickedByType,
    EventHandlers,
    DeepPartial,
    DeepRequired,
    NonNullableDeep,
    ValueOf,
    WithRequired,
    WithOptional
} from './utility-types';

describe('Utility Types', () => {
    // ============================================================
    // Тесты для DeepReadonly
    // ============================================================
    
    describe('DeepReadonly', () => {
        it('should make all properties readonly', () => {
            type User = {
                id: number;
                name: string;
                age: number;
            };
            
            type ReadonlyUser = DeepReadonly<User>;
            
            // Проверяем, что все свойства readonly
            expectTypeOf<ReadonlyUser>().toMatchTypeOf<{
                readonly id: number;
                readonly name: string;
                readonly age: number;
            }>();
        });

        it('should work recursively with nested objects', () => {
            type User = {
                id: number;
                name: string;
                address: {
                    city: string;
                    street: string;
                    coordinates: {
                        lat: number;
                        lng: number;
                    };
                };
            };
            
            type ReadonlyUser = DeepReadonly<User>;
            
            // Проверяем верхний уровень
            expectTypeOf<ReadonlyUser>().toMatchTypeOf<{
                readonly id: number;
                readonly name: string;
                readonly address: {
                    readonly city: string;
                    readonly street: string;
                    readonly coordinates: {
                        readonly lat: number;
                        readonly lng: number;
                    };
                };
            }>();
            
            // Проверяем, что address стал readonly
            type AddressType = ReadonlyUser['address'];
            expectTypeOf<AddressType>().toMatchTypeOf<{
                readonly city: string;
                readonly street: string;
                readonly coordinates: {
                    readonly lat: number;
                    readonly lng: number;
                };
            }>();
            
            // Проверяем, что coordinates стал readonly
            type CoordinatesType = ReadonlyUser['address']['coordinates'];
            expectTypeOf<CoordinatesType>().toMatchTypeOf<{
                readonly lat: number;
                readonly lng: number;
            }>();
        });

        it('should handle arrays', () => {
            type User = {
                id: number;
                tags: string[];
                friends: {
                    name: string;
                }[];
            };
            
            type ReadonlyUser = DeepReadonly<User>;
            
            // Массивы в TypeScript уже имеют readonly варианты
            expectTypeOf<ReadonlyUser>().toMatchTypeOf<{
                readonly id: number;
                readonly tags: readonly string[];
                readonly friends: readonly {
                    readonly name: string;
                }[];
            }>();
        });

        it('should handle primitive types', () => {
            type Primitive = {
                str: string;
                num: number;
                bool: boolean;
                sym: symbol;
                nil: null;
                undef: undefined;
            };
            
            type ReadonlyPrimitive = DeepReadonly<Primitive>;
            
            expectTypeOf<ReadonlyPrimitive>().toMatchTypeOf<{
                readonly str: string;
                readonly num: number;
                readonly bool: boolean;
                readonly sym: symbol;
                readonly nil: null;
                readonly undef: undefined;
            }>();
        });

        it('should handle union types', () => {
            type User = {
                id: number;
                status: 'active' | 'inactive' | 'pending';
            };
            
            type ReadonlyUser = DeepReadonly<User>;
            
            expectTypeOf<ReadonlyUser>().toMatchTypeOf<{
                readonly id: number;
                readonly status: 'active' | 'inactive' | 'pending';
            }>();
        });

        it('should work with function types (should not affect functions deeply)', () => {
            type User = {
                id: number;
                getName: () => string;
                getAge: () => number;
            };
            
            type ReadonlyUser = DeepReadonly<User>;
            
            // Функции не становятся readonly глубоко, только само свойство
            expectTypeOf<ReadonlyUser>().toMatchTypeOf<{
                readonly id: number;
                readonly getName: () => string;
                readonly getAge: () => number;
            }>();
        });
    });

    // ============================================================
    // Тесты для PickedByType
    // ============================================================
    
    describe('PickedByType', () => {
        it('should pick properties of specific type', () => {
            type User = {
                id: number;
                name: string;
                age: number;
                email: string;
                active: boolean;
            };
            
            type NumberProps = PickedByType<User, number>;
            type StringProps = PickedByType<User, string>;
            type BooleanProps = PickedByType<User, boolean>;
            
            expectTypeOf<NumberProps>().toMatchTypeOf<{
                id: number;
                age: number;
            }>();
            
            expectTypeOf<StringProps>().toMatchTypeOf<{
                name: string;
                email: string;
            }>();
            
            expectTypeOf<BooleanProps>().toMatchTypeOf<{
                active: boolean;
            }>();
        });

        it('should return empty object if no properties of given type', () => {
            type User = {
                id: number;
                name: string;
                age: number;
            };
            
            type BooleanProps = PickedByType<User, boolean>;
            
            expectTypeOf<BooleanProps>().toMatchTypeOf<{}>();
        });

        it('should handle union types', () => {
            type User = {
                id: number;
                status: 'active' | 'inactive';
                data: string | null;
            };
            
            type StringProps = PickedByType<User, string>;
            type NumberProps = PickedByType<User, number>;
            type NullProps = PickedByType<User, null>;
            
            expectTypeOf<StringProps>().toMatchTypeOf<{
                status: 'active' | 'inactive';
                data: string | null;
            }>();
            
            expectTypeOf<NumberProps>().toMatchTypeOf<{
                id: number;
            }>();
            
            expectTypeOf<NullProps>().toMatchTypeOf<{
                data: string | null;
            }>();
        });

        it('should handle optional properties', () => {
            type User = {
                id: number;
                name?: string;
                age?: number;
                email: string;
            };
            
            type NumberProps = PickedByType<User, number>;
            type StringProps = PickedByType<User, string>;
            
            expectTypeOf<NumberProps>().toMatchTypeOf<{
                id: number;
                age?: number;
            }>();
            
            expectTypeOf<StringProps>().toMatchTypeOf<{
                name?: string;
                email: string;
            }>();
        });

        it('should handle readonly properties', () => {
            type User = {
                readonly id: number;
                readonly name: string;
                age: number;
            };
            
            type NumberProps = PickedByType<User, number>;
            
            expectTypeOf<NumberProps>().toMatchTypeOf<{
                readonly id: number;
                age: number;
            }>();
        });

        it('should work with complex types', () => {
            type Address = {
                city: string;
                zip: number;
            };
            
            type User = {
                id: number;
                name: string;
                address: Address;
                metadata: Record<string, unknown>;
            };
            
            type ObjectProps = PickedByType<User, object>;
            type NumberProps = PickedByType<User, number>;
            type StringProps = PickedByType<User, string>;
            
            expectTypeOf<ObjectProps>().toMatchTypeOf<{
                address: Address;
                metadata: Record<string, unknown>;
            }>();
            
            expectTypeOf<NumberProps>().toMatchTypeOf<{
                id: number;
            }>();
            
            expectTypeOf<StringProps>().toMatchTypeOf<{
                name: string;
            }>();
        });
    });

    // ============================================================
    // Тесты для EventHandlers
    // ============================================================
    
    describe('EventHandlers', () => {
        it('should convert event types to onEvent handlers', () => {
            type Events = {
                click: MouseEvent;
                scroll: UIEvent;
                keydown: KeyboardEvent;
            };
            
            type Handlers = EventHandlers<Events>;
            
            expectTypeOf<Handlers>().toMatchTypeOf<{
                onClick: (event: MouseEvent) => void;
                onScroll: (event: UIEvent) => void;
                onKeydown: (event: KeyboardEvent) => void;
            }>();
        });

        it('should handle single event', () => {
            type Events = {
                change: Event;
            };
            
            type Handlers = EventHandlers<Events>;
            
            expectTypeOf<Handlers>().toMatchTypeOf<{
                onChange: (event: Event) => void;
            }>();
        });

        it('should handle empty events object', () => {
            type Events = {};
            
            type Handlers = EventHandlers<Events>;
            
            expectTypeOf<Handlers>().toMatchTypeOf<{}>();
        });

        it('should handle events with custom types', () => {
            interface CustomEvent<T> {
                type: string;
                payload: T;
            }
            
            type Events = {
                userLogin: CustomEvent<{ userId: number }>;
                userLogout: CustomEvent<{ userId: number }>;
                dataUpdate: CustomEvent<{ data: string[] }>;
            };
            
            type Handlers = EventHandlers<Events>;
            
            expectTypeOf<Handlers>().toMatchTypeOf<{
                onUserLogin: (event: CustomEvent<{ userId: number }>) => void;
                onUserLogout: (event: CustomEvent<{ userId: number }>) => void;
                onDataUpdate: (event: CustomEvent<{ data: string[] }>) => void;
            }>();
        });

        it('should capitalize event names correctly', () => {
            type Events = {
                mouseenter: MouseEvent;
                mouseleave: MouseEvent;
                domcontentloaded: Event;
                'custom-event': CustomEvent;
            };
            
            type Handlers = EventHandlers<Events>;
            
            expectTypeOf<Handlers>().toMatchTypeOf<{
                onMouseenter: (event: MouseEvent) => void;
                onMouseleave: (event: MouseEvent) => void;
                onDomcontentloaded: (event: Event) => void;
            }>();
            
            // Свойства с дефисами не преобразуются (не валидные имена)
            type HasCustomEvent = 'onCustom-event' extends keyof Handlers ? true : false;
            expectTypeOf<HasCustomEvent>().toMatchTypeOf<false>();
        });

        it('should work with DOM event types', () => {
            type DOMEvents = {
                click: MouseEvent;
                dblclick: MouseEvent;
                mousedown: MouseEvent;
                mouseup: MouseEvent;
                mousemove: MouseEvent;
                keydown: KeyboardEvent;
                keyup: KeyboardEvent;
                keypress: KeyboardEvent;
                submit: Event;
                reset: Event;
                focus: FocusEvent;
                blur: FocusEvent;
                load: Event;
                unload: Event;
                resize: UIEvent;
                scroll: UIEvent;
            };
            
            type DOMHandlers = EventHandlers<DOMEvents>;
            
            // Проверяем несколько ключевых
            expectTypeOf<DOMHandlers>().toHaveProperty('onClick');
            expectTypeOf<DOMHandlers>().toHaveProperty('onKeydown');
            expectTypeOf<DOMHandlers>().toHaveProperty('onSubmit');
            expectTypeOf<DOMHandlers>().toHaveProperty('onFocus');
            expectTypeOf<DOMHandlers>().toHaveProperty('onLoad');
            expectTypeOf<DOMHandlers>().toHaveProperty('onResize');
        });

        it('should preserve the event type in handler parameter', () => {
            type Events = {
                click: MouseEvent;
                input: InputEvent;
            };
            
            type Handlers = EventHandlers<Events>;
            
            // @ts-expect-error - проверяем, что тип параметра правильный
            const wrongHandler: Handlers['onClick'] = (event: string) => {};
            
            // Правильный тип
            const correctHandler: Handlers['onClick'] = (event: MouseEvent) => {};
            expect(correctHandler).toBeDefined();
        });
    });

    // ============================================================
    // Тесты для дополнительных утилитарных типов
    // ============================================================
    
    describe('Additional Utility Types', () => {
        describe('DeepPartial', () => {
            it('should make all properties optional recursively', () => {
                type User = {
                    id: number;
                    name: string;
                    address: {
                        city: string;
                        street: string;
                    };
                };
                
                type PartialUser = DeepPartial<User>;
                
                expectTypeOf<PartialUser>().toMatchTypeOf<{
                    id?: number;
                    name?: string;
                    address?: {
                        city?: string;
                        street?: string;
                    };
                }>();
            });
        });

        describe('DeepRequired', () => {
            it('should make all properties required recursively', () => {
                type User = {
                    id?: number;
                    name?: string;
                    address?: {
                        city?: string;
                        street?: string;
                    };
                };
                
                type RequiredUser = DeepRequired<User>;
                
                expectTypeOf<RequiredUser>().toMatchTypeOf<{
                    id: number;
                    name: string;
                    address: {
                        city: string;
                        street: string;
                    };
                }>();
            });
        });

        describe('NonNullableDeep', () => {
            it('should remove null and undefined recursively', () => {
                type User = {
                    id: number | null;
                    name: string | undefined;
                    address: {
                        city: string | null;
                        street: string | undefined;
                    } | null;
                };
                
                type CleanUser = NonNullableDeep<User>;
                
                expectTypeOf<CleanUser>().toMatchTypeOf<{
                    id: number;
                    name: string;
                    address: {
                        city: string;
                        street: string;
                    };
                }>();
            });
        });

        describe('ValueOf', () => {
            it('should get union of all value types', () => {
                type User = {
                    id: number;
                    name: string;
                    age: number;
                };
                
                type UserValues = ValueOf<User>;
                
                expectTypeOf<UserValues>().toMatchTypeOf<number | string>();
            });
        });

        describe('WithRequired', () => {
            it('should make specific keys required', () => {
                type User = {
                    id?: number;
                    name?: string;
                    age?: number;
                };
                
                type UserWithRequiredId = WithRequired<User, 'id'>;
                
                expectTypeOf<UserWithRequiredId>().toMatchTypeOf<{
                    id: number;
                    name?: string;
                    age?: number;
                }>();
            });
        });

        describe('WithOptional', () => {
            it('should make specific keys optional', () => {
                type User = {
                    id: number;
                    name: string;
                    age: number;
                };
                
                type UserWithOptionalAge = WithOptional<User, 'age'>;
                
                expectTypeOf<UserWithOptionalAge>().toMatchTypeOf<{
                    id: number;
                    name: string;
                    age?: number;
                }>();
            });
        });
    });

    // ============================================================
    // Интеграционные тесты (использование всех типов вместе)
    // ============================================================
    
    describe('Integration Tests', () => {
        it('should combine multiple utility types', () => {
            // Сложный сценарий: конфигурация приложения
            interface AppConfig {
                api: {
                    url: string;
                    timeout: number;
                    retries: number;
                    headers: Record<string, string>;
                };
                features: {
                    darkMode: boolean;
                    notifications: boolean;
                };
                events: {
                    click: MouseEvent;
                    scroll: UIEvent;
                    keydown: KeyboardEvent;
                };
            }
            
            // Делаем все readonly
            type ReadonlyConfig = DeepReadonly<AppConfig>;
            
            // Выбираем только числовые свойства
            type NumberProps = PickedByType<AppConfig, number>;
            
            // Создаем обработчики событий
            type EventHandlersConfig = EventHandlers<AppConfig['events']>;
            
            // Проверяем
            expectTypeOf<ReadonlyConfig>().toHaveProperty('api');
            expectTypeOf<NumberProps>().toMatchTypeOf<{
                timeout: number;
                retries: number;
            }>();
            expectTypeOf<EventHandlersConfig>().toHaveProperty('onClick');
            expectTypeOf<EventHandlersConfig>().toHaveProperty('onScroll');
            expectTypeOf<EventHandlersConfig>().toHaveProperty('onKeydown');
        });

        it('should work with real-world example', () => {
            // Пример из React-подобного компонента
            interface ComponentProps {
                id: string;
                className?: string;
                style?: React.CSSProperties;
                children?: React.ReactNode;
                onClick: (e: MouseEvent) => void;
                onDoubleClick: (e: MouseEvent) => void;
                data: {
                    userId: number;
                    userName: string;
                    metadata: Record<string, unknown>;
                };
            }
            
            // Тип для мемоизации компонента (все пропсы readonly)
            type MemoizedProps = DeepReadonly<ComponentProps>;
            
            // Тип для событий
            type ComponentEvents = Pick<ComponentProps, 'onClick' | 'onDoubleClick'>;
            type EventHandlersType = EventHandlers<{
                click: Parameters<ComponentProps['onClick']>[0];
                doubleClick: Parameters<ComponentProps['onDoubleClick']>[0];
            }>;
            
            // Тип для числовых свойств в data
            type DataNumberProps = PickedByType<ComponentProps['data'], number>;
            
            expectTypeOf<MemoizedProps>().toHaveProperty('id');
            expectTypeOf<EventHandlersType>().toHaveProperty('onClick');
            expectTypeOf<EventHandlersType>().toHaveProperty('onDoubleClick');
            expectTypeOf<DataNumberProps>().toMatchTypeOf<{
                userId: number;
            }>();
        });
    });
});