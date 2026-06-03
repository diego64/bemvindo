import { ObjectId } from 'mongodb'
import { ErroNomeSetorJaCadastrado } from '@/compartilhado/erros/erro-nome-setor-ja-cadastrado'
import { Setor } from '@/modulos/setores/dominio/entidades/setor'
import type { RepositorioSetor } from '@/modulos/setores/dominio/repositorios/repositorio-setor'
import type { EntradaCadastrarSetorDTO } from '@/modulos/setores/aplicacao/dtos/entrada-cadastrar-setor.dto'
import type { RespostaSetorDTO } from '@/modulos/setores/aplicacao/dtos/resposta-setor.dto'

export class CadastrarSetor {
  constructor(private readonly repositorioSetor: RepositorioSetor) {}

  async executar(dados: EntradaCadastrarSetorDTO): Promise<RespostaSetorDTO> {
    const nomeNormalizado = dados.nome.trim()

    const existente = await this.repositorioSetor.buscarPorNome(nomeNormalizado)
    if (existente) throw new ErroNomeSetorJaCadastrado()

    const agora = new Date()
    const requisitanteObjectId = new ObjectId(dados.requisitanteId)
    const id = new ObjectId()

    const setor = new Setor({
      id,
      nome: nomeNormalizado,
      criadoEm: agora,
      atualizadoEm: agora,
      criadoPor: requisitanteObjectId,
      atualizadoPor: requisitanteObjectId,
    })

    await this.repositorioSetor.criar(setor)

    return {
      id: setor.id.toString(),
      nome: setor.nome,
      criadoEm: setor.criadoEm.toISOString(),
    }
  }
}
