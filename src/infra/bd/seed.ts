/**
 * Seed de desenvolvimento — popula o banco com usuários, setores e visitantes iniciais.
 *
 * Uso:
 *   pnpm seed           → insere dados (idempotente por e-mail/nome)
 *   pnpm seed --limpar  → limpa as coleções e recria tudo do zero
 */

import { ObjectId } from 'mongodb'
import { conectarMongoDB, desconectarMongoDB } from '@/infra/bd/conexao-mongodb'
import { hashSenha } from '@/compartilhado/utilitarios/criptografia'
import { Matricula } from '@/modulos/usuarios/dominio/value-objects/matricula'
import { CodigoVisitante } from '@/modulos/visitantes/dominio/value-objects/codigo-visitante'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'

// Credenciais dos seeds (altere antes de usar em staging)
const SENHA_ADMIN = 'Admin@2026!'
const SENHA_RECEP = 'Recep@2026!'

// Definição dos usuários
interface UsuarioSeed {
  id: ObjectId
  nome: string
  sobrenome: string
  telefone: string
  email: string
  senha: string
  papel: PapelUsuario
  seq: number
}

const usuariosSeed: UsuarioSeed[] = [
  {
    id: new ObjectId(),
    nome: 'Ana Carolina',
    sobrenome: 'Ferreira',
    telefone: '11999990001',
    email: 'ana.carolina@bemvindo.com',
    senha: SENHA_ADMIN,
    papel: PapelUsuario.ADMINISTRADOR,
    seq: 1,
  },
  {
    id: new ObjectId(),
    nome: 'Bruno',
    sobrenome: 'Santos',
    telefone: '11999990002',
    email: 'bruno.santos@bemvindo.com',
    senha: SENHA_ADMIN,
    papel: PapelUsuario.ADMINISTRADOR,
    seq: 2,
  },
  {
    id: new ObjectId(),
    nome: 'Carlos Eduardo',
    sobrenome: 'Lima',
    telefone: '11999990003',
    email: 'carlos.eduardo@bemvindo.com',
    senha: SENHA_RECEP,
    papel: PapelUsuario.RECEPCIONISTA,
    seq: 3,
  },
  {
    id: new ObjectId(),
    nome: 'Diana',
    sobrenome: 'Oliveira',
    telefone: '11999990004',
    email: 'diana.oliveira@bemvindo.com',
    senha: SENHA_RECEP,
    papel: PapelUsuario.RECEPCIONISTA,
    seq: 4,
  },
]

// Definição dos setores
const setoresSeed = [
  { id: new ObjectId(), nome: 'Recursos Humanos' },
  { id: new ObjectId(), nome: 'Tecnologia da Informação' },
  { id: new ObjectId(), nome: 'Financeiro' },
]

// Visitantes com CPFs válidos
// Datas em segunda-feira (2026-06-01) dentro do horário permitido (BRT 10h)
const VISITA_1 = new Date('2026-06-01T13:00:00.000Z') // 10h BRT
const VISITA_2 = new Date('2026-06-01T14:00:00.000Z') // 11h BRT
const VISITA_3 = new Date('2026-06-02T14:30:00.000Z') // 11h30 BRT (terça)

// Helpers
function linha(char = '─', n = 60): string {
  return char.repeat(n)
}

function garantir<T>(valor: T | undefined, msg: string): T {
  if (valor === undefined) throw new Error(msg)
  return valor
}

function log(mensagem: string): void {
  process.stdout.write(`${mensagem}\n`)
}

