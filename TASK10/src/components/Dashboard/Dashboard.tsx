import React, { useState, useEffect } from 'react';
import { type Document } from '../../types/document';
import { fetchDocuments, deleteDocument, duplicateDocument, updateDocument } from '../../services/documentService';
import './Dashboard.css';

interface DashboardProps {
    onSelectDocument: (id:string) => void;
    onCreateNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectDocument, onCreateNew }) =>{
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const loadDocuments = async () => {
        try {
            setLoading(true);
            const docs = await fetchDocuments();
            setDocuments(docs);
            setError(null);
        } catch(err) {
            setError('Ошибка загрузки документов');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadDocuments();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU') + ' '+ date.toLocaleTimeString('ru-RU', { hour:'2-digit',minute: '2-digit'});
    };

    const handleDelete = async(id:string,name: string) => {
        if (window.confirm(`Удалить документ "${name}"?`)) {
            try {
                await deleteDocument(id);
                await loadDocuments();
            } catch (err) {
                alert('Ошибка при удалении');
            }
        }
    };
    const handleDuplicate =async(id: string) => {
        try {
            await duplicateDocument(id);
            await loadDocuments();
        } catch (err) {
            alert('Ошибка при дублировании');
        }
    };
    const handleRename = async(id: string, newName: string) => {
    try {
        await updateDocument(id, { name: newName });
        await loadDocuments();
        setEditingDocId(null);
    }catch (error) {
        alert('Ошибка переименования');
    }
    };
    
    if(loading){
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Загрузка документов...</p>
            </div>
        );
    }
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Мои документы</h1>
                <button className="create-button" onClick={onCreateNew}>
                    + Создать документ
                </button>
            </div>

            {error && <div className="dashboard-error">{error}</div>}

            {documents.length === 0 && !loading && (
                <div className="dashboard-empty">
                    <p>У вас пока нет документов</p>
                    <button onClick={onCreateNew}>Создать первый документ</button>
                </div>
            )}

            <div className="documents-grid">
                {documents.map(doc => (
                    <div key={doc.id} className="document-card" onClick={() => onSelectDocument(doc.id)}>
                    <div className="document-card-header">
                        {editingDocId === doc.id ? (
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={() => handleRename(doc.id, editingName)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename(doc.id, editingName)}
                                autoFocus
                                className="rename-input"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <h3 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDocId(doc.id);
                                    setEditingName(doc.name);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {doc.name}
                            </h3>
                        )}
                        <div className="document-card-actions">
                            <button 
                                className="action-btn rename"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDocId(doc.id);
                                    setEditingName(doc.name);
                                }}
                                title="Переименовать"
                            >
                            </button>                            
                            <button 
                                className="action-btn duplicate"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(doc.id);
                                }}
                                title="Дублировать"
                            >
                                #
                            </button>
                            <button 
                                className="action-btn delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(doc.id, doc.name);
                                }}
                                title="Удалить"
                            >
                                -
                            </button>
                        </div>
                    </div>
                        <div className="document-card-preview">
                            <div className="preview-table">
                                {doc.preview && doc.preview.map((row, i) => (
                                    <div key={i} className="preview-row">
                                        {row.map((cell, j) => (
                                            <div key={j} className="preview-cell">
                                                {cell || ''}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="document-card-info">
                            <div className="info-item">
                                <span>Изменён:</span>
                                <span>{formatDate(doc.updatedAt)}</span>
                            </div>
                            <div className="info-item">
                                <span>Создан:</span>
                                <span>{formatDate(doc.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;