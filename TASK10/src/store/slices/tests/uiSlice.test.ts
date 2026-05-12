import { describe, it, expect } from 'vitest';
import uiReducer, { 
    setCreateModalOpen, 
    setSaveStatus, 
    setNotification, 
    clearNotification 
} from '../uiSlice';

describe('uiSlice', () => {
    const initialState = {
        isCreateModalOpen: false,
        saveStatus: 'idle' as const,
        notification: null,
    };

    it('should handle initial state', () => {
        expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setCreateModalOpen', () => {
        const actual = uiReducer(initialState, setCreateModalOpen(true));
        expect(actual.isCreateModalOpen).toBe(true);
    });

    it('should handle setSaveStatus', () => {
        const actual = uiReducer(initialState, setSaveStatus('saving'));
        expect(actual.saveStatus).toBe('saving');
    });

    it('should handle setNotification', () => {
        const actual = uiReducer(initialState, setNotification('Тестовое уведомление'));
        expect(actual.notification).toBe('Тестовое уведомление');
    });

    it('should handle clearNotification', () => {
        const stateWithNotification = { ...initialState, notification: 'Тест' };
        const actual = uiReducer(stateWithNotification, clearNotification());
        expect(actual.notification).toBe(null);
    });
});