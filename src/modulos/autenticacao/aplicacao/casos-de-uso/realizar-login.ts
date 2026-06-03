import { ErroCredenciaisInvalidas } from '@/compartilhado/erros/erro-credenciais-invalidas'
import { verificarSenha } from '@/compartilhado/utilitarios/criptografia'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { ServicoToken } from '@/modulos/autenticacao/dominio/servicos/servico-token'
import type { RepositorioToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'
import type { EntradaRealizarLoginDTO } from '@/modulos/autenticacao/aplicacao/dtos/entrada-realizar-login.dto'
import type { RespostaLoginDTO } from '@/modulos/autenticacao/aplicacao/dtos/resposta-autenticacao.dto'

export class RealizarLogin {
  constructor(
    private readonly repositorioUsuario: RepositorioUsuario,
    private readonly serviçoToken: ServicoToken,
    private readonly repositorioToken: RepositorioToken,
  ) {}

  async executar(dados: EntradaRealizarLoginDTO): Promise<RespostaLoginDTO> {
    const usuario = await this.repositorioUsuario.buscarPorEmail(dados.email.toLowerCase().trim())

    // Mesmo erro para email inexistente e senha errada — evita enumeração de usuários
    if (!usuario) throw new ErroCredenciaisInvalidas()

    const senhaValida = await verificarSenha(dados.senha, usuario.senhaHash)
    if (!senhaValida) throw new ErroCredenciaisInvalidas()

    const payload = {
      usuarioId: usuario.id.toString(),
      email: usuario.email,
      papel: usuario.papel,
    }

    const accessToken = this.serviçoToken.gerarAccessToken(payload)
    const { rawToken, tokenHash } = this.serviçoToken.gerarRefreshToken()

    await this.repositorioToken.armazenar(payload.usuarioId, tokenHash, {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    })

    // Cookie value: {usuarioId}:{rawToken} — permite reconstruir a chave Redis no refresh/logout
    const refreshTokenCookie = `${payload.usuarioId}:${rawToken}`

    return {
      accessToken,
      refreshTokenCookie,
      usuario: {
        id: payload.usuarioId,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        papel: usuario.papel,
      },
    }
  }
}
