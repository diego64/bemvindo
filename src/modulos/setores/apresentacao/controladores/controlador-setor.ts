import type { CadastrarSetor } from '@/modulos/setores/aplicacao/casos-de-uso/cadastrar-setor'
import type { ListarSetores } from '@/modulos/setores/aplicacao/casos-de-uso/listar-setores'
import type { RespostaSetorDTO } from '@/modulos/setores/aplicacao/dtos/resposta-setor.dto'
import type { CadastrarSetorBody } from '@/modulos/setores/apresentacao/schemas/schema-setor'

export class ControladorSetor {
  constructor(
    private readonly cadastrarSetor: CadastrarSetor,
    private readonly listarSetores: ListarSetores,
  ) {}

  async cadastrar(body: CadastrarSetorBody, requisitanteId: string): Promise<RespostaSetorDTO> {
    return this.cadastrarSetor.executar({ nome: body.nome, requisitanteId })
  }

  async listar(): Promise<RespostaSetorDTO[]> {
    return this.listarSetores.executar()
  }
}
