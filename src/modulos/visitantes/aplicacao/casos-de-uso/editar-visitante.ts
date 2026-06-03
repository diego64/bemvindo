import { ObjectId } from 'mongodb'
import { ErroVisitanteNaoEncontrado } from '@/compartilhado/erros/erro-visitante-nao-encontrado'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import type { EntradaEditarVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/entrada-editar-visitante.dto'
import type { RespostaVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/resposta-visitante.dto'
import { visitanteParaDTO } from '@/modulos/visitantes/aplicacao/casos-de-uso/cadastrar-visitante'

export class EditarVisitante {
  constructor(private readonly repositorioVisitante: RepositorioVisitante) {}

  async executar(dados: EntradaEditarVisitanteDTO): Promise<RespostaVisitanteDTO> {
    const visitante = await this.repositorioVisitante.buscarPorId(new ObjectId(dados.id))
    if (!visitante) throw new ErroVisitanteNaoEncontrado()

    visitante.atualizar(
      {
        nomeCompleto: dados.nomeCompleto,
        telefone: dados.telefone,
        email: dados.email,
        dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : undefined,
        setorDestinoId: dados.setorDestinoId ? new ObjectId(dados.setorDestinoId) : undefined,
        observacao: dados.observacao,
      },
      dados.papel,
      new ObjectId(dados.requisitanteId),
    )

    await this.repositorioVisitante.atualizar(visitante)
    return visitanteParaDTO(visitante)
  }
}
