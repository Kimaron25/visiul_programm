import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email:  string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email : string;
    };
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
export const setToken = (access: string, refresh : string) => {
    accessToken = access;
    refreshToken = refresh;
    localStorage.setItem('refreshToken', refresh);
};

export const getAccessToken=() => accessToken;

export const getRefreshToken = () =>  localStorage.getItem('refreshToken');

export const clearTokens = () => {
    accessToken =null;
    refreshToken = null;
    localStorage.removeItem('refreshToken');
};

const delay  = (ms: number) => new Promise(resolve =>  setTimeout(resolve,ms));

let mockUsers: any[] = [
    { id: '1', name :'Тестовый Пользователь', email: 'test@example.com', password: 'password123'}
];

export const register = async (data:RegisterData) : Promise<AuthResponse> => {
    await delay(500);
    const existingUser = mockUsers.find(u => u.email ===  data.email) ;
    if( existingUser){
        throw new Error('Пользователь с таким email уже существует');
    }

    const newUser = {
        id: String(mockUsers.length + 1),
        name: data.name,
        email: data.email,
        password: data.password
    };
    mockUsers.push(newUser);

    const accessToken = `mock_access_${newUser.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${newUser.id}_${Date.now()}`;
    return {
        accessToken,
        refreshToken,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    };
};

export const login = async(data: LoginData): Promise<AuthResponse> => {
    await delay(500);
    const user = mockUsers.find(u => u.email === data.email && u.password === data.password);
    if( !user ){
        throw new Error('Неверный email или пароль');
    }
    const accessToken = `mock_access_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    };
};

export const refreshAccessToken = async() : Promise<string> => {
    await delay(300);
    const storedRefresh = getRefreshToken();
    if(!storedRefresh) {
        throw new Error('No refresh token');
    }
    const match = storedRefresh.match(/mock_refresh_(.+)_/);
    if(!match){
        throw new Error('Invalid refresh token');
    }
    const userId = match[1];
    const newAccessToken = `mock_access_${userId}_${Date.now()}`;
    return newAccessToken;
};

export const isAuthenticated = (): boolean => {
    return !!accessToken || !!localStorage.getItem('refreshToken');
};

export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if(token) {
                config.headers.Authorization =`Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};