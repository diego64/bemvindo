import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { RealizarLogin } from '@/modulos/autenticacao/aplicacao/casos-de-uso/realizar-login'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { ErroCredenciaisInvalidas } from '@/compartilhado/erros/erro-credenciais-invalidas'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { ServicoToken } from '@/modulos/autenticacao/dominio/servicos/servico-token'
import type { RepositorioToken } from '@/modulos/autenticacao/dominio/repositorios/repositorio-token'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { Matricula } from '@/modulos/usuarios/dominio/value-objects/matricula'
import { hashSenha } from '@/compartilhado/utilitarios/criptografia'

async function criarUsuarioMock(senha: string) {
  const id = new ObjectId()
  return new Usuario({
    id,
    nome: 'Maria',
    sobrenome: 'Silva',
    telefone: '11999999999',
    email: 'maria@empresa.com',
    senhaHash: await hashSenha(senha),
    matricula: Matricula.formatar(1),
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })
}

function criarMocks(usuarioMock: Usuario | null = null) {
  const buscarPorEmailFn = vi.fn().mockResolvedValue(usuarioMock)
  const armazenarFn = vi.fn().mockResolvedValue(undefined)

  const repositorioUsuario: RepositorioUsuario = {
    criar: vi.fn(),
    buscarPorEmail: buscarPorEmailFn,
    buscarPorId: vi.fn().mockResolvedValue(null),
    listar: vi.fn().mockResolvedValue({ usuarios: [], total: 0 }),
    atualizar: vi.fn(),
  }
  const serviçoToken: ServicoToken = {
    gerarAccessToken: vi.fn().mockReturnValue('access-token-mock'),
    gerarRefreshToken: vi.fn().mockReturnValue({ rawToken: 'raw123', tokenHash: 'hash456' }),
  }
  const repositorioToken: RepositorioToken = {
    armazenar: armazenarFn,
    buscar: vi.fn().mockResolvedValue(null),
    revogar: vi.fn().mockResolvedValue(undefined),
  }
  return { repositorioUsuario, serviçoToken, repositorioToken, buscarPorEmailFn, armazenarFn }
}

describe('RealizarLogin', () => {
  it('deve retornar accessToken e cookie quando credenciais estão corretas', async () => {
    const usuario = await criarUsuarioMock('senha12345')
    const { repositorioUsuario, serviçoToken, repositorioToken, armazenarFn } = criarMocks(usuario)
    const casoDeUso = new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken)

    const resultado = await casoDeUso.executar({
      email: 'maria@empresa.com',
      senha: 'senha12345',
    })

    expect(resultado.accessToken).toBe('access-token-mock')
    expect(resultado.refreshTokenCookie).toContain(':raw123')
    expect(resultado.usuario.email).toBe('maria@empresa.com')
    expect(armazenarFn).toHaveBeenCalledOnce()
  })

  it('deve lançar ErroCredenciaisInvalidas quando email não encontrado', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks(null)
    const casoDeUso = new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(
      casoDeUso.executar({ email: 'inexistente@empresa.com', senha: 'senha12345' }),
    ).rejects.toThrow(ErroCredenciaisInvalidas)
  })

  it('deve lançar ErroCredenciaisInvalidas quando senha está errada', async () => {
    const usuario = await criarUsuarioMock('senha12345')
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks(usuario)
    const casoDeUso = new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken)

    await expect(
      casoDeUso.executar({ email: 'maria@empresa.com', senha: 'senha-errada' }),
    ).rejects.toThrow(ErroCredenciaisInvalidas)
  })

  it('deve usar o mesmo código de erro para email inexistente e senha errada (anti-enumeração)', async () => {
    const { repositorioUsuario, serviçoToken, repositorioToken } = criarMocks(null)
    const casoDeUso = new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken)

    const erro = await casoDeUso
      .executar({ email: 'nao@existe.com', senha: 'qualquer' })
      .catch((e: unknown) => e)

    expect(erro).toBeInstanceOf(ErroCredenciaisInvalidas)
    expect((erro as ErroCredenciaisInvalidas).statusHttp).toBe(401)
    expect((erro as ErroCredenciaisInvalidas).codigo).toBe('CREDENCIAIS_INVALIDAS')
  })

  it('deve normalizar o email para lowercase antes de buscar', async () => {
    const usuario = await criarUsuarioMock('senha12345')
    const { repositorioUsuario, serviçoToken, repositorioToken, buscarPorEmailFn } =
      criarMocks(usuario)
    const casoDeUso = new RealizarLogin(repositorioUsuario, serviçoToken, repositorioToken)

    await casoDeUso.executar({ email: 'MARIA@EMPRESA.COM', senha: 'senha12345' })

    expect(buscarPorEmailFn).toHaveBeenCalledWith('maria@empresa.com')
  })
})
