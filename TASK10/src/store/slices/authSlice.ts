import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt? : string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string|null;
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
}
interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false, 
    error:null,
};

let accessToken: string |null = null;

export const setTokens = (access: string, refresh: string) => {
    accessToken = access;
    localStorage.setItem('refreshToken',refresh);
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const clearTokens = () => {
    accessToken = null;
    localStorage.removeItem('refreshToken');
};

export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const token  = getAccessToken();
            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

const delay = (ms: number) => new Promise(resolve=> setTimeout(resolve, ms));
const MOCK_USERS_KEY ='mock_users';

const getMockUsers = (): any[] => {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ?JSON.parse(users): [];
};

const saveMockUsers =(users: any[])=> {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const initMockUsers= () => {
    const users = getMockUsers();
    if(users.length === 0) {
        saveMockUsers([
            {id:'1', name:'Тестовый Пользователь', email:'test@example.com', password:'password123'}
        ]);
    }
};
initMockUsers();

const mockRegister = async(data: RegisterData): Promise<AuthResponse>=> {
    console.log('mockRegister вызван', data.email);
    await delay(500);
    
    const users = getMockUsers();
    const existing = users.find((u: any)=> u.email === data.email);
    if(existing){
        throw new Error('Пользователь с таким email уже существует');
    }
    const newUser = {
        id: String(Date.now()),
        name: data.name,
        email: data.email,
        password: data.password,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveMockUsers(users);
    const newAccessToken = `mock_access_${newUser.id}_${Date.now()}`;
    const newRefreshToken = `mock_refresh_${newUser.id}_${Date.now()}`;

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        }
    };
};

const mockLogin = async(data: LoginData): Promise<AuthResponse>=> {
    console.log('mockLogin вызван', data.email);
    await delay(500);
    const users = getMockUsers();
    const user = users.find((u: any)=> u.email === data.email && u.password === data.password);
    if(!user) {
        throw new Error('Неверный email или пароль');
    }
    const newAccessToken = `mock_access_${user.id}_${Date.now()}`;
    const newRefreshToken = `mock_refresh_${user.id}_${Date.now()}`;
    
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }
    };
};

export const loginThunk = createAsyncThunk(
    'auth/login',
    async ( data: LoginData, { rejectWithValue}) => {
        try {
            const response = await mockLogin(data);
            const { accessToken,refreshToken, user} = response;
            setTokens(accessToken, refreshToken);
            return user;
        } catch(error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка входа');        
        }
    }
);

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (data: RegisterData, { rejectWithValue}) => {
        try{
            const response  = await mockRegister(data);
            const { accessToken, refreshToken, user} = response;
            setTokens(accessToken, refreshToken);
            return user;
        } catch(error: any){
            return rejectWithValue(error.response?.data?.message || 'Ошибка регистрации');
        }
    }
);

export const logoutThunk = createAsyncThunk (
    'auth/logout',
    async() => {
        clearTokens();
        localStorage.removeItem('spreadsheet_current_user');
        localStorage.removeItem('spreadsheet_current_user_name');
        localStorage.removeItem('refreshToken');
    }
);

export const refreshTokenThunk = createAsyncThunk(
    'auth/refresh',
    async(_, {rejectWithValue}) => {
        try {
            const refreshToken = getRefreshToken();
            if(!refreshToken) {
                throw new Error('Нет refresh токена');
            }
            const match = refreshToken.match(/mock_refresh_(.+)_/);
            if(match) {
                const userId = match[1];
                const newAccessToken = `mock_access_${userId}_${Date.now()}`;
                accessToken = newAccessToken;
                return newAccessToken;
            }
            throw new Error('Неверный refresh токен');
        } catch(error: any) {
            clearTokens();
            return rejectWithValue(error.message || 'Ошибка обновления токена');
        }
    }
);

export const updateUserName = createAsyncThunk(
    'auth/updateName',
    async (newName: string, { rejectWithValue, getState }) => {
        try {
            await delay(500);
            const state = getState() as any;
            const currentUser = state.auth.user;
            if(!currentUser) throw new Error('Пользователь не найден');
            const users = getMockUsers();
            const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
            if(userIndex === -1) throw new Error('Пользователь не найден');
            users[userIndex].name = newName;
            saveMockUsers(users);
            return { ...currentUser, name: newName};
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка обновления имени');
        }
    }
);

export const updatePassword = createAsyncThunk(
    'auth/updatePassword',
    async({ oldPassword, newPassword } : { oldPassword: string; newPassword: string}, { rejectWithValue, getState}) => {
        try {
            await delay(500);
            const state = getState() as any;
            const currentUser = state.auth.user;
            if(!currentUser) throw new Error('Пользователь не найден');
            const users = getMockUsers();
            const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
            if(userIndex === -1)throw new Error('Пользователь не найден');
            if(users[userIndex].password !== oldPassword){
                throw new Error('Неверный старый пароль');
            }
            users[userIndex].password = newPassword;
            saveMockUsers(users);
            return true;
        } catch (error:any){
            return rejectWithValue(error.message || 'Ошибка смены пароля');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User| null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state,action: PayloadAction<string | null>)=> {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state,action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                localStorage.setItem('spreadsheet_current_user', action.payload.id);
                localStorage.setItem('spreadsheet_current_user_name', action.payload.name);
                localStorage.setItem('spreadsheet_current_user_email', action.payload.email);
                localStorage.setItem('spreadsheet_current_user_createdAt', action.payload.createdAt || '');
            })
            .addCase(loginThunk.rejected, (state,action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                localStorage.setItem('spreadsheet_current_user', action.payload.id);
                localStorage.setItem('spreadsheet_current_user_name', action.payload.name);
                localStorage.setItem('spreadsheet_current_user_email', action.payload.email);
                localStorage.setItem('spreadsheet_current_user_createdAt', action.payload.createdAt || '');
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                localStorage.removeItem('spreadsheet_current_user');
                localStorage.removeItem('spreadsheet_current_user_name');
                localStorage.removeItem('spreadsheet_current_user_email');
                localStorage.removeItem('spreadsheet_current_user_createdAt');
                localStorage.removeItem('refreshToken');
            })
            .addCase(updateUserName.fulfilled, (state, action) => {
                state.user = action.payload;
                localStorage.setItem('spreadsheet_current_user_name', action.payload.name);
            })
            .addCase(updateUserName.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(updatePassword.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});
export const { setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;