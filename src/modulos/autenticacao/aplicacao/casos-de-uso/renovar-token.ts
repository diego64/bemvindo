import { createHash } from 'crypto'
import { ObjectId } from 'mongodb'
import { ErroTokenInvalido } from '@/compartilhado/erros/erro-token-invalido'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { ServicoToken } from '@/modulos/autenticacao/dominio/servicos/servico-token'
import type { RepositorioToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'
import type { RespostaRenovarTokenDTO } from '@/modulos/autenticacao/aplicacao/dtos/resposta-autenticacao.dto'

export class RenovarToken {
  constructor(
    private readonly repositorioUsuario: RepositorioUsuario,
    private readonly serviçoToken: ServicoToken,
    private readonly repositorioToken: RepositorioToken,
  ) {}

  async executar(cookieRefreshToken: string): Promise<RespostaRenovarTokenDTO> {
    const separador = cookieRefreshToken.indexOf(':')
    if (separador === -1) throw new ErroTokenInvalido()

    const usuarioId = cookieRefreshToken.substring(0, separador)
    const rawToken = cookieRefreshToken.substring(separador + 1)

    if (!usuarioId || !rawToken || !ObjectId.isValid(usuarioId)) throw new ErroTokenInvalido()

    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const dadosToken = await this.repositorioToken.buscar(usuarioId, tokenHash)
    if (!dadosToken) throw new ErroTokenInvalido()

    const usuario = await this.repositorioUsuario.buscarPorId(new ObjectId(usuarioId))
    if (!usuario) throw new ErroTokenInvalido()

    const accessToken = this.serviçoToken.gerarAccessToken({
      usuarioId: usuario.id.toString(),
      email: usuario.email,
      papel: usuario.papel,
    })

    return { accessToken }
  }
}
