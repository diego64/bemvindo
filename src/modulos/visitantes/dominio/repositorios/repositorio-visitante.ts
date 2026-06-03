import type { ObjectId } from 'mongodb'
import type { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'

export interface FiltrosListagemHoje {
  inicioDia: Date
  fimDia: Date
  setorDestinoId?: ObjectId | undefined
  nomeCompleto?: string | undefined
  pagina: number
  itensPorPagina: number
}

export interface FiltrosHistorico {
  cpf?: string | undefined
  nomeCompleto?: string | undefined
  pagina: number
  itensPorPagina: number
}

export interface ResultadoPaginado {
  visitantes: Visitante[]
  total: number
}

export interface RepositorioVisitante {
  criar(visitante: Visitante): Promise<void>
  buscarPorId(id: ObjectId): Promise<Visitante | null>
  buscarPorCpfEData(cpf: string, inicioDia: Date, fimDia: Date): Promise<Visitante | null>
  atualizar(visitante: Visitante): Promise<void>
  listarHoje(filtros: FiltrosListagemHoje): Promise<ResultadoPaginado>
  buscarHistorico(filtros: FiltrosHistorico): Promise<ResultadoPaginado>
}
