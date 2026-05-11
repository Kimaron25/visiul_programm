import React, { useEffect, useState } from 'react';
import './Spreadsheet.css';

interface BarFormulProps {
    value: string;
    on_change: (value: string) => void;
    on_commit: () => void;
}

const BarFormul: React.FC<BarFormulProps> = ({value, on_change ,on_commit}) => {
    const [local_value,set_local_value] = useState(value);

    useEffect(() => {
        set_local_value(value);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if( e.key === 'Enter'){
            on_change(local_value);
            on_commit();
        } else if (e.key === 'Escape'){
            set_local_value(value);
            on_commit();
        }
    };
    return (
        <div className="bar-formul">
            <div className="bar-formul-label">fx</div>
            <input type="text"
            value={local_value}
            onChange={(e) => set_local_value(e.target.value)}
            onBlur={() => {
                on_change(local_value);
                on_commit();
            }}
            onKeyDown={handleKeyDown}
            className="formula-bar-input"
            placeholder="Введите значение или формулу..."
            />
        </div>
    );
};

export default BarFormul;