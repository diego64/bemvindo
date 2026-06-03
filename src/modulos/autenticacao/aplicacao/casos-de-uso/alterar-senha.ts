import { ObjectId } from 'mongodb'
import { ErroUsuarioNaoEncontrado } from '@/compartilhado/erros/erro-usuario-nao-encontrado'
import { ErroSenhaAtualIncorreta } from '@/compartilhado/erros/erro-senha-atual-incorreta'
import { ErroSenhaInvalida } from '@/compartilhado/erros/erro-senha-invalida'
import { verificarSenha, hashSenha } from '@/compartilhado/utilitarios/criptografia'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { EntradaAlterarSenhaDTO } from '@/modulos/autenticacao/aplicacao/dtos/entrada-alterar-senha.dto'

export class AlterarSenha {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async executar(dados: EntradaAlterarSenhaDTO): Promise<void> {
    if (!ObjectId.isValid(dados.usuarioId)) throw new ErroUsuarioNaoEncontrado()

    const usuario = await this.repositorioUsuario.buscarPorId(new ObjectId(dados.usuarioId))
    if (!usuario) throw new ErroUsuarioNaoEncontrado()

    const senhaCorreta = await verificarSenha(dados.senhaAtual, usuario.senhaHash)
    if (!senhaCorreta) throw new ErroSenhaAtualIncorreta()

    if (dados.novaSenha.length < 8) throw new ErroSenhaInvalida()

    usuario.senhaHash = await hashSenha(dados.novaSenha)
    await this.repositorioUsuario.atualizar(usuario)
  }
}
