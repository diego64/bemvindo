import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

export interface PayloadToken {
  usuarioId: string
  email: string
  papel: PapelUsuario
}

export interface ServicoToken {
  gerarAccessToken(payload: PayloadToken): string
  gerarRefreshToken(): { rawToken: string; tokenHash: string }
}
