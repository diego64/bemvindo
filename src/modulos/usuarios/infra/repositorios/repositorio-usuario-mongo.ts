import type { Db, Collection, ObjectId } from 'mongodb'
import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import type {
  RepositorioUsuario,
  ListagemUsuarios,
} from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'

interface DocumentoUsuario {
  _id: ObjectId
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

export class RepositorioUsuarioMongo implements RepositorioUsuario {
  private readonly colecao: Collection<DocumentoUsuario>

  constructor(bd: Db) {
    this.colecao = bd.collection<DocumentoUsuario>('usuarios')
  }

  async criarIndices(): Promise<void> {
    await this.colecao.createIndex({ email: 1 }, { unique: true })
    await this.colecao.createIndex({ matricula: 1 }, { unique: true })
  }

  async criar(usuario: Usuario): Promise<void> {
    await this.colecao.insertOne({
      _id: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      telefone: usuario.telefone,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      matricula: usuario.matricula,
      papel: usuario.papel,
      criadoEm: usuario.criadoEm,
      atualizadoEm: usuario.atualizadoEm,
      criadoPor: usuario.criadoPor,
      atualizadoPor: usuario.atualizadoPor,
    })
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const doc = await this.colecao.findOne({ email })
    return doc ? this.documentoParaEntidade(doc) : null
  }

  async buscarPorId(id: ObjectId): Promise<Usuario | null> {
    const doc = await this.colecao.findOne({ _id: id })
    return doc ? this.documentoParaEntidade(doc) : null
  }

  async listar(pagina: number, itensPorPagina: number): Promise<ListagemUsuarios> {
    const salto = (pagina - 1) * itensPorPagina
    const [documentos, total] = await Promise.all([
      this.colecao
        .find()
        .sort({ criadoEm: -1 })
        .skip(salto)
        .limit(itensPorPagina)
        .toArray(),
      this.colecao.countDocuments(),
    ])
    return { usuarios: documentos.map((d) => this.documentoParaEntidade(d)), total }
  }

  async atualizar(usuario: Usuario): Promise<void> {
    await this.colecao.updateOne(
      { _id: usuario.id },
      {
        $set: {
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          telefone: usuario.telefone,
          atualizadoEm: usuario.atualizadoEm,
          atualizadoPor: usuario.atualizadoPor,
        },
      },
    )
  }

  private documentoParaEntidade(doc: DocumentoUsuario): Usuario {
    return new Usuario({
      id: doc._id,
      nome: doc.nome,
      sobrenome: doc.sobrenome,
      telefone: doc.telefone,
      email: doc.email,
      senhaHash: doc.senhaHash,
      matricula: doc.matricula,
      papel: doc.papel,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
      criadoPor: doc.criadoPor,
      atualizadoPor: doc.atualizadoPor,
    })
  }
}
