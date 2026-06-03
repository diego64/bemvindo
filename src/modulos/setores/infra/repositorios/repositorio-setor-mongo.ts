import type { Collection, Db, ObjectId } from 'mongodb'
import { Setor } from '@/modulos/setores/dominio/entidades/setor'
import type { RepositorioSetor } from '@/modulos/setores/dominio/repositorios/repositorio-setor'

interface DocumentoSetor {
  _id: ObjectId
  nome: string
  criadoEm: Date
  atualizadoEm: Date
  criadoPor: ObjectId
  atualizadoPor: ObjectId
}

export class RepositorioSetorMongo implements RepositorioSetor {
  private readonly colecao: Collection<DocumentoSetor>

  constructor(bd: Db) {
    this.colecao = bd.collection<DocumentoSetor>('setores')
  }

  async criarIndices(): Promise<void> {
    await this.colecao.createIndex({ nome: 1 }, { unique: true })
  }

  async criar(setor: Setor): Promise<void> {
    await this.colecao.insertOne({
      _id: setor.id,
      nome: setor.nome,
      criadoEm: setor.criadoEm,
      atualizadoEm: setor.atualizadoEm,
      criadoPor: setor.criadoPor,
      atualizadoPor: setor.atualizadoPor,
    })
  }

  async buscarPorId(id: ObjectId): Promise<Setor | null> {
    const doc = await this.colecao.findOne({ _id: id })
    return doc ? this.documentoParaEntidade(doc) : null
  }

  async buscarPorNome(nome: string): Promise<Setor | null> {
    const doc = await this.colecao.findOne({ nome })
    return doc ? this.documentoParaEntidade(doc) : null
  }

  async listar(): Promise<Setor[]> {
    const documentos = await this.colecao.find().sort({ nome: 1 }).toArray()
    return documentos.map((d) => this.documentoParaEntidade(d))
  }

  private documentoParaEntidade(doc: DocumentoSetor): Setor {
    return new Setor({
      id: doc._id,
      nome: doc.nome,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
      criadoPor: doc.criadoPor,
      atualizadoPor: doc.atualizadoPor,
    })
  }
}
