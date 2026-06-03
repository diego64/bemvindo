import type { ObjectId } from 'mongodb'
import type { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'

export interface ListagemUsuarios {
  usuarios: Usuario[]
  total: number
}

export interface RepositorioUsuario {
  criar(usuario: Usuario): Promise<void>
  buscarPorEmail(email: string): Promise<Usuario | null>
  buscarPorId(id: ObjectId): Promise<Usuario | null>
  listar(pagina: number, itensPorPagina: number): Promise<ListagemUsuarios>
  atualizar(usuario: Usuario): Promise<void>
}
