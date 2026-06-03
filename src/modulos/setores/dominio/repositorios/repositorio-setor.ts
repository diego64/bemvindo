import type { ObjectId } from 'mongodb'
import type { Setor } from '@/modulos/setores/dominio/entidades/setor'

export interface RepositorioSetor {
  criar(setor: Setor): Promise<void>
  buscarPorId(id: ObjectId): Promise<Setor | null>
  buscarPorNome(nome: string): Promise<Setor | null>
  listar(): Promise<Setor[]>
}
