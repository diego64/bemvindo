import type { RepositorioSetor } from '@/modulos/setores/dominio/repositorios/repositorio-setor'
import type { RespostaSetorDTO } from '@/modulos/setores/aplicacao/dtos/resposta-setor.dto'

export class ListarSetores {
  constructor(private readonly repositorioSetor: RepositorioSetor) {}

  async executar(): Promise<RespostaSetorDTO[]> {
    const setores = await this.repositorioSetor.listar()

    return setores.map((s) => ({
      id: s.id.toString(),
      nome: s.nome,
      criadoEm: s.criadoEm.toISOString(),
    }))
  }
}
