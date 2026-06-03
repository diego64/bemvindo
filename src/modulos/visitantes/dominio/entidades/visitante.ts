import type { ObjectId } from 'mongodb'
import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { PapelUsuario as Papel } from '@/compartilhado/tipos/papel-usuario'
import { ErroVisitanteNaoPodeSerEditado } from '@/compartilhado/erros/erro-visitante-nao-pode-ser-editado'
import { Cpf } from '@/modulos/visitantes/dominio/value-objects/cpf'
import { CodigoVisitante } from '@/modulos/visitantes/dominio/value-objects/codigo-visitante'

export interface DadosVisitante {
  id: ObjectId
  codigoVisitante: string
  cpf: string
  nomeCompleto: string
  dataNascimento: Date
  telefone: string
  email: string
  setorDestinoId: ObjectId
  observacao?: string | undefined
  recepcionistaId: ObjectId
  recepcionistaNome: string
  recepcionistaMatricula: string
  criadoEm: Date
  atualizadoEm: Date
  criadoPor: ObjectId
  atualizadoPor: ObjectId
}

export interface DadosAtualizacaoVisitante {
  nomeCompleto?: string | undefined
  telefone?: string | undefined
  email?: string | undefined
  dataNascimento?: Date | undefined
  setorDestinoId?: ObjectId | undefined
  observacao?: string | null | undefined
}

export class Visitante {
  private readonly _id: ObjectId
  private readonly _codigoVisitante: CodigoVisitante
  private readonly _cpf: Cpf
  private _nomeCompleto: string
  private _dataNascimento: Date
  private _telefone: string
  private _email: string
  private _setorDestinoId: ObjectId
  private _observacao: string | undefined
  private readonly _recepcionistaId: ObjectId
  private readonly _recepcionistaNome: string
  private readonly _recepcionistaMatricula: string
  private readonly _criadoEm: Date
  private _atualizadoEm: Date
  private readonly _criadoPor: ObjectId
  private _atualizadoPor: ObjectId

  constructor(dados: DadosVisitante) {
    if (!dados.nomeCompleto || dados.nomeCompleto.trim().length < 3) {
      throw new Error('Nome completo deve ter no mínimo 3 caracteres.')
    }
    this._id = dados.id
    this._codigoVisitante = new CodigoVisitante(dados.codigoVisitante)
    this._cpf = new Cpf(dados.cpf)
    this._nomeCompleto = dados.nomeCompleto.trim()
    this._dataNascimento = dados.dataNascimento
    this._telefone = dados.telefone
    this._email = dados.email.toLowerCase().trim()
    this._setorDestinoId = dados.setorDestinoId
    this._observacao = dados.observacao
    this._recepcionistaId = dados.recepcionistaId
    this._recepcionistaNome = dados.recepcionistaNome
    this._recepcionistaMatricula = dados.recepcionistaMatricula
    this._criadoEm = dados.criadoEm
    this._atualizadoEm = dados.atualizadoEm
    this._criadoPor = dados.criadoPor
    this._atualizadoPor = dados.atualizadoPor
  }

  atualizar(novosDados: DadosAtualizacaoVisitante, papel: PapelUsuario, atualizadoPorId: ObjectId): void {
    if (papel === Papel.RECEPCIONISTA && this.foiCriadoHaMaisDe30Minutos()) {
      throw new ErroVisitanteNaoPodeSerEditado()
    }
    if (novosDados.nomeCompleto !== undefined) {
      if (novosDados.nomeCompleto.trim().length < 3) {
        throw new Error('Nome completo deve ter no mínimo 3 caracteres.')
      }
      this._nomeCompleto = novosDados.nomeCompleto.trim()
    }
    if (novosDados.telefone !== undefined) this._telefone = novosDados.telefone
    if (novosDados.email !== undefined) this._email = novosDados.email.toLowerCase().trim()
    if (novosDados.dataNascimento !== undefined) this._dataNascimento = novosDados.dataNascimento
    if (novosDados.setorDestinoId !== undefined) this._setorDestinoId = novosDados.setorDestinoId
    if ('observacao' in novosDados) this._observacao = novosDados.observacao ?? undefined
    this._atualizadoEm = new Date()
    this._atualizadoPor = atualizadoPorId
  }

  private foiCriadoHaMaisDe30Minutos(): boolean {
    return Date.now() - this._criadoEm.getTime() > 30 * 60 * 1000
  }

  get id(): ObjectId { return this._id }
  get codigoVisitante(): string { return this._codigoVisitante.valor }
  get cpf(): string { return this._cpf.valor }
  get nomeCompleto(): string { return this._nomeCompleto }
  get dataNascimento(): Date { return this._dataNascimento }
  get telefone(): string { return this._telefone }
  get email(): string { return this._email }
  get setorDestinoId(): ObjectId { return this._setorDestinoId }
  get observacao(): string | undefined { return this._observacao }
  get recepcionistaId(): ObjectId { return this._recepcionistaId }
  get recepcionistaNome(): string { return this._recepcionistaNome }
  get recepcionistaMatricula(): string { return this._recepcionistaMatricula }
  get criadoEm(): Date { return this._criadoEm }
  get atualizadoEm(): Date { return this._atualizadoEm }
  get criadoPor(): ObjectId { return this._criadoPor }
  get atualizadoPor(): ObjectId { return this._atualizadoPor }
}
