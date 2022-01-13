
export interface AuthResponse{
    ok: boolean,
    rol?:string,
    estado?:boolean,
    google?:boolean,
    nombre?:string,
    correo?:string,
    uid?:string,
    token?: string,
    msg?: string
}

export interface Usuario{
    uid?:string,
    nombre?:string,
    picture?: string,
}