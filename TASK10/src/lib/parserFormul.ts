type Token = 
    | { type: 'NUMBER'; value: number}
    | { type: 'OPERATOR'; value: '+' | '-' | '*' | '/'}
    | { type: 'FUNCTION'; name: string; range: { start: { row: number; col: number }; end: { row: number; col: number } } }
    | { type: 'CELL'; row: number; col:number}
    | { type: 'PAREN'; value: '(' | ')'};



export function colToNumber(colStr: string) : number {
    let result = 0;
    for (let i = 0; i< colStr.length; i++){
        result = result * 26 + (colStr.charCodeAt(i) - 64);
    }
    return result - 1;
}

export function numberToCol (num:number): string {
    let result = '';
    num = num + 1;
    while (num > 0) {
        num--;
        result = String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26);
    }
    return result;
}

function parseCellRef(ref: string) : {row :number; col: number } | null {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const colStr = match[1];
    const rowNum = parseInt(match[2], 10);
    return {
        col: colToNumber(colStr),
        row: rowNum -1
    };
}

function parseRange( range: string) : { start: {row: number, col: number }; end : {row: number; col: number}}| null {
    const [startRef, endRef] = range.split(':');
    const start = parseCellRef(startRef);
    const end = parseCellRef(endRef);

    if(!start || !end) return null;
    return {
        start: {row: start.row, col: start.col},
        end: { row:end.row , col:end.col}
    };
}

export function culculateFormula(formula:string, getCellValue: (row: number, col:number) => any) : any {
    const expr = formula.trim();
    const simpleOpMatch = expr.match(/^([A-Z]+\d+|\d+)\s*([+\-*/])\s*([A-Z]+\d+|\d+)$/i);
    if(simpleOpMatch) {
        const left = simpleOpMatch[1];
        const operator = simpleOpMatch[2];
        const right = simpleOpMatch[3];

        let leftValue: number;
        let rightValue: number;

        if (left.match(/^[A-Z]+\d+$/i)) {
            const ref = parseCellRef(left);
            if (ref) leftValue = Number(getCellValue(ref.row, ref.col)) || 0;
            else leftValue = 0;
        } else{
            leftValue = parseFloat(left);
        }

        if(right.match(/^[A-Z]+\d+$/i)) {
            const ref = parseCellRef(right);
            if (ref) rightValue = Number(getCellValue(ref.row, ref.col)) || 0;
            else rightValue = 0;
        } else {
            rightValue = parseFloat(right);
        }
            
        switch(operator) {
            case '+': return leftValue + rightValue;
            case '-': return leftValue - rightValue;
            case '*': return leftValue * rightValue;
            case '/': return rightValue !== 0 ? leftValue / rightValue : 'Ошибка: деление на ноль';
            default: return 'Ошибка: неизвестный оператор';
        }
    }

    const funcMatch  = expr.match(/^(SUM|AVERAGE)\(([A-Z]+\d+:[A-Z]+\d+)\)$/i);
    if ( funcMatch) {
        const funcName = funcMatch[1].toUpperCase();
        const range = funcMatch[2];
        const parsedRange = parseRange(range);

        if(!parsedRange) return 'Ошибка: неверный диапозон';
        const values: number[] = [];

        for (let row = parsedRange.start.row; row <= parsedRange.end.row; row++) {
            for (let col = parsedRange.start.col; col <= parsedRange.end.col; col++) {
                const val = Number(getCellValue(row, col));
                if (!isNaN(val)) {
                values.push(val);
                }
            }
        }      
        if(funcName === 'SUM') {
            return values.reduce((sum,val) => sum +val, 0);
        }   else if( funcName === 'AVERAGE'){
            if(values.length === 0) return 0;
            const sum = values.reduce((s,v) => s + v, 0);
            return sum / values.length;
        }
    }
    try {
        let evalExpr = expr;
        const cellRefs = evalExpr.match(/[A-Z]+\d+/gi);

        if(cellRefs) {
            for(const ref of cellRefs){
                const coords = parseCellRef(ref);
                if(coords) {
                    const value = getCellValue(coords.row,coords.col);
                    evalExpr = evalExpr.replace(ref,String(value));
                }
            }
        }
    const result = Function('"use strict"; return (' + evalExpr + ')')();
    return isNaN(result) ? evalExpr : result;
    } catch {
        return 'Ошибка формулы';
    }
}