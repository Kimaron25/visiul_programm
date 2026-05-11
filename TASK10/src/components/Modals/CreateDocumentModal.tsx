import React, { useState } from "react";
import { createDocument } from "../../services/documentService";

interface CreateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name:string, rows: number, cols: number) => void;
}

const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({ isOpen, onClose, onCreate}) => {
    const [name, setName] = useState('');
    const [rows, setRows] = useState(100);
    const [cols, setCols] = useState(26);
    const [error, setError] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Введите название документа');
            return;
        }
        if (rows < 1 || rows > 1000) {
            setError('Количество строк должно быть от 1 до 1000');
            return;
        }
        if (cols < 1 || cols > 52) {
            setError('Количество столбцов должно быть от 1 до 52');
            return;
        }
        onCreate(name.trim(), rows, cols);
        setName('');
        setRows(100);
        setCols(26);
        setError('');
        onClose();
    };
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Создание нового документа</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-field">
                        <label>Название документа</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название..."
                            autoFocus
                        />
                    </div>
                    <div className="modal-row">
                        <div className="modal-field">
                            <label>Строки</label>
                            <input
                                type="number"
                                value={rows}
                                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                                min="1"
                                max="1000"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Столбцы</label>
                            <input
                                type="number"
                                value={cols}
                                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                                min="1"
                                max="52"
                            />
                        </div>
                    </div>
                    {error && <div className="modal-error">{error}</div>}
                    <div className="modal-buttons">
                        <button type="button"className="btn-cancel" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit"className="btn-create">
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDocumentModal;
