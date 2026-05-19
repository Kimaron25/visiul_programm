import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { SpreadSheet, type TableData } from '../../lib/spreadsheet';
import ContextMenu from './ContextMenu';
import './Spreadsheet.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    setCellValue, 
    setRows, 
    setCols, 
    setSelectedCell, 
    setEditingCell, 
    setEditValue,
    clearEditing,
    importData ,
    updateCellStyle 
} from '../../store/slices/spreadsheetSlice';
import { setNotification } from '../../store/slices/uiSlice';
import { undo, redo } from '../../store/slices/spreadsheetSlice';

interface SpreadSheetProps {
    rows?: number;
    cols?: number;
    initialData?: TableData;
    on_data_change?: (data: TableData) => void;
    on_cell_select?: (row: number, col: number, value: string) => void;
}

const ROW_HEIGHT = 30;
const BUFFER_SIZE = 5;

const Spreadsheet: React.FC<SpreadSheetProps> = ({ rows = 100, cols = 26, initialData,on_data_change, on_cell_select  }) => {
    const dispatch = useAppDispatch();
    const { data: tableData , rows: storeRows, cols: storeCols} = useAppSelector(state => state.spreadsheet);
    const [model] = useState(() => {
        const newModel = new SpreadSheet(rows, cols);
        if (initialData && Object.keys(initialData).length > 0) {
            newModel.loadData(initialData);
        }
        return newModel;
    });

    const [selected_cell, set_selected_cell] = useState<{ row: number; col: number } | null>(null);
    const [editing_cell, set_editing_cell] = useState<{ row: number; col: number } | null>(null);
    const [edit_value, set_edit_value] = useState('');
    const [force_update, set_force_update] = useState(0);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const bodyRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>(() => {
        const widths: Record<number, number> = {};
        for (let i = 0; i < 26; i++) {
            widths[i] = 100;
        }
        return widths;
    });
    const [resizingColumn, setResizingColumn] = useState<{ index: number; startX: number; startWidth: number } | null>(null);
    const [rangeVersion, setRangeVersion] = useState(0);
    const [anchorCell, setAnchorCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedRange, setSelectedRange] = useState<{ start: { row: number; col: number }; end: { row: number; col: number } } | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const visibleRange = useMemo(() => {
        const scrollContainer = bodyRef.current;
        const containerHeight = scrollContainer?.clientHeight || 600;
        
        const startIndex = Math.max(0, Math.floor(scrollTop /ROW_HEIGHT)-BUFFER_SIZE);
        const endIndex = Math.min(
            model.getRowCount(),
            Math.ceil((scrollTop + containerHeight) /ROW_HEIGHT) + BUFFER_SIZE
        );
        return { startIndex, endIndex };
    },[scrollTop,model.getRowCount(), rangeVersion]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }
        };
        
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    const handleBodyScroll=useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollTop } = e.currentTarget;
        setScrollTop(scrollTop);
        if (headerRef.current) {
            headerRef.current.scrollLeft = scrollLeft;
        }
    }, []);

    const refresh = useCallback(() => {
        set_force_update(prev => prev + 1);
    }, []);

    const handleCellChange = useCallback((row: number, col: number, value: string) => {
        model.setCell(row, col, value);
        refresh();
        const cell = model.getCell (row,col);
        dispatch(setCellValue({row, col, value: cell.value, computedValue: cell.calculetade_value}));
        if (on_data_change) {
            on_data_change(model.getAllData());
        }
    }, [model, refresh, on_data_change, dispatch]);

    const startEditing = useCallback((row: number, col: number, curren_value: string) => {
        set_editing_cell({ row, col });
        set_edit_value(curren_value);
        setTimeout(() => inputRef.current?.focus(), 0);
    }, []);

    const finishEditing = useCallback(() => {
        if (editing_cell) {
            handleCellChange(editing_cell.row, editing_cell.col, edit_value);
            set_editing_cell(null);
            set_edit_value('');
        }
    }, [editing_cell, edit_value, handleCellChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            finishEditing();
            if(editing_cell) {
                const newRow = editing_cell.row + 1;
                if(newRow < model.getRowCount()) {
                    set_selected_cell({ row: newRow, col: editing_cell.col});
                    startEditing(newRow, editing_cell.col, model.getCell(newRow, editing_cell.col).value);
                }
            }
        } else if (e.key === 'Tab'){
            e.preventDefault();
            if(editing_cell) {
                finishEditing();
                const newCol = e.shiftKey ? editing_cell.col -1 : editing_cell.col +1;
                if(newCol >= 0 && newCol < model.getColCount()) {
                    set_selected_cell({row: editing_cell.row, col : newCol});
                    startEditing(editing_cell.row,newCol , model.getCell(editing_cell.row, newCol).value);
                }
            } else if(selected_cell) {
                const newCol = e.shiftKey ? selected_cell.col -1 : selected_cell.col +1;
                if(newCol >= 0 && newCol<model.getColCount()) {
                    set_selected_cell({row: selected_cell.row, col:newCol});
                }
            }
        }else if (e.key === 'Escape') {
            set_editing_cell(null);
            set_edit_value('');
        }
    }, [finishEditing, editing_cell,selected_cell,model,startEditing]);

    const getDisplayValue = useCallback((row: number, col: number): string => {
        const cell = model.getCell(row, col);
        const rawValue = cell.calculetade_value;
        const style = cell.style || {};
        if(rawValue === undefined || rawValue ==='') return '';
        const num = Number(rawValue);
        switch (style.format) {
            case 'percent':
                return `${(num * 100).toFixed(2)}%`;
            case 'currency':
                return `${num.toLocaleString('ru-RU')} ₽`;
            case 'date':
                const date = new Date(rawValue);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('ru-RU');
                }
                return String(rawValue);
            case 'number':
                return num.toString();
            default:
                if (typeof rawValue === 'boolean') {
                    return rawValue ? 'true' : 'false';
                }
                return String(rawValue);
        }    
    }, [model]);

    const isInSelectedRange = useCallback((row: number, col: number): boolean => {
        if (!selectedRange) return false;
        const { start, end } = selectedRange;
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    }, [selectedRange, rangeVersion]);

    const selectRange = useCallback((row: number, col: number, shiftPressed: boolean) => {
        if (shiftPressed && anchorCell) {
            setSelectedRange({
                start: { row: anchorCell.row, col: anchorCell.col },
                end: { row, col }
            });
            set_selected_cell({ row, col });
        }else {
            setAnchorCell({ row, col });
            setSelectedRange(null);
            set_selected_cell({ row, col });
        }
    }, [anchorCell]);

    const startResize = useCallback((e: React.MouseEvent, colIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingColumn({
            index: colIndex,
            startX: e.clientX,
            startWidth: columnWidths[colIndex] || 100
        });
    }, [columnWidths]);

    const onResize = useCallback((e: MouseEvent) => {
        if (!resizingColumn) return;
        
        const delta = e.clientX - resizingColumn.startX;
        const newWidth = Math.max(50, resizingColumn.startWidth + delta);
        
        setColumnWidths(prev => ({
            ...prev,
            [resizingColumn.index]: newWidth
        }));
    }, [resizingColumn]);

    const stopResize = useCallback(() => {
        setResizingColumn(null);
    }, []);
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            model.loadData(initialData);
            refresh();
        }
    }, [initialData, model, refresh]);
    
    useEffect(() => {
        if (resizingColumn) {
            document.addEventListener('mousemove', onResize);
            document.addEventListener('mouseup', stopResize);
            return() => {
                document.removeEventListener('mousemove', onResize);
                document.removeEventListener('mouseup', stopResize);
            };
        }
    }, [resizingColumn, onResize, stopResize]);

    useEffect(() => {
        const handleUndoRedo = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                dispatch(undo());
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                dispatch(redo());
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                if(selected_cell) {
                    const cell = model.getCell(selected_cell.row, selected_cell.col);
                    const currentStyle = cell.style || {};
                    dispatch(updateCellStyle({
                        row: selected_cell.row,
                        col: selected_cell.col,
                        style: {bold: !currentStyle.bold}
                    }));
                }
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                if(selected_cell) {
                    const cell = model.getCell(selected_cell.row, selected_cell.col);
                    const currentStyle = cell.style || {};
                    dispatch(updateCellStyle({
                        row: selected_cell.row,
                        col: selected_cell.col,
                        style: { italic:!currentStyle.italic}
                    })) ;
                }
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                if(selected_cell) {
                    const cell = model.getCell(selected_cell.row,selected_cell.col);
                    const currentStyle = cell.style || {};
                    dispatch(updateCellStyle({
                        row: selected_cell.row,
                        col: selected_cell.col,
                        style: { underline: !currentStyle.underline }
                    }));
                }
            }
            if((e.ctrlKey || e.metaKey) && e.key ==='c') {
                e.preventDefault();
                if(selected_cell){
                    const cell = model.getCell(selected_cell.row, selected_cell.col);
                    localStorage.setItem('clipboard_data', cell.value);
                    localStorage.setItem('clipboard_style', JSON.stringify(cell.style || {}));
                }
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                if(selected_cell) {
                    const pastedValue = localStorage.getItem('clipboard_data');
                    if(pastedValue !== null) {
                        handleCellChange(selected_cell.row, selected_cell.col, pastedValue);
                        const pastedStyle = localStorage.getItem('clipboard_style');
                        if(pastedStyle) {
                            const style = JSON.parse(pastedStyle);
                            dispatch(updateCellStyle({
                                row: selected_cell.row,
                                col: selected_cell.col,
                                style
                            }));
                        }
                    }
                }
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'x') {
                e.preventDefault();
                if(selected_cell) {
                    const cell = model.getCell(selected_cell.row, selected_cell.col);
                    localStorage.setItem('clipboard_data',cell.value);
                    localStorage.setItem('clipboard_style', JSON.stringify(cell.style || {}));
                    handleCellChange(selected_cell.row, selected_cell.col, '');
                }
            }
            if(e.key === 'Delete') {
                e.preventDefault();
                if(selected_cell) {
                    handleCellChange(selected_cell.row, selected_cell.col, '');
                }
            }
            if(e.key === 'Backspace' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                if(selected_cell) {
                    handleCellChange(selected_cell.row, selected_cell.col, '');
                }
            }
if((e.ctrlKey || e.metaKey) && e.key === 'a'){
    e.preventDefault();
    e.stopPropagation(); 
    const maxRow = model.getRowCount() - 1;
    const maxCol = model.getColCount() - 1;
    
    console.log('=== Ctrl+A pressed ===');
    console.log('maxRow:', maxRow, 'maxCol:', maxCol);
    console.log('selectedRange before:', selectedRange);
    
    setSelectedRange({
        start: {row: 0, col: 0},
        end: { row: maxRow, col: maxCol}
    });
    
    console.log('selectedRange after:', { start: {row: 0, col: 0}, end: { row: maxRow, col: maxCol } });
    
    set_selected_cell({row: 0, col: 0});
    setAnchorCell({ row: 0, col: 0 });
    setUpdateKey(prev => prev + 1);
}
        };
        window.addEventListener('keydown', handleUndoRedo);
        return () => window.removeEventListener('keydown', handleUndoRedo);
    }, [dispatch, selected_cell, model, refresh]);

    const handleContextMenu = useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, row, col });
        set_selected_cell({ row, col });
    }, []);

    const handleAddRowAbove = useCallback(() => {
        if (contextMenu) {
            model.addRow(contextMenu.row);
            refresh();
            if (on_data_change) on_data_change(model.getAllData());
            setContextMenu(null);
        }
    }, [contextMenu, model, refresh, on_data_change]);

    const handleAddRowBelow = useCallback(() => {
        if (contextMenu) {
            model.addRow(contextMenu.row + 1);
            refresh();
            if (on_data_change) on_data_change(model.getAllData());
            setContextMenu(null);
        }
    }, [contextMenu, model, refresh, on_data_change]);

    const handleAddColLeft = useCallback(() => {
        if (contextMenu) {
            model.addCol(contextMenu.col);
            refresh();
            if (on_data_change) on_data_change(model.getAllData());
            setContextMenu(null);
        }
    }, [contextMenu, model, refresh, on_data_change]);

    const handleAddColRight = useCallback(() => {
        if (contextMenu) {
            model.addCol(contextMenu.col + 1);
            refresh();
            if (on_data_change) on_data_change(model.getAllData());
            setContextMenu(null);
        }
    }, [contextMenu, model, refresh, on_data_change]);

    const handleDeleteRow = useCallback(() => {
        if (contextMenu) {
            model.deleteRow(contextMenu.row);
            model.loadData(model.getAllData());
            refresh();
            if (on_data_change) on_data_change(model.getAllData());
            setContextMenu(null);
        }
    }, [contextMenu, model, refresh, on_data_change]);

    const handleDeleteCol = useCallback(() => {
        if (contextMenu) {
            model.deleteCol(contextMenu.col);
            refresh();
            if (on_data_change) on_data_change(model.getAllData());
            setContextMenu(null);
        }
    }, [contextMenu, model, refresh, on_data_change]);

    const renderColumnHeaders = () => {
        const headers = [];
        for (let i = 0; i < model.getColCount(); i++) {
            const letter = String.fromCharCode(65 + i);
            const width = columnWidths[i] || 100;
            headers.push(
                <div
                    key={`col-${i}`}
                    className="spreadsheet-col-header"
                    style={{ width: `${width}px`, minWidth: `${width}px`, height: ROW_HEIGHT }}
                >
                    {letter}
                    <div
                        className="col-resize-handle"
                        onMouseDown={(e) => startResize(e, i)}
                    />
                </div>
            );
        }
        return headers;
    };

    const renderRows = () => {
        const { startIndex, endIndex } = visibleRange;
        const colCount = model.getColCount();
        const rows = [];
        
        const topPadding = startIndex * ROW_HEIGHT;
        const bottomPadding = (model.getRowCount() - endIndex) * ROW_HEIGHT;
        for (let row = startIndex; row < endIndex; row++) {
            const cells = [];
            cells.push(
                <div key={`row-${row}`} className="spreadsheet-row-header" style={{ height: ROW_HEIGHT }}>
                    {row + 1}
                </div>
            );
            for (let col = 0; col < colCount; col++) {
                const isSelect = selected_cell?.row === row && selected_cell?.col === col;
                const isEdit = editing_cell?.row === row && editing_cell?.col === col;
                const displayValue = getDisplayValue(row, col);
                const cellValue = model.getCell(row, col).value;
                const width = columnWidths[col]||100;
                const isInRange = isInSelectedRange(row, col);
                const isRangeCell = isInRange && !isSelect;
                const cell = model.getCell(row, col);
                const cellStyle = cell.style || {};
                const cellDivStyle: React.CSSProperties = {
                    width: `${width}px`,
                    minWidth: `${width}px`,
                    height: ROW_HEIGHT,
                    fontWeight: cellStyle.bold ? 'bold' : 'normal',
                    fontStyle: cellStyle.italic ? 'italic' : 'normal',
                    textDecoration: cellStyle.underline ? 'underline' : 'none',
                    textAlign: cellStyle.align || 'left',
                    color: cellStyle.textColor || '#000000',
                    backgroundColor: cellStyle.backgroundColor || 'transparent',  
                };
                cells.push(
                    <div
                        key={`cell-${row}-${col}-${updateKey}`}
                        className={`spreadsheet-cell 
                            ${isSelect ? 'selected' : ''} 
                            ${isRangeCell ? 'range-selected' : ''}`}
                        style={cellDivStyle}
                        onClick={() => {
                            selectRange(row, col, isShiftPressed);
                            if (on_cell_select) {
                                on_cell_select(row, col, cellValue);
                            }
                        }}
                        onDoubleClick={() => startEditing(row, col, model.getCell(row, col).value)}
                        onContextMenu={(e) => handleContextMenu(e, row, col)}
                    >
                        {isEdit ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={edit_value}
                                onChange={(e) => set_edit_value(e.target.value)}
                                onBlur={finishEditing}
                                onKeyDown={handleKeyDown}
                                className="spreadsheet-cell-input"
                                style={{ height: ROW_HEIGHT - 2 }}
                            />
                        ) : (
                            <div className="spreadsheet-cell-content">{displayValue}</div>
                        )}
                    </div>
                );
            }
            
            rows.push(
                <div key={`row-${row}`} className="spreadsheet-row" style={{ height: ROW_HEIGHT }}>
                    {cells}
                </div>
            );
        }
        
        return (
            <>
                <div style={{ height: topPadding }} />
                {rows}
                <div style={{ height: bottomPadding }} />
            </>
        );
    };
    
    return (
        <div className="spreadsheet-container">
            <div 
                ref={headerRef}
                className="spreadsheet-header"
                onScroll={(e) => {
                    if (bodyRef.current) {
                        bodyRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                }}
            >
                <div className="spreadsheet-corner-cell" />
                {renderColumnHeaders()}
            </div>

            <div 
                ref={bodyRef}
                className="spreadsheet-body"
                onScroll={handleBodyScroll}
                style={{ overflow: 'auto', maxHeight: '600px' }}
            >
                {renderRows()}
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onAddRowAbove={handleAddRowAbove}
                    onAddRowBelow={handleAddRowBelow}
                    onAddColLeft={handleAddColLeft}
                    onAddColRight={handleAddColRight}
                    onDeleteRow={handleDeleteRow}
                    onDeleteCol={handleDeleteCol}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default Spreadsheet;