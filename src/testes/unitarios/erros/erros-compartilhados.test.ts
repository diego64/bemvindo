import { describe, it, expect } from 'vitest'
import { ErroBase } from '@/compartilhado/erros/erro-base'
import { ErroConflito } from '@/compartilhado/erros/erro-conflito'
import { ErroNaoAutenticado } from '@/compartilhado/erros/erro-nao-autenticado'
import { ErroNaoEncontrado } from '@/compartilhado/erros/erro-nao-encontrado'
import { ErroSemPermissao } from '@/compartilhado/erros/erro-sem-permissao'
import { ErroValidacao } from '@/compartilhado/erros/erro-validacao'

describe('ErroBase', () => {
  it('deve armazenar mensagem, statusHttp e codigo corretamente', () => {
    const erro = new ErroBase('mensagem teste', 500, 'ERRO_TESTE')

    expect(erro.message).toBe('mensagem teste')
    expect(erro.statusHttp).toBe(500)
    expect(erro.codigo).toBe('ERRO_TESTE')
  })

  it('deve definir o name como o nome da classe', () => {
    const erro = new ErroBase('mensagem', 400, 'CODIGO')

    expect(erro.name).toBe('ErroBase')
  })

  it('deve ser instância de Error', () => {
    const erro = new ErroBase('mensagem', 400, 'CODIGO')

    expect(erro).toBeInstanceOf(Error)
  })
})

describe('ErroConflito', () => {
  it('deve ter statusHttp 409', () => {
    const erro = new ErroConflito('Conflito ocorreu.', 'CONFLITO_TESTE')

    expect(erro.statusHttp).toBe(409)
  })

  it('deve armazenar mensagem e codigo informados', () => {
    const erro = new ErroConflito('Email já cadastrado.', 'EMAIL_JA_CADASTRADO')

    expect(erro.message).toBe('Email já cadastrado.')
    expect(erro.codigo).toBe('EMAIL_JA_CADASTRADO')
  })

  it('deve ser instância de ErroBase', () => {
    const erro = new ErroConflito('Conflito.', 'CONFLITO')

    expect(erro).toBeInstanceOf(ErroBase)
  })

  it('deve aceitar mensagem e codigo distintos', () => {
    const erro1 = new ErroConflito('Visitante já cadastrado hoje.', 'VISITANTE_JA_CADASTRADO_HOJE')
    const erro2 = new ErroConflito('Setor já cadastrado.', 'SETOR_JA_CADASTRADO')

    expect(erro1.codigo).toBe('VISITANTE_JA_CADASTRADO_HOJE')
    expect(erro2.codigo).toBe('SETOR_JA_CADASTRADO')
  })
})

describe('ErroNaoAutenticado', () => {
  it('deve ter statusHttp 401', () => {
    const erro = new ErroNaoAutenticado()

    expect(erro.statusHttp).toBe(401)
  })

  it('deve ter mensagem "Não autenticado."', () => {
    const erro = new ErroNaoAutenticado()

    expect(erro.message).toBe('Não autenticado.')
  })

  it('deve ter codigo "NAO_AUTENTICADO"', () => {
    const erro = new ErroNaoAutenticado()

    expect(erro.codigo).toBe('NAO_AUTENTICADO')
  })

  it('deve ser instância de ErroBase', () => {
    const erro = new ErroNaoAutenticado()

    expect(erro).toBeInstanceOf(ErroBase)
  })
})

describe('ErroNaoEncontrado', () => {
  it('deve ter statusHttp 404', () => {
    const erro = new ErroNaoEncontrado()

    expect(erro.statusHttp).toBe(404)
  })

  it('deve ter codigo "NAO_ENCONTRADO"', () => {
    const erro = new ErroNaoEncontrado()

    expect(erro.codigo).toBe('NAO_ENCONTRADO')
  })

  it('deve usar recurso padrão "Recurso" quando nenhum argumento é passado', () => {
    const erro = new ErroNaoEncontrado()

    expect(erro.message).toBe('Recurso não encontrado.')
  })

  it('deve usar o recurso informado na mensagem quando argumento é passado', () => {
    const erro = new ErroNaoEncontrado('Usuário')

    expect(erro.message).toBe('Usuário não encontrado.')
  })

  it('deve ser instância de ErroBase', () => {
    const erro = new ErroNaoEncontrado('Setor')

    expect(erro).toBeInstanceOf(ErroBase)
  })
})

describe('ErroSemPermissao', () => {
  it('deve ter statusHttp 403', () => {
    const erro = new ErroSemPermissao()

    expect(erro.statusHttp).toBe(403)
  })

  it('deve ter mensagem "Sem permissão para realizar esta ação."', () => {
    const erro = new ErroSemPermissao()

    expect(erro.message).toBe('Sem permissão para realizar esta ação.')
  })

  it('deve ter codigo "SEM_PERMISSAO"', () => {
    const erro = new ErroSemPermissao()

    expect(erro.codigo).toBe('SEM_PERMISSAO')
  })

  it('deve ser instância de ErroBase', () => {
    const erro = new ErroSemPermissao()

    expect(erro).toBeInstanceOf(ErroBase)
  })
})

describe('ErroValidacao', () => {
  it('deve ter statusHttp 400', () => {
    const erro = new ErroValidacao('Campo inválido.', 'CAMPO_INVALIDO')

    expect(erro.statusHttp).toBe(400)
  })

  it('deve armazenar mensagem e codigo informados', () => {
    const erro = new ErroValidacao('CPF inválido.', 'CPF_INVALIDO')

    expect(erro.message).toBe('CPF inválido.')
    expect(erro.codigo).toBe('CPF_INVALIDO')
  })

  it('deve ser instância de ErroBase', () => {
    const erro = new ErroValidacao('Validação falhou.', 'VALIDACAO_FALHOU')

    expect(erro).toBeInstanceOf(ErroBase)
  })

  it('deve aceitar mensagem e codigo distintos', () => {
    const erro1 = new ErroValidacao('Senha muito curta.', 'SENHA_INVALIDA')
    const erro2 = new ErroValidacao('Email mal formatado.', 'EMAIL_INVALIDO')

    expect(erro1.codigo).toBe('SENHA_INVALIDA')
    expect(erro2.codigo).toBe('EMAIL_INVALIDO')
  })
})
