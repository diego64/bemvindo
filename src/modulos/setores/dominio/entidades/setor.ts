import type { ObjectId } from 'mongodb'
import { ErroNomeSetorInvalido } from '@/compartilhado/erros/erro-nome-setor-invalido'

export interface DadosSetor {
  id: ObjectId
  nome: string
  criadoEm: Date
  atualizadoEm: Date
  criadoPor: ObjectId
  atualizadoPor: ObjectId
}

export class Setor {
  private readonly _id: ObjectId
  private _nome: string
  private readonly _criadoEm: Date
  private _atualizadoEm: Date
  private readonly _criadoPor: ObjectId
  private _atualizadoPor: ObjectId

  constructor(dados: DadosSetor) {
    if (!dados.nome || dados.nome.trim().length < 2) throw new ErroNomeSetorInvalido()
    this._id = dados.id
    this._nome = dados.nome.trim()
    this._criadoEm = dados.criadoEm
    this._atualizadoEm = dados.atualizadoEm
    this._criadoPor = dados.criadoPor
    this._atualizadoPor = dados.atualizadoPor
  }

  get id(): ObjectId {
    return this._id
  }
  get nome(): string {
    return this._nome
  }
  get criadoEm(): Date {
    return this._criadoEm
  }
  get atualizadoEm(): Date {
    return this._atualizadoEm
  }
  get criadoPor(): ObjectId {
    return this._criadoPor
  }
  get atualizadoPor(): ObjectId {
    return this._atualizadoPor
  }
}
