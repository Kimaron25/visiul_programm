import { type TableData } from '../lib/spreadsheet';

export const exportToCSV = (data: TableData, rows: number, cols: number) => {
    const matrix: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
    for (const [key, cell] of Object.entries(data)) {
        const [rowStr, colStr] = key.split(':');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
        if (row < rows && col < cols && cell.calculetade_value !== undefined && cell.calculetade_value !== '') {
            matrix[row][col] = String(cell.calculetade_value);
        }
    }
    const csvRows = matrix.map(row => 
        row.map(cell => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    );
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `spreadsheet_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};
export const exportToJSON = (data: TableData) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `spreadsheet_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
};
