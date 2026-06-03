import { ObjectId } from 'mongodb'
import { ErroUsuarioNaoEncontrado } from '@/compartilhado/erros/erro-usuario-nao-encontrado'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type {
  EntradaAtualizarUsuarioDTO,
} from '@/modulos/usuarios/aplicacao/dtos/entrada-atualizar-usuario.dto'
import type { RespostaUsuarioDTO } from '@/modulos/usuarios/aplicacao/dtos/resposta-usuario.dto'

export class AtualizarUsuario {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async executar(dados: EntradaAtualizarUsuarioDTO): Promise<RespostaUsuarioDTO> {
    if (!ObjectId.isValid(dados.id)) throw new ErroUsuarioNaoEncontrado()

    const usuario = await this.repositorioUsuario.buscarPorId(new ObjectId(dados.id))
    if (!usuario) throw new ErroUsuarioNaoEncontrado()

    usuario.atualizar(
      {
        ...(dados.nome !== undefined && { nome: dados.nome }),
        ...(dados.sobrenome !== undefined && { sobrenome: dados.sobrenome }),
        ...(dados.telefone !== undefined && { telefone: dados.telefone }),
      },
      new ObjectId(dados.requisitanteId),
    )

    await this.repositorioUsuario.atualizar(usuario)

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
