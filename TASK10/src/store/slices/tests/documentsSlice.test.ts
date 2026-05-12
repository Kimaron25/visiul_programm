import { describe, it, expect } from 'vitest';
import documentsReducer, { 
    setCurrentDocumentId, 
    setCurrentDocumentData, 
    clearCurrentDocument 
} from '../documentsSlice';

describe('documentsSlice', () => {
    const initialState = {
        list: [],
        currentDocumentId: null,
        currentDocumentData: {},
        loading: false,
        error: null,
    };

    it('should handle initial state', () => {
        expect(documentsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setCurrentDocumentId', () => {
        const actual = documentsReducer(initialState, setCurrentDocumentId('doc123'));
        expect(actual.currentDocumentId).toBe('doc123');
    });

    it('should handle setCurrentDocumentData', () => {
        const testData = { key: 'value' };
        const actual = documentsReducer(initialState, setCurrentDocumentData(testData));
        expect(actual.currentDocumentData).toEqual(testData);
    });

    it('should handle clearCurrentDocument', () => {
        const stateWithDoc = {
            ...initialState,
            currentDocumentId: 'doc123',
            currentDocumentData: { some: 'data' }
        };
        const actual = documentsReducer(stateWithDoc, clearCurrentDocument());
        expect(actual.currentDocumentId).toBe(null);
        expect(actual.currentDocumentData).toEqual({});
    });
});