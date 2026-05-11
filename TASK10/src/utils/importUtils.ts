import {type TableData } from '../lib/spreadsheet';
export const parseCSV = (csvText: string): { data: TableData; rows: number; cols: number } => {
    const lines = csvText.split(/\r?\n/);
    const matrix: string[][] = lines.map(line => {
        const row: string[] = [];
        let inQuotes = false;
        let currentCell= '';
        for (let i = 0; i<line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentCell);
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        row.push(currentCell);
        return row;
    });
    const rows = matrix.length;
    const cols = Math.max(...matrix.map(row => row.length));
    const data: TableData = {};
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            const value = matrix[row][col];
            if (value !== '') {
                data[`${row}:${col}`] = { value, calculetade_value: value };
            }
        }
    }
    return {data,rows,cols };
};
