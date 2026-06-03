import type { RealizarLogin } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-login'
import type { RenovarToken } from '@/modulos/autenticacao/aplicacao/casos-de-uso/renovar-token'
import type { RealizarLogout } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-logout'
import type { AlterarSenha } from '@/modulos/autenticacao/aplicacao/casos-de-uso/alterar-senha'
import type { BuscarPerfil } from '@/modulos/autenticacao/aplicacao/casos-de-uso/buscar-perfil'
import type {
  RespostaLoginDTO,
  RespostaRenovarTokenDTO,
  RespostaPerfilDTO,
} from '@/modulos/autenticacao/aplicacao/dtos/resposta-autenticacao.dto'
import type { RealizarLoginBody, AlterarSenhaBody } from '@/modulos/autenticacao/apresentacao/schemas/schema-autenticacao'

export class ControladorAutenticacao {
  constructor(
    private readonly realizarLogin: RealizarLogin,
    private readonly renovarToken: RenovarToken,
    private readonly realizarLogout: RealizarLogout,
    private readonly alterarSenha: AlterarSenha,
    private readonly buscarPerfil: BuscarPerfil,
  ) {}

  async login(body: RealizarLoginBody): Promise<RespostaLoginDTO> {
    return this.realizarLogin.executar({ email: body.email, senha: body.senha })
  }

  async refresh(cookieRefreshToken: string): Promise<RespostaRenovarTokenDTO> {
    return this.renovarToken.executar(cookieRefreshToken)
  }

  async logout(cookieRefreshToken: string): Promise<void> {
    return this.realizarLogout.executar(cookieRefreshToken)
  }

  async perfil(usuarioId: string): Promise<RespostaPerfilDTO> {
    return this.buscarPerfil.executar(usuarioId)
  }

  async alterarMinhaSenha(usuarioId: string, body: AlterarSenhaBody): Promise<void> {
    return this.alterarSenha.executar({
      usuarioId,
      senhaAtual: body.senhaAtual,
      novaSenha: body.novaSenha,
    })
  }
}
