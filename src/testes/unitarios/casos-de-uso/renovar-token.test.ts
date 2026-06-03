import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { RenovarToken } from '@/modulos/autenticacao/aplicacao/casos-de-uso/renovar-token'
import { ErroTokenInvalido } from '@/compartilhado/erros/erro-token-invalido'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { ServicoToken } from '@/modulos/autenticacao/dominio/servicos/servico-token'
import type { RepositorioToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

function criarUsuarioMock(): Usuario {
  const id = new ObjectId()
  return new Usuario({
    id,
    nome: 'Carlos',
    sobrenome: 'Lima',
    telefone: '11999998888',
    email: 'carlos@empresa.com',
    senhaHash: 'hash',
    matricula: 'RECEP0000001',
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })
}

function criarMocks(usuario: Usuario | null = criarUsuarioMock(), tokenExiste = true) {
  const repositorioUsuario: RepositorioUsuario = {
    criar: vi.fn(),
    buscarPorEmail: vi.fn(),
    buscarPorId: vi.fn().mockResolvedValue(usuario),
    listar: vi.fn(),
    atualizar: vi.fn(),
  }
  const serviçoToken: ServicoToken = {
    gerarAccessToken: vi.fn().mockReturnValue('novo-access-token'),
    gerarRefreshToken: vi.fn(),
  }
  const repositorioToken: RepositorioToken = {
    armazenar: vi.fn(),
    buscar: vi.fn().mockResolvedValue(tokenExiste ? { usuarioId: 'x' } : null),
    revogar: vi.fn(),
  }
  return { repositorioUsuario, serviçoToken, repositorioToken }
}

describe('RenovarToken', () => {
  it('deve retornar novo accessToken para cookie válido', async () => {
    const usuario = criarUsuarioMock()
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks(usuario)
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    const resultado = await casoDeUso.executar(`${usuario.id.toString()}:rawToken123`)

    expect(resultado.accessToken).toBe('novo-access-token')
  })

  it('deve lançar ErroTokenInvalido para cookie sem separador ":"', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks()
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(casoDeUso.executar('cookiesempontodoispontos')).rejects.toThrow(ErroTokenInvalido)
  })

  it('deve lançar ErroTokenInvalido para usuarioId vazio', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks()
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(casoDeUso.executar(':rawToken')).rejects.toThrow(ErroTokenInvalido)
  })

  it('deve lançar ErroTokenInvalido para rawToken vazio', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks()
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(casoDeUso.executar(`${new ObjectId().toString()}:`)).rejects.toThrow(ErroTokenInvalido)
  })

  it('deve lançar ErroTokenInvalido para usuarioId que não é ObjectId válido', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks()
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(casoDeUso.executar('nao-e-objectid:rawToken')).rejects.toThrow(ErroTokenInvalido)
  })

  it('deve lançar ErroTokenInvalido quando token não está no Redis', async () => {
    const usuario = criarUsuarioMock()
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks(usuario, false)
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(casoDeUso.executar(`${usuario.id.toString()}:rawToken`)).rejects.toThrow(ErroTokenInvalido)
  })

  it('deve lançar ErroTokenInvalido quando usuário não existe no banco', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks(null, true)
    const casoDeUso = new RenovarToken(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(casoDeUso.executar(`${new ObjectId().toString()}:rawToken`)).rejects.toThrow(ErroTokenInvalido)
  })
})
