import type React from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {updateCellStyle, type CellStyle } from "../../store/slices/spreadsheetSlice";
import './FormattingToolbar.css';

interface FormattingToolbarProps {
    selectedCell: { row: number; col: number } | null;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({selectedCell}) => {
    const dispatch = useAppDispatch();
    const { data} = useAppSelector(state => state.spreadsheet);
    const getCurrentStyle = (): CellStyle=> {
        if(!selectedCell) return {};
        const key = `${selectedCell.row}:${selectedCell.col}`;
        return data[key]?.style || {};
    };
    const currentStyle = getCurrentStyle();
    const updateStyle = (style: Partial<CellStyle>) =>{
        if (!selectedCell) return;
        dispatch(updateCellStyle({
            row: selectedCell.row,
            col: selectedCell.col,
            style
        }));
    };
    const toggleBold = () => updateStyle({ bold: !currentStyle.bold});
    const toggleItalic = () => updateStyle({ italic: !currentStyle.italic});
    const toggleUnderline = () => updateStyle({ underline: !currentStyle.underline});
    const setAlign = (align: 'left' | 'center' | 'right') => updateStyle({ align});
    const setTextColor = (color: string) => updateStyle({ textColor: color});
    const setBackgroundColor = (color: string) => updateStyle({ backgroundColor: color});
    return (
        <div className="formatting-toolbar">
            <div className="toolbar-group">
                <button 
                    className={`toolbar-btn ${currentStyle.bold ? 'active' : ''}`}
                    onClick={toggleBold}
                    title="Жирный (Ctrl+B)"
                >
                    <b>B</b>
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.italic ? 'active' : ''}`}
                    onClick={toggleItalic}
                    title="Курсив (Ctrl+I)"
                >
                    <i>I</i>
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.underline ? 'active' : ''}`}
                    onClick={toggleUnderline}
                    title="Подчёркнутый (Ctrl+U)"
                >
                    <u>U</u>
                </button>
            </div>
            
            <div className="toolbar-divider" />
            
            <div className="toolbar-group">
                <button 
                    className={`toolbar-btn ${currentStyle.align === 'left' ? 'active' : ''}`}
                    onClick={() => setAlign('left')}
                    title="Выровнять по левому краю"
                >
                    &#x2190;
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.align === 'center' ? 'active' : ''}`}
                    onClick={() => setAlign('center')}
                    title="По центру"
                >
                    &#x2194;
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.align === 'right' ? 'active' : ''}`}
                    onClick={() => setAlign('right')}
                    title="Выровнять по правому краю"
                >
                    &#x2192;
                </button>
            </div>
            
            <div className="toolbar-divider" />
            
            <div className="toolbar-group">
                <input
                    type="color"
                    value={currentStyle.textColor || '#000000'}
                    onChange={(e) => setTextColor(e.target.value)}
                    title="Цвет текста"
                    className="color-picker"
                />
                <input
                    type="color"
                    value={currentStyle.backgroundColor || '#ffffff'}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    title="Цвет фона"
                    className="color-picker"
                />
                <button 
                    className={`toolbar-btn ${currentStyle.format === 'number' ? 'active' : ''}`}
                    onClick={() => updateStyle({ format: 'number' })}
                    title="Число"
                >
                    123
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.format === 'percent' ? 'active' : ''}`}
                    onClick={() => updateStyle({ format: 'percent' })}
                    title="Процент"
                >
                    %
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.format === 'currency' ? 'active' : ''}`}
                    onClick={() => updateStyle({ format: 'currency' })}
                    title="Валюта"
                >
                    ₽
                </button>
                <button 
                    className={`toolbar-btn ${currentStyle.format === 'date' ? 'active' : ''}`}
                    onClick={() => updateStyle({ format: 'date' })}
                    title="Дата"
                >
                    D
                </button>
            </div>
        </div>
    );
};

export default FormattingToolbar;