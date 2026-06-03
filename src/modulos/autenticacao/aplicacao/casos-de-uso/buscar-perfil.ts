import { ObjectId } from 'mongodb'
import { ErroUsuarioNaoEncontrado } from '@/compartilhado/erros/erro-usuario-nao-encontrado'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { RespostaPerfilDTO } from '@/modulos/autenticacao/aplicacao/dtos/resposta-autenticacao.dto'

export class BuscarPerfil {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async executar(usuarioId: string): Promise<RespostaPerfilDTO> {
    if (!ObjectId.isValid(usuarioId)) throw new ErroUsuarioNaoEncontrado()

    const usuario = await this.repositorioUsuario.buscarPorId(new ObjectId(usuarioId))
    if (!usuario) throw new ErroUsuarioNaoEncontrado()

    return {
      id: usuario.id.toString(),
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      papel: usuario.papel,
    }
  }
}
