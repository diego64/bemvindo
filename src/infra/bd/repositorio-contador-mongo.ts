import type { Db } from 'mongodb'
import type { RepositorioContador } from '@/compartilhado/repositorios/repositorio-contador'

interface DocumentoContador {
  _id: string
  seq: number
}

export class RepositorioContadorMongo implements RepositorioContador {
  private readonly colecao

  constructor(bd: Db) {
    this.colecao = bd.collection<DocumentoContador>('contadores')
  }

  async proximoNumero(nome: string): Promise<number> {
    const resultado = await this.colecao.findOneAndUpdate(
      { _id: nome },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    )
    if (!resultado) throw new Error('Falha ao gerar próximo número do contador.')
    return resultado.seq
  }
}
