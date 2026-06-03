import { MongoClient, type Db, ObjectId } from 'mongodb'
import type { FastifyInstance } from 'fastify'
import { PapelUsuario } from '@/compartilhado/tipos/papel-usuario'
import { hashSenha } from '@/compartilhado/utilitarios/criptografia'
import { Matricula } from '@/modulos/usuarios/dominio/value-objects/matricula'

const URI_TESTES =
  process.env.MONGO_URI?.replace(/\/[^/?]+(\?|$)/, '/bem-vindo-testes$1') ??
  'mongodb://administrador:1qaz2sx12@localhost:27017/bem-vindo-testes?authSource=admin'

let clienteTeste: MongoClient | null = null

export async function conectarBdTeste(): Promise<Db> {
  clienteTeste = new MongoClient(URI_TESTES)
  await clienteTeste.connect()
  return clienteTeste.db()
}

export async function desconectarBdTeste(): Promise<void> {
  if (clienteTeste) {
    await clienteTeste.close()
    clienteTeste = null
  }
}

export async function limparColecao(bd: Db, colecao: string): Promise<void> {
  await bd.collection(colecao).deleteMany({})
}

export async function criarAdminTeste(
  bd: Db,
  app: FastifyInstance,
): Promise<{ token: string; id: ObjectId }> {
  const id = new ObjectId()
  const senhaHashGerado = await hashSenha('Admin@12345')

  await bd.collection('usuarios').insertOne({
    _id: id,
    nome: 'Admin',
    sobrenome: 'Teste',
    telefone: '11999999999',
    email: 'admin@teste.com',
    senhaHash: senhaHashGerado,
    matricula: Matricula.formatar(1),
    papel: PapelUsuario.ADMINISTRADOR,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    criadoPor: id,
    atualizadoPor: id,
  })

  await bd.collection<{ _id: string; seq: number }>('contadores').updateOne(
    { _id: 'usuario' },
    { $set: { seq: 1 } },
    { upsert: true },
  )

  const token = app.jwt.sign(
    { usuarioId: id.toString(), email: 'admin@teste.com', papel: PapelUsuario.ADMINISTRADOR },
    { expiresIn: '1h' },
  )

  return { token, id }
}
