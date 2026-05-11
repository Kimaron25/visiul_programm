import { culculateFormula } from './parserFormul';  

export interface Cell {
    value: string;
    calculetade_value: any;
}

export type TableData = Record<string, Cell>;

export class SpreadSheet {
    private data: TableData = {};
    private rows: number;
    private cols: number;

    constructor(rows: number = 100, cols: number = 26){
        this.rows = rows;
        this.cols = cols;
    }

    getCell(row: number, col: number): Cell {
        const key = `${row}:${col}`;
        return this.data[key] || { value: '', calculetade_value: ''};
    }

    getDisplayValue(row: number, col: number): string {
        const cell = this.getCell(row, col);
        if (cell.calculetade_value !== undefined && cell.calculetade_value !== '') {
        return String(cell.calculetade_value);
    }
        return '';
    }

        private recalculateAll(): void {
        
        const formulaCells: { row: number; col: number; formula: string }[] = [];
        
        for (const [key, cell] of Object.entries(this.data)) {
            if (cell.value.startsWith('=')) {
                const [rowStr, colStr] = key.split(':');
                formulaCells.push({
                    row: parseInt(rowStr),
                    col: parseInt(colStr),
                    formula: cell.value.substring(1)
                });
            }
        }
        
        
        for (const { row, col, formula } of formulaCells) {
            const computedValue = culculateFormula(formula, (r, c) => {
                return this.getCell(r, c).calculetade_value;
            });
            
            const key = `${row}:${col}`;
            this.data[key] = {
                ...this.data[key],
                calculetade_value: computedValue
            };
        }
    }

    setCell(row: number, col: number, value: string): void {
        const key = `${row}:${col}`;
        
        if (value === '') {
            delete this.data[key];
            this.recalculateAll();
            return;
        }
        
        const isFormula = value.startsWith('=');
        let calculetade_value: any = value;
        
        if (isFormula) {
            const formula = value.substring(1);
            calculetade_value = culculateFormula(formula, (r, c) => {
                return this.getCell(r, c).calculetade_value;
            });
        } else {
            const num = parseFloat(value);
            if (!isNaN(num) && value.trim() !== '') {
                calculetade_value = num;
            } else if (value.toLowerCase() === 'true') {
                calculetade_value = true;
            } else if (value.toLowerCase() === 'false') {
                calculetade_value = false;
            } else {
                calculetade_value = value;
            }
        }
        
        this.data[key] = { value, calculetade_value };
        this.recalculateAll();
    }


    getAllData(): TableData {
        return { ...this.data}; 
    }

    loadData(data: TableData): void {
        this.data = { ...data };
    }

    addRow(current_index: number): void {
        this.rows++;
        const new_data: TableData = {};

        for(const [key, cell] of Object.entries(this.data)) { 
            const [row_str, col_str] = key.split(":");
            let row = parseInt(row_str);
            const col = parseInt(col_str);

            if (row >= current_index) {
                row++;
            }
            new_data[`${row}:${col}`] = cell;
        }
        this.data = new_data;
    }
    addCol(current_index: number): void {
        this.cols++;
        const new_data: TableData = {};

        for(const [key, cell] of Object.entries(this.data)) {
            const [row_str, col_str] = key.split(":");
            const row = parseInt(row_str);
            let col = parseInt(col_str);

            if (col >= current_index) {
                col++;
            }
            new_data[`${row}:${col}`] = cell;
        }
        this.data = new_data;
    }

    getRowCount() :number {
        return this.rows;
    }
    getColCount() :number {
        return this.cols;
    }

    deleteRow(rowIndex: number): void {
        if (this.rows <= 1) return;
        
        this.rows--;
        const newData: TableData = {};
        
        for (const [key, cell] of Object.entries(this.data)) {
            const [rowStr, colStr] = key.split(':');
            let row = parseInt(rowStr);
            const col = parseInt(colStr);
            
            if (row === rowIndex) continue;
            if (row > rowIndex) row--;
            newData[`${row}:${col}`] = cell;
        }
        
        this.data = newData;
        this.recalculateAll();
    }

    deleteCol(colIndex: number): void {
        if (this.cols <= 1) return;
        
        this.cols--;
        const newData: TableData = {};
        
        for (const [key, cell] of Object.entries(this.data)) {
            const [rowStr, colStr] = key.split(':');
            const row = parseInt(rowStr);
            let col = parseInt(colStr);
            
            if (col === colIndex) continue;
            if (col > colIndex) col--;
            newData[`${row}:${col}`] = cell;
        }
        
        this.data = newData;
        this.recalculateAll();
    }

    getRawValue(row: number, col: number): string {
        return this.getCell(row, col).value;
    }
}