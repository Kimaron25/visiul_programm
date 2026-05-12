import { describe, it, expect } from 'vitest';
import spreadsheetReducer, { 
    setData, 
    setCellValue, 
    setRows, 
    setCols, 
    setSelectedCell,
    importData,
    undo,
    redo
} from '../spreadsheetSlice';

describe('spreadsheetSlice', () => {
    const initialState = {
        data: {},
        rows: 100,
        cols: 26,
        selectedCell: null,
        editingCell: null,
        editValue: '',
        history: {
            past: [],
            present: null,
            future: [],
        },
    };

    it('should handle initial state', () => {
        expect(spreadsheetReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setRows', () => {
        const actual = spreadsheetReducer(initialState, setRows(200));
        expect(actual.rows).toBe(200);
    });

    it('should handle setCols', () => {
        const actual = spreadsheetReducer(initialState, setCols(50));
        expect(actual.cols).toBe(50);
    });

    it('should handle setData', () => {
        const testData = { '0:0': { value: 'test', calculetade_value: 'test' } };
        const actual = spreadsheetReducer(initialState, setData(testData));
        expect(actual.data).toEqual(testData);
    });

    it('should handle setCellValue', () => {
        const actual = spreadsheetReducer(initialState, setCellValue({
            row: 0,
            col: 0,
            value: '42',
            computedValue: 42
        }));
        expect(actual.data['0:0']).toEqual({ value: '42', calculetade_value: 42 });
    });

    it('should handle setSelectedCell', () => {
        const actual = spreadsheetReducer(initialState, setSelectedCell({ row: 5, col: 3 }));
        expect(actual.selectedCell).toEqual({ row: 5, col: 3 });
    });

    it('should handle importData', () => {
        const testData = { '1:1': { value: 'import', calculetade_value: 'import' } };
        const actual = spreadsheetReducer(initialState, importData({
            data: testData,
            rows: 50,
            cols: 20
        }));
        expect(actual.data).toEqual(testData);
        expect(actual.rows).toBe(50);
        expect(actual.cols).toBe(20);
    });
});