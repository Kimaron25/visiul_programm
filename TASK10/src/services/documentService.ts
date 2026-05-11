import { type Document, type CreateDocument_t, type UpdateDocument_t } from "../types/document";
import { type TableData } from '../lib/spreadsheet';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve,ms));

const STORAGE_KEY = 'spreadsheet_documents';
const CURRENT_USER_KEY = 'spreadsheet_current_user';

const getCurrentUserId = (): string => {
    let userId = localStorage.getItem(CURRENT_USER_KEY);
    if(!userId){
        userId = 'user_' +Math.random().toString(36).substr(2, 9);
        localStorage.setItem(CURRENT_USER_KEY,userId);
    }
    return userId;
};

const getAllDocuments = ():Document[]=>{
    const stored = localStorage.getItem(STORAGE_KEY);
    const allDocs = stored?JSON.parse(stored) :[];
    const userId = getCurrentUserId();
     return allDocs.filter((doc: Document) => doc.id.startsWith(userId));
};

const saveAllDocuments = (docs: Document[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

const generateId = (): string => {
    const userId = getCurrentUserId();
    return `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

export const fetchDocuments = async (): Promise<Document[]> => {
    await delay(300);
    return getAllDocuments();
};

export const fetchDocumentsById = async (id: string): Promise<Document | null> => {
    await delay(300); 
    const docs = getAllDocuments();
    return docs.find(doc=> doc.id === id) || null;
};

export const createDocument = async (t: CreateDocument_t) : Promise<Document> => {
    await delay(500);
    const newDocument: Document = {
        id: generateId(),
        name: t.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {},
        preview: Array(3).fill(null).map(() => Array(3).fill(''))
    };
    const docs = getAllDocuments();
    docs.push(newDocument);
    saveAllDocuments(docs);
    return newDocument;
}

export const updateDocument = async(id: string, t: UpdateDocument_t) : Promise<Document> => {
    await delay(300);
    const docs = getAllDocuments();
    const index = docs.findIndex(doc => doc.id === id);
    if(index === -1){
        throw new Error('Документ не найден');
    }
    docs[index] = {
        ...docs[index],
        ...t,
        updatedAt:new Date().toISOString()
    };
    saveAllDocuments(docs);
    return docs[index];
}

export const deleteDocument = async (id: string): Promise<void> => {
    await delay(300);
    const docs = getAllDocuments();
    const filtered = docs.filter(doc => doc.id !== id);
    saveAllDocuments(filtered);
}

export const duplicateDocument = async (id: string) : Promise<Document> => {
    await delay(500);
    const original = await fetchDocumentsById(id);
    if(!original) {
        throw new Error('Документ не найден');
    }
    const newDocument: Document ={
        ...original,
        id: generateId(),
        name: `${original.name} (копия)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    const docs = getAllDocuments();
    docs.push(newDocument);
    saveAllDocuments(docs);
    return newDocument;
}

export const createDocumentWithSize = async (
    name: string,
    rows: number = 100,
    cols: number = 26
) : Promise<Document> => {
    await delay(500);
    const newDocument: Document = {
        id: generateId(),
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {},
        rows: rows,
        cols: cols,
        preview: Array(3).fill(null).map(() => Array(3).fill(''))
    };
    const docs = getAllDocuments();
    docs.push(newDocument);
    saveAllDocuments(docs);
    return newDocument;
}