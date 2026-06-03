import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type {
  RespostaListaUsuariosDTO,
  RespostaUsuarioDTO,
} from '@/modulos/usuarios/aplicacao/dtos/resposta-usuario.dto'
import type { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'

export interface EntradaListarUsuariosDTO {
  readonly pagina: number
  readonly itensPorPagina: number
}

export class ListarUsuarios {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async executar(dados: EntradaListarUsuariosDTO): Promise<RespostaListaUsuariosDTO> {
    const { usuarios, total } = await this.repositorioUsuario.listar(
      dados.pagina,
      dados.itensPorPagina,
    )

    return {
      usuarios: usuarios.map((u) => this.mapearDTO(u)),
      paginacao: {
        total,
        pagina: dados.pagina,
        itensPorPagina: dados.itensPorPagina,
        totalPaginas: Math.ceil(total / dados.itensPorPagina),
      },
    }
  }

  private mapearDTO(usuario: Usuario): RespostaUsuarioDTO {
    return {
      id: usuario.id.toString(),
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      matricula: usuario.matricula,
      papel: usuario.papel,
      criadoEm: usuario.criadoEm.toISOString(),
      atualizadoEm: usuario.atualizadoEm.toISOString(),
    }
  }
}
