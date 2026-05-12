import { useCallback, useState , useRef, useEffect } from 'react'
import './App.css'
import CreateDocumentModal from './components/Modals/CreateDocumentModal';
import Dashboard from './components/Dashboard/Dashboard';
import {type TableData } from './lib/spreadsheet';
import BarFormul from './components/Spreadsheet/BarFormul';
import Spreadsheet from './components/Spreadsheet/Spreadsheet';
import { createDocumentWithSize } from './services/documentService';
import { fetchDocumentsById, updateDocument } from './services/documentService';
import { exportToCSV, exportToJSON } from './utils/exportUtils';
import { parseCSV } from './utils/importUtils';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { undo, redo } from './store/slices/spreadsheetSlice';

import { 
    setCreateModalOpen, 
    setSaveStatus, 
    setNotification 
} from './store/slices/uiSlice';
import { 
    loadDocuments, 
    loadDocumentById, 
    createNewDocument, 
    saveDocument as saveDocumentThunk,
    setCurrentDocumentId,
    setCurrentDocumentData
} from './store/slices/documentsSlice';
import { 
    setData, 
    setRows, 
    setCols, 
    importData 
} from './store/slices/spreadsheetSlice';

function App() {
//  const [current_document_id, set_current_document_id] = useState<string | null>(null);
//  const [show_new_document_modal, set_show_new_document_modal] = useState(false);
//  const [active_cell_value,set_active_cell_value] = useState('');
//  const [active_cell_position,set_active_cell_position] = useState<{ row:number; col: number} | null>(null);
//  const [table_data, set_table_data] = useState<TableData>({});
//  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
//  const [tableRows, setTableRows] = useState(100);
//  const [tableCols, setTableCols] = useState(26);
//  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const dispatch = useAppDispatch();
 const { isCreateModalOpen, saveStatus, notification } = useAppSelector(state=> state.ui);
 const { currentDocumentId, currentDocumentData} = useAppSelector(state => state.documents);
 const { data: tableData, rows: tableRows, cols: tableCols } = useAppSelector(state => state.spreadsheet);
 const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 useEffect(() => {
  dispatch(loadDocuments());
 },[dispatch]);
 useEffect(() => {
  if(notification) {
    alert(notification);
    dispatch(setNotification(null));
  }
 }, [notification,dispatch]);
 const handleSelectDocument = useCallback(async (id: string) => {
  dispatch(setCurrentDocumentId(id));
  const result = await dispatch(loadDocumentById(id));
  if(result.payload) {
    const payload = result.payload as any;
    dispatch(setData(payload.data || {}));
    if(payload.rows) dispatch(setRows(payload.rows));
    if(payload.cols) dispatch(setCols(payload.cols));
  }
  // try {
  //   const doc = await fetchDocumentsById(id);
  //   if (doc && doc.data) {
  //     set_table_data(doc.data);
  //     setTableRows(doc.rows || 100);
  //     setTableCols(doc.cols || 26);
  //   }
  //   set_current_document_id(id);
  // }catch (error) {
  //     console.error('Ошибка загрузки документа:', error);
  //     alert('Не удалось загрузить документ');
  // }
 }, [dispatch]);

 const handleCreateNew = () => {
  dispatch(setCreateModalOpen(true));
  // set_show_new_document_modal(true);
 };

 const handleBackToDashboard = async() => {
    if (currentDocumentId) {
      dispatch(setSaveStatus('saving'));
      // setSaveStatus('saving');
      try {
        await dispatch(saveDocumentThunk({ id: currentDocumentId, data:tableData})).unwrap();
        dispatch(setSaveStatus('saved'));
        // await updateDocument(current_document_id, { data: table_data });
        // const preview = generatePreview(table_data);
        // await updateDocument(current_document_id, { preview });
        // setSaveStatus('saved');
      }catch(error) {
        dispatch(setSaveStatus('saved'));
        dispatch(setNotification('Ошибка сохранения перед выходом:'));
        // console.error('Ошибка сохранения перед выходом:', error);
        // setSaveStatus('error');
      }
    }
    dispatch(setCurrentDocumentId(null));
    dispatch(setCurrentDocumentData({}));
 };
 const handleCreateDocument = async(name: string, rows: number, cols: number) =>{
  try {
    const result = await dispatch(createNewDocument({name,rows, cols})).unwrap();
    dispatch(setCurrentDocumentId(result.id));
    dispatch(setRows(rows));
    dispatch(setCols(cols));
    dispatch(setData({}));
    dispatch(setCreateModalOpen(false));
    // const newDoc = await createDocumentWithSize(name,rows,cols);
    // set_current_document_id(newDoc.id);
    // set_show_new_document_modal(false);
    // set_table_data({});
    // setTableRows(rows);
    // setTableCols(cols);
  } catch (error) {
    console.error('Ошибка создания документа:', error);
    dispatch(setNotification('Не удалось создать документ'));
    // alert('Не удалось создать документ');
  }
 };

 const generatePreview = (data: TableData): string[][] => {
  const preview: string[][] = Array(3).fill(null).map(() => Array(3).fill(''));
  for(let row = 0; row<3; row++){
    for(let col = 0; col<3;col++){
      const key = `${row}:${col}`;
      const cell = data[key];
      if (cell && cell.calculetade_value !== undefined && cell.calculetade_value !== '') {
        preview[row][col] = String(cell.calculetade_value).substring(0, 20);
      }
    }
  }
  return preview;
 };

 const saveDocument = useCallback(async (data: any) => {
  if (!currentDocumentId) return;
    dispatch(setSaveStatus('saving'));
    // setSaveStatus('saving');
    try {
      // console.log('Сохранение документа:', current_document_id, data);
      // await updateDocument(current_document_id, { data });
      // setSaveStatus('saved');
      // const preview = generatePreview(data);
      // await updateDocument(current_document_id, { preview });
      // await dispatch(saveDocumentThunk({id: currentDocumentId,data})).unwrap();
      const preview = generatePreview(data);
      await dispatch(saveDocumentThunk({ id: currentDocumentId,data:data, preview: preview} )).unwrap();
      dispatch(setSaveStatus('saved'));
    }catch(error) {
      dispatch(setSaveStatus('error'));
      dispatch(setNotification('Ошибка сохранения'));
      // setSaveStatus('error');
    }
  }, [currentDocumentId,dispatch]);

 const handleDataChange = useCallback((data: TableData) => {
  dispatch(setData(data));
  if(saveTimeoutRef.current){
    clearTimeout(saveTimeoutRef.current);
  }
  saveTimeoutRef.current=setTimeout(() => {
    saveDocument(data);
  },500);
 }, [saveDocument , dispatch]);

 const handleCellSelect = useCallback((row: number, col:number , value:string) => {
  // set_active_cell_position({row,col});
  // set_active_cell_value(value);
 }, []);

 const handleFormulChange = useCallback((value:string) => {
  // set_active_cell_value(value);
 }, []);

 const handleFormulCommit = useCallback(() => {

 },[]);
 const handleExportCSV = () => {
  exportToCSV(tableData,tableRows,tableCols);
 };
 const handleExportJSON = () => {
  exportToJSON(tableData);
 };
 const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const { data, rows, cols } = parseCSV(text);
  // set_table_data(data);
  // setTableRows(rows);
  // setTableCols(cols);
  // alert(`Импортировано ${rows} строк и ${cols} столбцов`);
  dispatch(importData({data,rows,cols}));
  dispatch(setNotification(`Импортировано ${rows} строк и ${cols} столбцов`));
  e.target.value = '';
 }

 useEffect(() => {
  const handleCtrlS = (e: KeyboardEvent) => {
    if((e.ctrlKey|| e.metaKey) && e.key === 's'){
      e.preventDefault();
      if(currentDocumentId) {
        saveDocument(tableData);
      }
    }
  };
  window.addEventListener('keydown',handleCtrlS);
  return () => window.removeEventListener('keydown', handleCtrlS);
 }, [currentDocumentId, tableData, saveDocument]);
    
 useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (saveStatus === 'saving') {
      e.preventDefault();
      e.returnValue = 'Данные сохраняются. Вы уверены?';
    }
  };  
  window.addEventListener('beforeunload', handleBeforeUnload);
   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  useEffect(()=> {
    const handleUndoRedo = (e:KeyboardEvent) => {
      if((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if(e.shiftKey) {
          dispatch(redo());
        } else {
          dispatch(undo());
        }
      }
      if((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        dispatch(redo());
      }
    };
    window.addEventListener('keydown', handleUndoRedo);
    return () => window.removeEventListener('keydown', handleUndoRedo);
  }, [dispatch]);
 if (!currentDocumentId) {
  return (
    <>
      <Dashboard 
        onSelectDocument={handleSelectDocument}
        onCreateNew={handleCreateNew}
      />
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(setCreateModalOpen(false))}
        onCreate={handleCreateDocument}
      />
    </>
  );
 }

 return (
      <div className="app">
      <div className="app-header">
        <div className="export-import-buttons">
        <button onClick={handleExportCSV} className="export-btn">[ Экспорт CSV ]</button>
        <button onClick={handleExportJSON} className="export-btn">[ Экспорт JSON ]</button>
        <label className="import-btn">
          [Импорт CSV]
        <input
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          style={{ display: 'none' }}
          />
        </label>
      </div>
        <button className="back-button" onClick={handleBackToDashboard}>
           К документам
        </button>
        <h1>Табличный процессор</h1>
        <div className={`save-status status-${saveStatus}`}>
          {saveStatus === 'saving' && 'Сохранение...'}
          {saveStatus === 'saved' && 'Сохранено'}
          {saveStatus === 'error' && 'Ошибка'}
        </div>
      </div>
      
      <BarFormul
        value={''}
        on_change={handleFormulChange}
        on_commit={handleFormulCommit}
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

}

export default App
