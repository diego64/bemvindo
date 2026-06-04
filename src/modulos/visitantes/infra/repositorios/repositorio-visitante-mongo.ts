import type { Collection, Db, Filter, ObjectId } from 'mongodb'
import { Visitante } from '@/modulos/visitantes/dominio/entidades/visitante'
import type {
  FiltrosHistorico,
  FiltrosListagemHoje,
  RepositorioVisitante,
  ResultadoPaginado,
} from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'

interface DocumentoVisitante {
  _id: ObjectId
  codigoVisitante: string
  cpf: string
  nomeCompleto: string
  dataNascimento: Date
  telefone: string
  email: string
  setorDestinoId: ObjectId
  observacao: string | undefined
  recepcionistaId: ObjectId
  recepcionistaNome: string
  recepcionistaMatricula: string
  criadoEm: Date
  atualizadoEm: Date
  criadoPor: ObjectId
  atualizadoPor: ObjectId
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export class RepositorioVisitanteMongo implements RepositorioVisitante {
  private readonly colecao: Collection<DocumentoVisitante>

  constructor(bd: Db) {
    this.colecao = bd.collection<DocumentoVisitante>('visitantes')
  }

  async criarIndices(): Promise<void> {
    await this.colecao.createIndex({ cpf: 1 })
    await this.colecao.createIndex({ codigoVisitante: 1 }, { unique: true })
    await this.colecao.createIndex({ criadoEm: -1 })
  }

  async criar(visitante: Visitante): Promise<void> {
    await this.colecao.insertOne({
      _id: visitante.id,
      codigoVisitante: visitante.codigoVisitante,
      cpf: visitante.cpf,
      nomeCompleto: visitante.nomeCompleto,
      dataNascimento: visitante.dataNascimento,
      telefone: visitante.telefone,
      email: visitante.email,
      setorDestinoId: visitante.setorDestinoId,
      observacao: visitante.observacao,
      recepcionistaId: visitante.recepcionistaId,
      recepcionistaNome: visitante.recepcionistaNome,
      recepcionistaMatricula: visitante.recepcionistaMatricula,
      criadoEm: visitante.criadoEm,
      atualizadoEm: visitante.atualizadoEm,
      criadoPor: visitante.criadoPor,
      atualizadoPor: visitante.atualizadoPor,
    })
  }

  async buscarPorId(id: ObjectId): Promise<Visitante | null> {
    const doc = await this.colecao.findOne({ _id: id })
    return doc ? this.documentoParaEntidade(doc) : null
  }

  async buscarPorCpfEData(cpf: string, inicioDia: Date, fimDia: Date): Promise<Visitante | null> {
    const doc = await this.colecao.findOne({
      cpf,
      criadoEm: { $gte: inicioDia, $lte: fimDia },
    })
    return doc ? this.documentoParaEntidade(doc) : null
  }

  async atualizar(visitante: Visitante): Promise<void> {
    await this.colecao.updateOne(
      { _id: visitante.id },
      {
        $set: {
          nomeCompleto: visitante.nomeCompleto,
          telefone: visitante.telefone,
          email: visitante.email,
          dataNascimento: visitante.dataNascimento,
          setorDestinoId: visitante.setorDestinoId,
          observacao: visitante.observacao,
          atualizadoEm: visitante.atualizadoEm,
          atualizadoPor: visitante.atualizadoPor,
        },
      },
    )
  }

  async listarHoje(filtros: FiltrosListagemHoje): Promise<ResultadoPaginado> {
    const query: Filter<DocumentoVisitante> = {
      criadoEm: { $gte: filtros.inicioDia, $lte: filtros.fimDia },
    }
    if (filtros.setorDestinoId) query.setorDestinoId = filtros.setorDestinoId
    if (filtros.nomeCompleto) {
      query.nomeCompleto = { $regex: escaparRegex(filtros.nomeCompleto), $options: 'i' }
    }

    const skip = (filtros.pagina - 1) * filtros.itensPorPagina
    const [documentos, total] = await Promise.all([
      this.colecao.find(query).sort({ criadoEm: -1 }).skip(skip).limit(filtros.itensPorPagina).toArray(),
      this.colecao.countDocuments(query),
    ])

    return { visitantes: documentos.map((d) => this.documentoParaEntidade(d)), total }
  }

  async buscarHistorico(filtros: FiltrosHistorico): Promise<ResultadoPaginado> {
    const query: Filter<DocumentoVisitante> = {}
    if (filtros.cpf) query.cpf = filtros.cpf
    if (filtros.nomeCompleto) {
      query.nomeCompleto = { $regex: escaparRegex(filtros.nomeCompleto), $options: 'i' }
    }

    const skip = (filtros.pagina - 1) * filtros.itensPorPagina
    const [documentos, total] = await Promise.all([
      this.colecao.find(query).sort({ criadoEm: -1 }).skip(skip).limit(filtros.itensPorPagina).toArray(),
      this.colecao.countDocuments(query),
    ])

    return { visitantes: documentos.map((d) => this.documentoParaEntidade(d)), total }
  }

  private documentoParaEntidade(doc: DocumentoVisitante): Visitante {
    return new Visitante({
      id: doc._id,
      codigoVisitante: doc.codigoVisitante,
      cpf: doc.cpf,
      nomeCompleto: doc.nomeCompleto,
      dataNascimento: doc.dataNascimento,
      telefone: doc.telefone,
      email: doc.email,
      setorDestinoId: doc.setorDestinoId,
      observacao: doc.observacao,
      recepcionistaId: doc.recepcionistaId,
      recepcionistaNome: doc.recepcionistaNome,
      recepcionistaMatricula: doc.recepcionistaMatricula,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
      criadoPor: doc.criadoPor,
      atualizadoPor: doc.atualizadoPor,
    })
  }
}
