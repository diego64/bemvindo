import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { AtualizarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/atualizar-usuario'
import { ErroUsuarioNaoEncontrado } from '@/compartilhado/erros/erro-usuario-nao-encontrado'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

function criarUsuarioMock(): Usuario {
  const id = new ObjectId()
  return new Usuario({
    id,
    nome: 'João',
    sobrenome: 'Silva',
    telefone: '11999998888',
    email: 'joao@empresa.com',
    senhaHash: 'hash',
    matricula: 'RECEP0000001',
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })
}

function criarRepositorioMock(usuario: Usuario | null): RepositorioUsuario {
  return {
    criar: vi.fn(),
    buscarPorEmail: vi.fn(),
    buscarPorId: vi.fn().mockResolvedValue(usuario),
    listar: vi.fn(),
    atualizar: vi.fn().mockResolvedValue(undefined),
  }
}

describe('AtualizarUsuario', () => {
  it('deve atualizar nome com sucesso e retornar DTO', async () => {
    const usuario = criarUsuarioMock()
    const atualizarFn = vi.fn().mockResolvedValue(undefined)
    const repositorio: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn().mockResolvedValue(usuario), listar: vi.fn(), atualizar: atualizarFn,
    }
    const casoDeUso = new AtualizarUsuario(repositorio)

    const resultado = await casoDeUso.executar({ id: usuario.id.toString(), nome: 'Carlos', requisitanteId: new ObjectId().toString() })

    expect(resultado.nome).toBe('Carlos')
    expect(atualizarFn).toHaveBeenCalledOnce()
  })

  it('deve atualizar sobrenome e telefone simultaneamente', async () => {
    const usuario = criarUsuarioMock()
    const repositorio = criarRepositorioMock(usuario)
    const casoDeUso = new AtualizarUsuario(repositorio)

    const resultado = await casoDeUso.executar({
      id: usuario.id.toString(),
      sobrenome: 'Oliveira',
      telefone: '11888887777',
      requisitanteId: new ObjectId().toString(),
    })

    expect(resultado.sobrenome).toBe('Oliveira')
  })

  it('deve lançar ErroUsuarioNaoEncontrado para ID com formato inválido', async () => {
    const repositorio = criarRepositorioMock(null)
    const casoDeUso = new AtualizarUsuario(repositorio)

    await expect(
      casoDeUso.executar({ id: 'id-invalido', nome: 'Carlos', requisitanteId: new ObjectId().toString() }),
    ).rejects.toThrow(ErroUsuarioNaoEncontrado)
  })

  it('deve lançar ErroUsuarioNaoEncontrado quando usuário não existe no repositório', async () => {
    const repositorio = criarRepositorioMock(null)
    const casoDeUso = new AtualizarUsuario(repositorio)

    await expect(
      casoDeUso.executar({
        id: new ObjectId().toString(),
        nome: 'Carlos',
        requisitanteId: new ObjectId().toString(),
      }),
    ).rejects.toThrow(ErroUsuarioNaoEncontrado)
  })

  it('não deve retornar senhaHash no DTO de resposta', async () => {
    const usuario = criarUsuarioMock()
    const repositorio = criarRepositorioMock(usuario)
    const casoDeUso = new AtualizarUsuario(repositorio)

    const resultado = await casoDeUso.executar({
      id: usuario.id.toString(),
      nome: 'Carlos',
      requisitanteId: new ObjectId().toString(),
    })

    expect(resultado).not.toHaveProperty('senhaHash')
  })

  it('deve lançar erro quando nome atualizado tem menos de 2 caracteres', async () => {
    const usuario = criarUsuarioMock()
    const repositorio = criarRepositorioMock(usuario)
    const casoDeUso = new AtualizarUsuario(repositorio)

    await expect(
      casoDeUso.executar({
        id: usuario.id.toString(),
        nome: 'J',
        requisitanteId: new ObjectId().toString(),
      }),
    ).rejects.toThrow()
  })
})
