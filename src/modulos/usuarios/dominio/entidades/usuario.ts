import type { ObjectId } from 'mongodb'
import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { Email } from '@/modulos/usuarios/dominio/value-objects/email'
import { Telefone } from '@/modulos/usuarios/dominio/value-objects/telefone'
import { Matricula } from '@/modulos/usuarios/dominio/value-objects/matricula'

export interface DadosUsuario {
  id: ObjectId
  nome: string
  sobrenome: string
  telefone: string
  email: string
  senhaHash: string
  matricula: string
  papel: PapelUsuario
  criadoEm: Date
  atualizadoEm: Date
  criadoPor: ObjectId
  atualizadoPor: ObjectId
}

export interface DadosAtualizacaoUsuario {
  nome?: string
  sobrenome?: string
  telefone?: string
  papel?: PapelUsuario
}

export class Usuario {
  private readonly _id: ObjectId
  private _nome: string
  private _sobrenome: string
  private _telefone: Telefone
  private readonly _email: Email
  private _senhaHash: string
  private readonly _matricula: Matricula
  private readonly _papel: PapelUsuario
  private readonly _criadoEm: Date
  private _atualizadoEm: Date
  private readonly _criadoPor: ObjectId
  private _atualizadoPor: ObjectId

  constructor(dados: DadosUsuario) {
    if (!dados.nome || dados.nome.trim().length < 2) {
      throw new Error('Nome deve ter no mínimo 2 caracteres.')
    }
    if (!dados.sobrenome || dados.sobrenome.trim().length < 2) {
      throw new Error('Sobrenome deve ter no mínimo 2 caracteres.')
    }

    this._id = dados.id
    this._nome = dados.nome.trim()
    this._sobrenome = dados.sobrenome.trim()
    this._telefone = new Telefone(dados.telefone)
    this._email = new Email(dados.email)
    this._senhaHash = dados.senhaHash
    this._matricula = new Matricula(dados.matricula)
    this._papel = dados.papel
    this._criadoEm = dados.criadoEm
    this._atualizadoEm = dados.atualizadoEm
    this._criadoPor = dados.criadoPor
    this._atualizadoPor = dados.atualizadoPor
  }

  atualizar(novosDados: DadosAtualizacaoUsuario, atualizadoPorId: ObjectId): void {
    if (novosDados.nome !== undefined) {
      if (novosDados.nome.trim().length < 2) throw new Error('Nome deve ter no mínimo 2 caracteres.')
      this._nome = novosDados.nome.trim()
    }
    if (novosDados.sobrenome !== undefined) {
      if (novosDados.sobrenome.trim().length < 2)
        throw new Error('Sobrenome deve ter no mínimo 2 caracteres.')
      this._sobrenome = novosDados.sobrenome.trim()
    }
    if (novosDados.telefone !== undefined) {
      this._telefone = new Telefone(novosDados.telefone)
    }
    this._atualizadoEm = new Date()
    this._atualizadoPor = atualizadoPorId
  }

  get id(): ObjectId {
    return this._id
  }
  get nome(): string {
    return this._nome
  }
  get sobrenome(): string {
    return this._sobrenome
  }
  get telefone(): string {
    return this._telefone.valor
  }
  get email(): string {
    return this._email.valor
  }
  get senhaHash(): string {
    return this._senhaHash
  }
  set senhaHash(hash: string) {
    this._senhaHash = hash
  }
  get matricula(): string {
    return this._matricula.valor
  }
  get papel(): PapelUsuario {
    return this._papel
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
