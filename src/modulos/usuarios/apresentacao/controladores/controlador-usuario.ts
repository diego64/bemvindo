import type { CadastrarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/cadastrar-usuario'
import type { ListarUsuarios } from '@/modulos/usuarios/aplicacao/casos-de-uso/listar-usuarios'
import type { AtualizarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/atualizar-usuario'
import type { RespostaUsuarioDTO, RespostaListaUsuariosDTO } from '@/modulos/usuarios/aplicacao/dtos/resposta-usuario.dto'
import type { CadastrarUsuarioBody, AtualizarUsuarioBody, PaginacaoQuery } from '@/modulos/usuarios/apresentacao/schemas/schema-usuario'

export class ControladorUsuario {
  constructor(
    private readonly cadastrarUsuario: CadastrarUsuario,
    private readonly listarUsuarios: ListarUsuarios,
    private readonly atualizarUsuario: AtualizarUsuario,
  ) {}

  async cadastrar(body: CadastrarUsuarioBody, requisitanteId: string): Promise<RespostaUsuarioDTO> {
    return this.cadastrarUsuario.executar({
      nome: body.nome,
      sobrenome: body.sobrenome,
      telefone: body.telefone,
      email: body.email,
      senha: body.senha,
      papel: body.papel,
      requisitanteId,
    })
  }

  async listar(query: PaginacaoQuery): Promise<RespostaListaUsuariosDTO> {
    return this.listarUsuarios.executar({
      pagina: query.pagina,
      itensPorPagina: query.itensPorPagina,
    })
  }

  async atualizar(id: string, body: AtualizarUsuarioBody, requisitanteId: string): Promise<RespostaUsuarioDTO> {
    return this.atualizarUsuario.executar({
      id,
      requisitanteId,
      ...(body.nome !== undefined && { nome: body.nome }),
      ...(body.sobrenome !== undefined && { sobrenome: body.sobrenome }),
      ...(body.telefone !== undefined && { telefone: body.telefone }),
    })
  }
}
