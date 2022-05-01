
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
    _id?: string;
    nombre?: string;
    clave?: string;
    clave_alterna?: string;
    estado?: boolean;
    precio_compra?: number;
    precio_venta?: number;
    unidad_venta?: string;
    unidad_compra?: string;
    factor?: number;
    categoria?: string;
    descripcion?: string;
    disponible?: boolean;
    img?: string;
    granel?: boolean;
    almacen?: string;
    inventario_max?: number;
    inventario_min?: number;
    proveedor?:string;
    existencias?:number;

}


export interface ClientesData{
    clientes: Array<ClientesBody>;
    total: number;
}

export interface ClientesBody{
    _id?: string;
    nombre?: string;
    nombre_empresa?: string;
    telefonos?: Array<string|undefined>;
    correos?: Array<string|undefined>;
    img?: string;
    direcciones?: Array<string|undefined>;
}

export interface NewClientesBody{
    _id?: string;
    nombre?: string;
    nombre_empresa?: string;
    telefono?: string;
    correo?: string;
    rfc?: string;
    img?: string;
    direccion?: string;
}

export interface ProveedoresData{
    proveedores: Array<ProveedoresBody>;
    total: number;
}

export interface ProveedoresBody{
    _id?: string;
    nombre_contacto?: string;
    nombre_empresa?: string;
    telefonos?: Array<string|undefined>;
    correos?: Array<string|undefined>;
    rfc?: string;
    img?: string;
    direcciones?: Array<string|undefined>;
}
export interface NewProveedoresBody{
    _id?: string;
    nombre_contacto?: string;
    nombre_empresa?: string;
    telefono?: string;
    correo?: string;
    rfc?: string;
    img?: string;
    direccion?: string;
}

export interface UnitsBody{
    _id?: string;
    nombre?:string;
    abreviacion?:string;
}

export interface UnitsData{
    unidades: Array<UnitsBody>;
    total: number;
}

export interface WarehouseBody{
    _id?: string;
    nombre?:string;
    alias?:string;
    deshabilitado?:boolean;
}

export interface WarehouseData{
    almacenes: Array<WarehouseBody>;
    total: number;
}