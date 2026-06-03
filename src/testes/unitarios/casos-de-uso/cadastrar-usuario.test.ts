import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ObjectId } from 'mongodb'
import { CadastrarUsuario } from '@/modulos/usuarios/aplicacao/casos-de-uso/cadastrar-usuario'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { ErroEmailJaCadastrado } from '@/compartilhado/erros/erro-email-ja-cadastrado'
import { ErroEmailInvalido } from '@/compartilhado/erros/erro-email-invalido'
import { ErroSenhaInvalida } from '@/compartilhado/erros/erro-senha-invalida'
import type { RepositorioUsuario } from '@/modulos/usuarios/dominio/repositorios/repositorio-usuario'
import type { RepositorioContador } from '@/compartilhado/repositorios/repositorio-contador'

const entradaValida = {
  nome: 'Carlos',
  sobrenome: 'Oliveira',
  telefone: '11977777777',
  email: 'carlos@empresa.com',
  senha: 'senha12345',
  papel: PapelUsuario.RECEPCIONISTA,
  requisitanteId: new ObjectId().toString(),
}

function criarMocks() {
  const repositorioUsuario: RepositorioUsuario = {
    criar: vi.fn().mockResolvedValue(undefined),
    buscarPorEmail: vi.fn().mockResolvedValue(null),
    buscarPorId: vi.fn().mockResolvedValue(null),
    listar: vi.fn().mockResolvedValue({ usuarios: [], total: 0 }),
    atualizar: vi.fn().mockResolvedValue(undefined),
  }
  const repositorioContador: RepositorioContador = {
    proximoNumero: vi.fn().mockResolvedValue(1),
  }
  return { repositorioUsuario, repositorioContador }
}

describe('CadastrarUsuario', () => {
  let casoDeUso: CadastrarUsuario

  beforeEach(() => {
    const { repositorioUsuario, repositorioContador } = criarMocks()
    casoDeUso = new CadastrarUsuario(repositorioUsuario, repositorioContador)
  })

  it('deve cadastrar usuário com sucesso e retornar DTO sem senha', async () => {
    const resultado = await casoDeUso.executar(entradaValida)

    expect(resultado.email).toBe('carlos@empresa.com')
    expect(resultado.nome).toBe('Carlos')
    expect(resultado.matricula).toBe('RECEP0000001')
    expect(resultado.papel).toBe(PapelUsuario.RECEPCIONISTA)
    expect(resultado).not.toHaveProperty('senha')
    expect(resultado).not.toHaveProperty('senhaHash')
  })

  it('deve lançar ErroSenhaInvalida quando senha tiver menos de 8 caracteres', async () => {
    await expect(
      casoDeUso.executar({ ...entradaValida, senha: '123' }),
    ).rejects.toThrow(ErroSenhaInvalida)
  })

  it('deve lançar ErroEmailInvalido quando email for malformado', async () => {
    await expect(
      casoDeUso.executar({ ...entradaValida, email: 'email-invalido' }),
    ).rejects.toThrow(ErroEmailInvalido)
  })

  it('deve lançar ErroEmailJaCadastrado quando email já existir', async () => {
    const { repositorioUsuario, repositorioContador } = criarMocks()
    repositorioUsuario.buscarPorEmail = vi.fn().mockResolvedValue({ id: new ObjectId() })
    casoDeUso = new CadastrarUsuario(repositorioUsuario, repositorioContador)

    await expect(casoDeUso.executar(entradaValida)).rejects.toThrow(ErroEmailJaCadastrado)
  })

  it('deve armazenar email em lowercase', async () => {
    const { repositorioUsuario, repositorioContador } = criarMocks()
    casoDeUso = new CadastrarUsuario(repositorioUsuario, repositorioContador)

    const resultado = await casoDeUso.executar({ ...entradaValida, email: 'CARLOS@EMPRESA.COM' })

    expect(resultado.email).toBe('carlos@empresa.com')
  })

  it('deve gerar matrícula no formato RECEP0000000 com incremento atômico', async () => {
    const { repositorioUsuario, repositorioContador } = criarMocks()
    repositorioContador.proximoNumero = vi.fn().mockResolvedValue(42)
    casoDeUso = new CadastrarUsuario(repositorioUsuario, repositorioContador)

    const resultado = await casoDeUso.executar(entradaValida)

    expect(resultado.matricula).toBe('RECEP0000042')
  })
})
