import { createAsyncThunk, createSlice , type PayloadAction} from "@reduxjs/toolkit";
import { type Document, type CreateDocument_t} from "../../types/document";
import { createDocument, createDocumentWithSize, deleteDocument, duplicateDocument, fetchDocuments, fetchDocumentsById, updateDocument } from "../../services/documentService";
interface DocumentsState {
    list: Document[];
    currentDocumentId: string | null;
    currentDocumentData: any;
    loading: boolean;
    error: string|null;
}

const initialState: DocumentsState = {
    list: [],
    currentDocumentId:null,
    currentDocumentData: {},
    loading:false,
    error:null,
};

export const loadDocuments = createAsyncThunk('documents/loadDocuments', 
    async() => {
        return await fetchDocuments();
    }
);

export const loadDocumentById = createAsyncThunk('documents/loadDocumentById',
    async (id:string) => {
        const doc = await fetchDocumentsById(id);
        return {
            id, data:doc?.data || {}, rows: doc?.rows, cols: doc?.cols
        };
    }
);

export const createNewDocument = createAsyncThunk('documents/createNewDocument',
    async({name,rows,cols} : CreateDocument_t) => {
        return await createDocumentWithSize(name,rows,cols);
    }
);

export const saveDocument = createAsyncThunk(
    'documents/saveDocument',
    async ( { id,data , preview}: {id:string; data:any ; preview?: string[][]}) => {
        await updateDocument(id,{data});
        if(preview) {
            await updateDocument(id,{preview});
        }
        return {
            id,data,preview
        };
    }
);

export const removeDocument = createAsyncThunk('documents/removeDocument',
    async(id:string) => {
        await deleteDocument(id);
        return id;
    }
);

export const duplicateDocumentThunk = createAsyncThunk('documents/duplicateDocument', 
    async(id:string) => {
        return await duplicateDocument(id);
    }
);

export const updateDocumentThunk = createAsyncThunk(
    'documents/updateDocument',
    async({id, name}: {id:string; name:string}) => {
        return await updateDocument(id,{name});
    }
)

const documentsSlice = createSlice( {
    name: 'documents',
    initialState,
    reducers: {
        setCurrentDocumentId: (state, action: PayloadAction<string|null>) => {
            state.currentDocumentId = action.payload;
        },
        setCurrentDocumentData: (state, action: PayloadAction<any>) => {
            state.currentDocumentData = action.payload;
        },
        clearCurrentDocument: (state) => {
            state.currentDocumentId = null;
            state.currentDocumentData = {};
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(loadDocuments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loadDocuments.fulfilled, (state,action) => {
            state.loading = false;
            state.list = action.payload;
        })
        .addCase(loadDocuments.rejected, (state,action) => {
            state.loading = false;
            state.error = action.error.message || 'Ошибка загрузки';
        })
        .addCase(loadDocumentById.fulfilled, (state,action) => {
            state.currentDocumentData = action.payload.data;
        })

        .addCase(createNewDocument.fulfilled,(state,action) => {
            state.list.push(action.payload);
            state.currentDocumentId = action.payload.id;
            state.currentDocumentData = {};
        })
        .addCase(removeDocument.fulfilled, (state, action) => {
            state.list = state.list.filter(doc => doc.id !== action.payload);
            if(state.currentDocumentId === action.payload) {
                state.currentDocumentId =null;
                state.currentDocumentData= {};
            }
        })
        .addCase(duplicateDocumentThunk.fulfilled, (state, action) => {
            state.list.push(action.payload);
        });
    },
});

export const { setCurrentDocumentId,setCurrentDocumentData, clearCurrentDocument} = documentsSlice.actions;
export default documentsSlice.reducer;