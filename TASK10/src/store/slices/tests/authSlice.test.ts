import { describe, it, expect } from 'vitest';
import authReducer, { setUser, setLoading, setError, logout } from '../authSlice';

describe('authSlice', () => {
    const initialState = {
        user: {
            id: 'mock_user_1',
            name: 'Тестовый Пользователь',
            email: 'test@example.com',
        },
        isAuthenticated: true,
        loading: false,
        error: null,
    };

    it('должен возвращать начальное состояние', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('должен обрабатывать setUser', () => {
        const newUser = { id: '2', name: 'Новый', email: 'new@test.com' };
        const actual = authReducer(initialState, setUser(newUser));
        expect(actual.user).toEqual(newUser);
        expect(actual.isAuthenticated).toBe(true);
    });

    it('должен обрабатывать setUser с null (выход)', () => {
        const actual = authReducer(initialState, setUser(null));
        expect(actual.user).toBe(null);
        expect(actual.isAuthenticated).toBe(false);
    });

    it('должен обрабатывать logout', () => {
        const actual = authReducer(initialState, logout());
        expect(actual.user).toBe(null);
        expect(actual.isAuthenticated).toBe(false);
    });

    it('должен обрабатывать setLoading', () => {
        const actual = authReducer(initialState, setLoading(true));
        expect(actual.loading).toBe(true);
    });

    it('должен обрабатывать setError', () => {
        const actual = authReducer(initialState, setError('Ошибка авторизации'));
        expect(actual.error).toBe('Ошибка авторизации');
    });
});