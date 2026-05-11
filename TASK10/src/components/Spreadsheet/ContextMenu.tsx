import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
    x:number;
    y:number;
    onAddRowAbove: () => void;
    onAddRowBelow: () => void;
    onAddColLeft: () => void;
    onAddColRight: () => void;
    onDeleteRow: () => void;
    onDeleteCol: () => void;
    onClose: () => void;
}
const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,  
    onAddRowAbove,onAddRowBelow,
    onAddColLeft,
    onAddColRight,
    onDeleteRow,
    onDeleteCol,
    onClose
}) => { const menuRef = useRef<HTMLDivElement>(null) ;
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if(menuRef.current && !menuRef.current.contains(event.target as Node)){
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown',handleClickOutside);
    }, [onClose]);
    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ top: y, left: x }}
        >
            <div className="context-menu-section">
                <div className="context-menu-title">Строка</div>
                <button onClick={onAddRowAbove}> Вставить строку выше</button>
                <button onClick={onAddRowBelow}> Вставить строку ниже</button>
                <button onClick={onDeleteRow} className="danger"> Удалить строку</button>
            </div>

            <div className="context-menu-divider" />

            <div className="context-menu-section">
                <div className="context-menu-title">Столбец</div>
                <button onClick={onAddColLeft}> Вставить столбец слева</button>
                <button onClick={onAddColRight}> Вставить столбец справа</button>
                <button onClick={onDeleteCol} className="danger"> Удалить столбец</button>
            </div>
        </div>
    );
};

export default ContextMenu;