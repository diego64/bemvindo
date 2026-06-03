import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { AlterarSenha } from '@/modulos/autenticacao/aplicacao/casos-de-uso/alterar-senha'
import { ErroUsuarioNaoEncontrado } from '@/compartilhado/erros/erro-usuario-nao-encontrado'
import { ErroSenhaAtualIncorreta } from '@/compartilhado/erros/erro-senha-atual-incorreta'
import { ErroSenhaInvalida } from '@/compartilhado/erros/erro-senha-invalida'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { hashSenha } from '@/compartilhado/utilitarios/criptografia'

async function criarUsuarioMock(senha: string) {
  const id = new ObjectId()
  return new Usuario({
    id,
    nome: 'Maria',
    sobrenome: 'Silva',
    telefone: '11999998888',
    email: 'maria@empresa.com',
    senhaHash: await hashSenha(senha),
    matricula: 'RECEP0000001',
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })
}

describe('AlterarSenha', () => {
  it('deve alterar a senha com sucesso', async () => {
    const usuario = await criarUsuarioMock('senhaAntiga1')
    const atualizarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioUsuario: RepositorioUsuario = {
      criar: vi.fn(),
      buscarPorEmail: vi.fn(),
      buscarPorId: vi.fn().mockResolvedValue(usuario),
      listar: vi.fn(),
      atualizar: atualizarFn,
    }
    const casoDeUso = new AlterarSenha(repositorioUsuario)

    await expect(
      casoDeUso.executar({ usuarioId: usuario.id.toString(), senhaAtual: 'senhaAntiga1', novaSenha: 'senhaNova123' }),
    ).resolves.not.toThrow()

    expect(atualizarFn).toHaveBeenCalledOnce()
  })

  it('deve lançar ErroUsuarioNaoEncontrado para ID inválido', async () => {
    const repositorioUsuario: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(null), listar: vi.fn(), atualizar: vi.fn(),
    }
    const casoDeUso = new AlterarSenha(repositorioUsuario)

    await expect(
      casoDeUso.executar({ usuarioId: 'id-invalido', senhaAtual: 'qualquer', novaSenha: 'novaSenha1' }),
    ).rejects.toThrow(ErroUsuarioNaoEncontrado)
  })

  it('deve lançar ErroUsuarioNaoEncontrado quando usuário não existe', async () => {
    const repositorioUsuario: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(null), listar: vi.fn(), atualizar: vi.fn(),
    }
    const casoDeUso = new AlterarSenha(repositorioUsuario)

    await expect(
      casoDeUso.executar({ usuarioId: new ObjectId().toString(), senhaAtual: 'qualquer', novaSenha: 'novaSenha1' }),
    ).rejects.toThrow(ErroUsuarioNaoEncontrado)
  })

  it('deve lançar ErroSenhaAtualIncorreta quando senha atual estiver errada', async () => {
    const usuario = await criarUsuarioMock('senhaCorreta1')
    const repositorioUsuario: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(usuario), listar: vi.fn(), atualizar: vi.fn(),
    }
    const casoDeUso = new AlterarSenha(repositorioUsuario)

    await expect(
      casoDeUso.executar({ usuarioId: usuario.id.toString(), senhaAtual: 'senhaErrada1', novaSenha: 'senhaNova123' }),
    ).rejects.toThrow(ErroSenhaAtualIncorreta)
  })

  it('deve lançar ErroSenhaInvalida quando nova senha tiver menos de 8 caracteres', async () => {
    const usuario = await criarUsuarioMock('senhaCorreta1')
    const repositorioUsuario: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(usuario), listar: vi.fn(), atualizar: vi.fn(),
    }
    const casoDeUso = new AlterarSenha(repositorioUsuario)

    await expect(
      casoDeUso.executar({ usuarioId: usuario.id.toString(), senhaAtual: 'senhaCorreta1', novaSenha: '1234567' }),
    ).rejects.toThrow(ErroSenhaInvalida)
  })

  it('não deve chamar atualizar quando a senha atual estiver incorreta', async () => {
    const usuario = await criarUsuarioMock('senhaCorreta1')
    const atualizarFn = vi.fn().mockResolvedValue(undefined)
    const repositorioUsuario: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(usuario), listar: vi.fn(), atualizar: atualizarFn,
    }
    const casoDeUso = new AlterarSenha(repositorioUsuario)

    await casoDeUso.executar({ usuarioId: usuario.id.toString(), senhaAtual: 'errada', novaSenha: 'senhaNova123' }).catch(() => undefined)

    expect(atualizarFn).not.toHaveBeenCalled()
  })
})
