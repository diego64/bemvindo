import { ErroFiltroObrigatorio } from '@/compartilhado/erros/erro-filtro-obrigatorio'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import type { EntradaBuscarHistoricoVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/entrada-buscar-historico-visitante.dto'
import type { RespostaPaginadaVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/resposta-visitante.dto'
import { visitanteParaDTO } from '@/modulos/visitantes/aplicacao/casos-de-uso/cadastrar-visitante'

export class BuscarHistoricoVisitante {
  constructor(private readonly repositorioVisitante: RepositorioVisitante) {}

  async executar(filtros: EntradaBuscarHistoricoVisitanteDTO): Promise<RespostaPaginadaVisitanteDTO> {
    if (!filtros.cpf && !filtros.nomeCompleto) throw new ErroFiltroObrigatorio()

    const cpfNormalizado = filtros.cpf ? filtros.cpf.replace(/\D/g, '') : undefined

    const resultado = await this.repositorioVisitante.buscarHistorico({
      cpf: cpfNormalizado,
      nomeCompleto: filtros.nomeCompleto,
      pagina: filtros.pagina,
      itensPorPagina: filtros.itensPorPagina,
    })

    return {
      dados: resultado.visitantes.map(visitanteParaDTO),
      paginacao: {
        total: resultado.total,
        pagina: filtros.pagina,
        itensPorPagina: filtros.itensPorPagina,
        totalPaginas: Math.ceil(resultado.total / filtros.itensPorPagina),
      },
    }
  }
}
