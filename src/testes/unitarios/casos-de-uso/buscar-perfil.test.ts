import { describe, it, expect, vi } from 'vitest'
import { ObjectId } from 'mongodb'
import { BuscarPerfil } from '@/modulos/autenticacao/aplicacao/casos-de-uso/buscar-perfil'
import { ErroUsuarioNaoEncontrado } from '@/compartilhado/erros/erro-usuario-nao-encontrado'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import { Usuario } from '@/modulos/usuarios/dominio/entidades/usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

function criarUsuarioMock(): Usuario {
  const id = new ObjectId()
  return new Usuario({
    id,
    nome: 'Ana',
    sobrenome: 'Costa',
    telefone: '11999998888',
    email: 'ana@empresa.com',
    senhaHash: 'hash',
    matricula: 'RECEP0000001',
    papel: PapelUsuario.ADMINISTRADOR,
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
    atualizar: vi.fn(),
  }
}

describe('BuscarPerfil', () => {
  it('deve retornar DTO com dados públicos do usuário', async () => {
    const usuario = criarUsuarioMock()
    const casoDeUso = new BuscarPerfil(criarRepositorioMock(usuario))

    const resultado = await casoDeUso.executar(usuario.id.toString())

    expect(resultado.id).toBe(usuario.id.toString())
    expect(resultado.nome).toBe('Ana')
    expect(resultado.sobrenome).toBe('Costa')
    expect(resultado.email).toBe('ana@empresa.com')
    expect(resultado.papel).toBe(PapelUsuario.ADMINISTRADOR)
  })

  it('não deve expor senhaHash no resultado', async () => {
    const usuario = criarUsuarioMock()
    const casoDeUso = new BuscarPerfil(criarRepositorioMock(usuario))

    const resultado = await casoDeUso.executar(usuario.id.toString())

    expect(resultado).not.toHaveProperty('senhaHash')
  })

  it('deve lançar ErroUsuarioNaoEncontrado para ID com formato inválido', async () => {
    const casoDeUso = new BuscarPerfil(criarRepositorioMock(null))

    await expect(casoDeUso.executar('id-invalido')).rejects.toThrow(ErroUsuarioNaoEncontrado)
  })

  it('deve lançar ErroUsuarioNaoEncontrado quando usuário não existe', async () => {
    const casoDeUso = new BuscarPerfil(criarRepositorioMock(null))

    await expect(casoDeUso.executar(new ObjectId().toString())).rejects.toThrow(ErroUsuarioNaoEncontrado)
  })

  it('deve chamar buscarPorId com o ObjectId correto', async () => {
    const usuario = criarUsuarioMock()
    const buscarPorIdFn = vi.fn().mockResolvedValue(usuario)
    const repositorio: RepositorioUsuario = {
      criar: vi.fn(), buscarPorEmail: vi.fn(), buscarPorId: buscarPorIdFn, listar: vi.fn(), atualizar: vi.fn(),
    }
    const casoDeUso = new BuscarPerfil(repositorio)

    await casoDeUso.executar(usuario.id.toString())

    expect(buscarPorIdFn).toHaveBeenCalledWith(usuario.id)
  })
})
