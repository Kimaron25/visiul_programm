import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadDocumentById, setCurrentDocumentId } from '../store/slices/documentsSlice';
import { setData, setRows, setCols, importData } from '../store/slices/spreadsheetSlice';
import { setSaveStatus, setNotification } from '../store/slices/uiSlice';
import { saveDocument as saveDocumentThunk } from '../store/slices/documentsSlice';
import BarFormul from '../components/Spreadsheet/BarFormul';
import Spreadsheet from '../components/Spreadsheet/Spreadsheet';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { parseCSV } from '../utils/importUtils';
import { type TableData } from '../lib/spreadsheet';
import './SpreadsheetPage.css';


const SpreadsheetPage: React.FC = () => {
    const {documentId} = useParams<{ documentId:string} >();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentDocumentId, currentDocumentData} = useAppSelector(state => state.documents);
    const {data: tableData, rows: tableRows, cols: tableCols } = useAppSelector(state => state.spreadsheet);
    const {saveStatus} = useAppSelector(state => state.ui);
    const [activeCellValue, setActiveCellValue] = useState('');
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> |null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if(documentId) {
            const stored = localStorage.getItem('spreadsheet_documents');
            if(stored) {
                const docs = JSON.parse(stored);
                const docExists = docs.some((doc: any) => doc.id === documentId);
                if(!docExists) {
                    dispatch(setNotification('Документ не найден (404)'));
                    navigate('/404', {replace: true});
                    return;
                }
                const currentUserId = localStorage.getItem('spreadsheet_current_user');
                const doc = docs.find((d: any) => d.id === documentId);
                if (doc && doc.userId && doc.userId !== currentUserId) {
                    dispatch(setNotification('Доступ запрещён (403): вы не являетесь владельцем документа'));
                    console.warn('403 Forbidden - попытка доступа к чужому документу');
                    navigate('/dashboard', { replace: true });
                    return;
                }
            }
            dispatch(setCurrentDocumentId(documentId));
            dispatch(loadDocumentById(documentId)).then((result) => {
                const payload = result.payload as any;
                const hasNoData = !payload.data || Object.keys(payload.data).length === 0;
                const hasNoSize = !payload.rows && !payload.cols;
                if(hasNoData && hasNoSize) {
                    const stored = localStorage.getItem('spreadsheet_documents');
                    if (stored) {
                        const docs = JSON.parse(stored);
                        const exists = docs.some((doc: any) => doc.id === documentId);
                        if(!exists){
                        navigate('/404', { replace: true });
                        return;
                        }
                    }
                }
                dispatch(setData(payload.data||{}));
                if(payload.rows) dispatch(setRows(payload.rows));
                if(payload.cols) dispatch(setCols(payload.cols));
            }).catch(() => {
                    navigate('/404', { replace: true });
                });
        }
    }, [documentId,dispatch , navigate]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if(hasUnsavedChanges || saveStatus === 'saving'){
                e.preventDefault();
                e.returnValue = 'Есть несохранённые изменения. Вы уверены?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, saveStatus]);

    const saveDocument = useCallback(async (data: TableData) => {
        if(!currentDocumentId) return ;
        dispatch(setSaveStatus('saving'));
        try {
            await dispatch(saveDocumentThunk({ id: currentDocumentId, data })).unwrap();
            dispatch(setSaveStatus('saved'));
            setHasUnsavedChanges(false);
        } catch (error) {
            dispatch(setSaveStatus('error'));
            dispatch(setNotification('Ошибка сохранения'));
        }
    }, [currentDocumentId, dispatch]);

    const handleDataChange = useCallback((data: TableData) => {
        dispatch(setData(data));
        setHasUnsavedChanges(true);
        if(saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(data);
        }, 5000);
    }, [saveDocument,dispatch]);

    const handleCellSelect = useCallback((row: number, col: number, value: string) => {
        setActiveCellValue(value);
    }, []);

    const handleFormulChange = useCallback((value: string) => {
        setActiveCellValue(value);
    },[]);

    const handleExportCSV = () => {
        exportToCSV(tableData,tableRows,tableCols);
    };

    const handleExportJSON = () => {
        exportToJSON(tableData);
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return ;
        const text = await file.text();
        const {data , rows,cols} = parseCSV(text);
        dispatch(importData({data,rows,cols}));
        dispatch(setNotification(`Импортировано ${rows} строк и ${cols} столбцов`));
        setHasUnsavedChanges(true);
        e.target.value = '';
    };

    useEffect(() => {
        const handleCtrlS = (e:KeyboardEvent) => {
            if((e.ctrlKey || e.metaKey) && e.key ==='s') {
                e.preventDefault();
                if(currentDocumentId) {
                    saveDocument(tableData);
                }
            }
        };
        window.addEventListener('keydown', handleCtrlS);
        return () => window.removeEventListener('keydown', handleCtrlS);
    }, [currentDocumentId, tableData, saveDocument]);
    return (
        <div className="spreadsheet-page">
            <div className="spreadsheet-page-header">
                <Breadcrumbs documentName={currentDocumentData?.name} />
                <div className="export-import-buttons">
                    <button onClick={handleExportCSV} className="export-btn"> Экспорт CSV</button>
                    <button onClick={handleExportJSON} className="export-btn"> Экспорт JSON</button>
                    <label className="import-btn">
                         Импорт CSV
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
                <div className={`save-status status-${saveStatus}`}>
                    {saveStatus === 'saving' && ' Сохранение...'}
                    {saveStatus === 'saved' && ' Сохранено'}
                    {saveStatus === 'error' && ' Ошибка'}
                </div>
            </div>

            <BarFormul
                value={activeCellValue}
                on_change={handleFormulChange}
                on_commit={() => {}}
            />

            <Spreadsheet
                key={`${tableRows}-${tableCols}`}
                rows={tableRows}
                cols={tableCols}
                initialData={tableData}
                on_data_change={handleDataChange}
                on_cell_select={handleCellSelect}
            />
        </div>
    );
};
export default SpreadsheetPage;