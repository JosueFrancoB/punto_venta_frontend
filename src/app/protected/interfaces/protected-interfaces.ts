
export interface UserBody{
    nombre: string;
    correo: string;
    password?: string;
    estado?: boolean;
    rol?: string;
    img?: string;
}

export interface UserData{
    usuarios: Array<UserBody>;
    total: number;
}

export interface CategoriasData{
    categorias: Array<CategoriasBody>;
    total: number;
}

export interface CategoriasBody{
    nombre: string;
}

export interface ProductosData{
    productos: Array<ProductosBody>;
    total: number;
}

export interface ProductosBody{
    nombre: string;
    categoria: string;
}