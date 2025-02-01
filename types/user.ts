export enum Role {
  USER = 'user',
  ADMIN = 'ADMIN',
  ATTENDANT = 'atendente',
  COORDINATOR = 'coordenador',
}

export interface User {
  fullname: string
  document: string
  phoneNumber: string
  email: string
  password: string
  role?: Role
}
