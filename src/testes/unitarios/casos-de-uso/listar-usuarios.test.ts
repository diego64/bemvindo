import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { ListarUsuarios } from '@/modulos/usuarios/aplicacao/casos-de-uso/listar-usuarios'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

function criarUsuarioMock(email: string, seq: number): Usuario {
  const id = new ObjectId()
  return new Usuario({
    id,
    nome: 'Nome',
    sobrenome: 'Sobrenome',
    telefone: '11999998888',
    email,
    senhaHash: 'hash',
    matricula: `RECEP000000${String(seq)}`,
    papel: PapelUsuario.RECEPCIONISTA,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })
}

function criarRepositorioMock(usuarios: Usuario[], total: number): RepositorioUsuario {
  return {
    criar: vi.fn(),
    buscarPorEmail: vi.fn(),
    buscarPorId: vi.fn(),
    listar: vi.fn().mockResolvedValue({ usuarios, total }),
    atualizar: vi.fn(),
  }
}

describe('ListarUsuarios', () => {
  it('deve retornar lista paginada de usuários mapeados para DTO', async () => {
    const usuarios = [criarUsuarioMock('a@x.com', 1), criarUsuarioMock('b@x.com', 2)]
    const repositorio = criarRepositorioMock(usuarios, 2)
    const casoDeUso = new ListarUsuarios(repositorio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.usuarios).toHaveLength(2)
    expect(resultado.usuarios[0].email).toBe('a@x.com')
    expect(resultado.usuarios[1].email).toBe('b@x.com')
  })

  it('não deve retornar senhaHash nos DTOs', async () => {
    const repositorio = criarRepositorioMock([criarUsuarioMock('a@x.com', 1)], 1)
    const casoDeUso = new ListarUsuarios(repositorio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.usuarios[0]).not.toHaveProperty('senhaHash')
    expect(resultado.usuarios[0]).not.toHaveProperty('senha')
  })

  it('deve calcular totalPaginas corretamente', async () => {
    const repositorio = criarRepositorioMock([], 45)
    const casoDeUso = new ListarUsuarios(repositorio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.paginacao.totalPaginas).toBe(3)
    expect(resultado.paginacao.total).toBe(45)
    expect(resultado.paginacao.pagina).toBe(1)
    expect(resultado.paginacao.itensPorPagina).toBe(20)
  })

  it('deve retornar totalPaginas 1 quando total é menor que itensPorPagina', async () => {
    const repositorio = criarRepositorioMock([], 5)
    const casoDeUso = new ListarUsuarios(repositorio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.paginacao.totalPaginas).toBe(1)
  })

  it('deve retornar lista vazia e paginacao zerada quando não há usuários', async () => {
    const repositorio = criarRepositorioMock([], 0)
    const casoDeUso = new ListarUsuarios(repositorio)

    const resultado = await casoDeUso.executar({ pagina: 1, itensPorPagina: 20 })

    expect(resultado.usuarios).toHaveLength(0)
    expect(resultado.paginacao.total).toBe(0)
    expect(resultado.paginacao.totalPaginas).toBe(0)
  })

  it('deve repassar pagina e itensPorPagina ao repositório', async () => {
    const listarFn = vi.fn().mockResolvedValue({ usuarios: [], total: 0 })
    const repositorio: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: vi.fn(), listar: listarFn, atualizar: vi.fn(),
    }
    const casoDeUso = new ListarUsuarios(repositorio)

    await casoDeUso.executar({ pagina: 3, itensPorPagina: 10 })

    expect(listarFn).toHaveBeenCalledWith(3, 10)
  })
})
