import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TableData } from "../../lib/spreadsheet";
import { numberToCol } from "../../lib/parserFormul";

interface HistoryState {
    past: TableData[];
    present: TableData |null;
    future: TableData[];
}
interface SpreadsheetState {
    data: TableData;
    rows: number;
    cols: number;
    selectedCell: { row: number; col : number} |null;
    editingCell: { row:number; col: number} | null;
    editValue:string;
    history:HistoryState;
}
const initialState: SpreadsheetState = {
    data: {},
    rows: 100,
    cols:26,
    selectedCell: null,
    editingCell: null,
    editValue: '',
    history: {
        past: [],
        present: null,
        future:[],
    },
};

const spreadsheetSlice = createSlice({
    name: 'spreadsheet',
    initialState,
    reducers: {
        saveToHistory: (state) => {
            if(state.history.present){
                state.history.past.push(state.history.present);
            }
            state.history.present = {...state.data};
            state.history.future = [];
        },
        setData: (state, action:PayloadAction<TableData>) =>{
            if(state.history.present) {
                state.history.past.push(state.history.present);
            }
            state.history.present = {...action.payload};
            state.history.future = [];
            state.data = action.payload;
        },
        setCellValue: (state, action: PayloadAction<{row: number; col: number; value: string; computedValue:any}>) => {
            const { row, col, value, computedValue } = action.payload;
            const key = `${row}:${col}`;
            if(state.history.present) {
                state.history.past.push(state.history.present);
            }
            state.data[key] = { value, calculetade_value: computedValue };
            state.history.present = {...state.data};
            state.history.future = [];
        },
        undo: (state) => {
            const previous = state.history.past.pop();
            if(previous) {
                state.history.future.push(state.history.present!);
                state.history.present = previous;
                state.data = previous;
            }
        },

        redo: (state) => {
            const next = state.history.future.pop();
            if(next) {
                state.history.past.push(state.history.present!);
                state.history.present = next;
                state.data = next;
            }
        },
        setRows: (state, action: PayloadAction<number>)=> {
            state.rows = action.payload;
        },
        setCols: (state, action: PayloadAction<number>)=> {
            state.cols = action.payload;
        },
        setSelectedCell: (state, action: PayloadAction<{ row:number; col: number} | null>) => {
            state.selectedCell = action.payload;
        },
        setEditingCell : (state,action: PayloadAction<{row:number; col:number} |null>) => {
            state.editingCell = action.payload;
        },
        setEditValue: (state, action:PayloadAction<string>) => {
            state.editValue = action.payload;
        },
        clearEditing: (state) => {
            state.editingCell = null;
            state.editValue = '';
        },
        importData: (state, action: PayloadAction<{data: TableData; rows: number; cols: number}>)=> {
            state.history = {
                past: [],
                present: action.payload.data,
                future: [],
            };
            state.data = action.payload.data;
            state.cols = action.payload.cols;
            state.rows = action.payload.rows;
        },
    },
});
export const {
    setData,
    setCellValue,
    setRows,
    setCols,
    setSelectedCell,
    setEditingCell,
    setEditValue,
    clearEditing,
    importData,
    undo,
    redo,
    saveToHistory,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;