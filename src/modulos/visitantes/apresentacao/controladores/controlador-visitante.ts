import type { CadastrarVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/cadastrar-visitante'
import type { EditarVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/editar-visitante'
import type { ListarVisitantesHoje } from '@/modulos/visitantes/aplicacao/casos-de-uso/listar-visitantes-hoje'
import type { BuscarHistoricoVisitante } from '@/modulos/visitantes/aplicacao/casos-de-uso/buscar-historico-visitante'
import type { RespostaVisitanteDTO, RespostaPaginadaVisitanteDTO } from '@/modulos/visitantes/aplicacao/dtos/resposta-visitante.dto'
import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import type {
  CadastrarVisitanteBody,
  EditarVisitanteBody,
  ListarVisitantesHojeQuery,
  BuscarHistoricoVisitanteQuery,
} from '@/modulos/visitantes/apresentacao/schemas/schema-visitante'

export class ControladorVisitante {
  constructor(
    private readonly cadastrarVisitante: CadastrarVisitante,
    private readonly editarVisitante: EditarVisitante,
    private readonly listarVisitantesHoje: ListarVisitantesHoje,
    private readonly buscarHistoricoVisitante: BuscarHistoricoVisitante,
  ) {}

  async cadastrar(body: CadastrarVisitanteBody, requisitanteId: string): Promise<RespostaVisitanteDTO> {
    return this.cadastrarVisitante.executar({ ...body, requisitanteId })
  }

  async editar(
    id: string,
    body: EditarVisitanteBody,
    requisitanteId: string,
    papel: PapelUsuario,
  ): Promise<RespostaVisitanteDTO> {
    return this.editarVisitante.executar({ id, ...body, requisitanteId, papel })
  }

  async listarHoje(query: ListarVisitantesHojeQuery): Promise<RespostaPaginadaVisitanteDTO> {
    return this.listarVisitantesHoje.executar(query)
  }

  async buscarHistorico(query: BuscarHistoricoVisitanteQuery): Promise<RespostaPaginadaVisitanteDTO> {
    return this.buscarHistoricoVisitante.executar(query)
  }
}
