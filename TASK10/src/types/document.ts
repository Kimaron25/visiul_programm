export interface Document {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    data: any;
    rows?: number;
    cols?: number;
    preview?: string[][];

}

export interface CreateDocument_t {
    name: string;
    rows: number;
    cols: number;
}

export interface UpdateDocument_t {
    name?: string;
    data?: any;
    preview?: string[][];
}