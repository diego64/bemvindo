import type { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

export interface DadosToken {
  usuarioId: string
  email: string
  papel: PapelUsuario
  iat: number
}

export interface RepositorioToken {
  armazenar(usuarioId: string, tokenHash: string, dados: DadosToken): Promise<void>
  buscar(usuarioId: string, tokenHash: string): Promise<DadosToken | null>
  revogar(usuarioId: string, tokenHash: string): Promise<void>
}
