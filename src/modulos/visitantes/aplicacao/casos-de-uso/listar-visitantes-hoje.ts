import { ObjectId } from 'mongodb'
import type { RepositorioVisitante } from '@/modulos/visitantes/dominio/repositorios/repositorio-visitante'
import type { ServicoDominioVisitante } from '@/modulos/visitantes/dominio/servicos/servico-dominio-visitante'
import type { EntradaListarVisitantesHojeDTO } from '@/modulos/visitantes/aplicacao/dtos/entrada-listar-visitantes-hoje.dto'
import type { RespostaPaginadaVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/resposta-visitante.dto'
import { visitanteParaDTO } from '@/modulos/visitantes/aplicacao/casos-de-uso/cadastrar-visitante'

export class ListarVisitantesHoje {
  constructor(
    private readonly repositorioVisitante: RepositorioVisitante,
    private readonly servicoDominio: ServicoDominioVisitante,
  ) {}

  async executar(filtros: EntradaListarVisitantesHojeDTO): Promise<RespostaPaginadaVisitanteDTO> {
    const { inicioDia, fimDia } = this.servicoDominio.obterIntervaloHoje(new Date())

    const resultado = await this.repositorioVisitante.listarHoje({
      inicioDia,
      fimDia,
      setorDestinoId: filtros.setorDestinoId ? new ObjectId(filtros.setorDestinoId) : undefined,
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