// Seed principal
async function seed(): Promise<void> {
  const limpar = process.argv.includes('--limpar')

  log('')
  log(linha('═'))
  log('  BEM-VINDO — Seed de Desenvolvimento')
  log(linha('═'))
  log(`  Modo: ${limpar ? '⚠️  LIMPAR e recriar' : 'Idempotente (mantém existentes)'}`)
  log('')

  const bd = await conectarMongoDB()
  log('  ✓ MongoDB conectado')

  // Limpeza opcional
  if (limpar) {
    await Promise.all([
      bd.collection('usuarios').deleteMany({}),
      bd.collection('setores').deleteMany({}),
      bd.collection('visitantes').deleteMany({}),
      bd.collection('contadores').deleteMany({}),
    ])
    log('  ✓ Coleções limpas')
  }

  log('')

  // Setores
  log('  Setores')
  log(linha())

  const primeiroAdmin = usuariosSeed[0] ?? { id: new ObjectId() }
  const setoresInseridos: typeof setoresSeed = []

  for (const setor of setoresSeed) {
    const agora = new Date()
    const resultado = await bd.collection('setores').updateOne(
      { nome: setor.nome },
      {
        $setOnInsert: {
          _id: setor.id,
          nome: setor.nome,
          criadoEm: agora,
          atualizadoEm: agora,
          criadoPor: primeiroAdmin.id,
          atualizadoPor: primeiroAdmin.id,
        },
      },
      { upsert: true },
    )
    const acao = resultado.upsertedCount > 0 ? 'criado' : 'existia'
    log(`  [${acao.toUpperCase().padEnd(7)}] ${setor.nome} → ID: ${setor.id.toString()}`)
    setoresInseridos.push(setor)
  }

  log('')

  // Usuários
  log('  Usuários')
  log(linha())

  const usuariosInseridos: (UsuarioSeed & { matricula: string })[] = []

  for (const usuario of usuariosSeed) {
    const matricula = Matricula.formatar(usuario.seq)
    const senhaHash = await hashSenha(usuario.senha)
    const agora = new Date()

    const resultado = await bd.collection('usuarios').updateOne(
      { email: usuario.email },
      {
        $setOnInsert: {
          _id: usuario.id,
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          telefone: usuario.telefone,
          email: usuario.email,
          senhaHash,
          matricula,
          papel: usuario.papel,
          criadoEm: agora,
          atualizadoEm: agora,
          criadoPor: usuario.id,
          atualizadoPor: usuario.id,
        },
      },
      { upsert: true },
    )

    const acao = resultado.upsertedCount > 0 ? 'criado' : 'existia'
    const papel = usuario.papel === PapelUsuario.ADMINISTRADOR ? 'ADMIN' : 'RECEP'
    log(
      `  [${acao.toUpperCase().padEnd(7)}] ${papel} | ${matricula} | ${usuario.nome} ${usuario.sobrenome}`,
    )
    log(`             E-mail: ${usuario.email}`)
    log(`             Senha:  ${usuario.senha}`)
    log(`             ID:     ${usuario.id.toString()}`)
    log('')

    usuariosInseridos.push({ ...usuario, matricula })
  }

  // Atualiza contador de usuários para refletir o máximo seq inserido
  await bd.collection<{ _id: string; seq: number }>('contadores').updateOne(
    { _id: 'usuario' },
    { $max: { seq: usuariosSeed.length } },
    { upsert: true },
  )

  // Visitantes
  log('  Visitantes')
  log(linha())

  const recep1 = garantir(usuariosInseridos.find((u) => u.papel === PapelUsuario.RECEPCIONISTA), 'Recepcionista não encontrado')
  const setorRH = garantir(setoresInseridos.find((s) => s.nome === 'Recursos Humanos'), 'Setor RH não encontrado')
  const setorTI = garantir(setoresInseridos.find((s) => s.nome === 'Tecnologia da Informação'), 'Setor TI não encontrado')

  const visitantesSeed = [
    {
      id: new ObjectId(),
      codigoVisitante: CodigoVisitante.formatar(1),
      cpf: '52998224725',
      nomeCompleto: 'João da Silva',
      dataNascimento: new Date('1990-06-15'),
      telefone: '11988881111',
      email: 'joao.silva@email.com',
      setorDestinoId: setorRH.id,
      observacao: 'Entrevista de emprego',
      recepcionistaId: recep1.id,
      recepcionistaNome: `${recep1.nome} ${recep1.sobrenome}`,
      recepcionistaMatricula: recep1.matricula,
      criadoEm: VISITA_1,
      atualizadoEm: VISITA_1,
    },
    {
      id: new ObjectId(),
      codigoVisitante: CodigoVisitante.formatar(2),
      cpf: '11144477735',
      nomeCompleto: 'Maria Fernanda Costa',
      dataNascimento: new Date('1985-03-22'),
      telefone: '11988882222',
      email: 'maria.fernanda@email.com',
      setorDestinoId: setorTI.id,
      observacao: undefined as string | undefined,
      recepcionistaId: recep1.id,
      recepcionistaNome: `${recep1.nome} ${recep1.sobrenome}`,
      recepcionistaMatricula: recep1.matricula,
      criadoEm: VISITA_2,
      atualizadoEm: VISITA_2,
    },
    {
      id: new ObjectId(),
      codigoVisitante: CodigoVisitante.formatar(3),
      cpf: '52998224725',
      nomeCompleto: 'João da Silva',
      dataNascimento: new Date('1990-06-15'),
      telefone: '11988881111',
      email: 'joao.silva@email.com',
      setorDestinoId: setorTI.id,
      observacao: 'Retorno — segunda visita',
      recepcionistaId: recep1.id,
      recepcionistaNome: `${recep1.nome} ${recep1.sobrenome}`,
      recepcionistaMatricula: recep1.matricula,
      criadoEm: VISITA_3,
      atualizadoEm: VISITA_3,
    },
  ]

  for (const visitante of visitantesSeed) {
    const resultado = await bd.collection('visitantes').updateOne(
      { codigoVisitante: visitante.codigoVisitante },
      { $setOnInsert: visitante },
      { upsert: true },
    )
    const acao = resultado.upsertedCount > 0 ? 'criado' : 'existia'
    log(
      `  [${acao.toUpperCase().padEnd(7)}] ${visitante.codigoVisitante} | ${visitante.nomeCompleto} | CPF: ${visitante.cpf}`,
    )
  }

  // Atualiza contador de visitantes
  await bd.collection<{ _id: string; seq: number }>('contadores').updateOne(
    { _id: 'visitante' },
    { $max: { seq: visitantesSeed.length } },
    { upsert: true },
  )

  // Índices
  await Promise.all([
    bd.collection('usuarios').createIndex({ email: 1 }, { unique: true }),
    bd.collection('usuarios').createIndex({ matricula: 1 }, { unique: true }),
    bd.collection('setores').createIndex({ nome: 1 }, { unique: true }),
    bd.collection('visitantes').createIndex({ cpf: 1 }),
    bd.collection('visitantes').createIndex({ codigoVisitante: 1 }, { unique: true }),
    bd.collection('visitantes').createIndex({ criadoEm: -1 }),
  ])

  // Resumo final
  log('')
  log(linha('═'))
  log('  Seed concluído com sucesso!')
  log(linha('═'))
  log('')
  log('  CREDENCIAIS PARA USO NO POSTMAN')
  log(linha())
  log('')
  log('  ADMINISTRADORES')
  for (const u of usuariosInseridos.filter((u) => u.papel === PapelUsuario.ADMINISTRADOR)) {
    log(`    ${u.nome} ${u.sobrenome} (${u.matricula})`)
    log(`    E-mail: ${u.email}`)
    log(`    Senha:  ${u.senha}`)
    log(`    ID:     ${u.id.toString()}`)
    log('')
  }
  log('  RECEPCIONISTAS')
  for (const u of usuariosInseridos.filter((u) => u.papel === PapelUsuario.RECEPCIONISTA)) {
    log(`    ${u.nome} ${u.sobrenome} (${u.matricula})`)
    log(`    E-mail: ${u.email}`)
    log(`    Senha:  ${u.senha}`)
    log(`    ID:     ${u.id.toString()}`)
    log('')
  }
  log('  SETORES')
  for (const s of setoresInseridos) {
    log(`    ${s.nome} → ID: ${s.id.toString()}`)
  }
  log('')
  log(linha('═'))
  log('')
}

seed()
  .catch((err: unknown) => {
    process.stderr.write(`Falha no seed: ${String(err)}\n`)
    process.exit(1)
  })
  .finally(() => void desconectarMongoDB())
