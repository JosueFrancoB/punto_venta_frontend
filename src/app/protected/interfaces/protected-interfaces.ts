
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
    clave: string;
    clave_alterna: string;
    estado: boolean;
    precio_compra: number;
    precio_venta: number;
    unidad_venta: string;
    unidad_compra: string;
    factor: number;
    categoria: Object;
    descripcion: string;
    disponible: boolean;
    img: string;
    granel: boolean;
    inventario_max: number;
    inventario_min: number;
    proveedor:Object;
    existencias:number;

}