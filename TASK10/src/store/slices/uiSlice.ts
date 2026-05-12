import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    isCreateModalOpen: boolean;
    saveStatus: 'idle' |'saving' | 'saved'|'error';
    notification: string |null;
}
const initialState: UiState = {
    isCreateModalOpen: false,
    saveStatus: 'idle',
    notification: null,
};

const uiSlice = createSlice( {
    name: 'ui',
    initialState,
    reducers: {
        setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isCreateModalOpen = action.payload;
        },
        setSaveStatus: (state, action: PayloadAction<UiState['saveStatus']>) => {
            state.saveStatus = action.payload;
        },
        setNotification: (state, action: PayloadAction<string | null>) => {
            state.notification = action.payload;
        },
        clearNotification: (state) => {
            state.notification = null;
        },
    },
});

export const { setCreateModalOpen, setSaveStatus, setNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;