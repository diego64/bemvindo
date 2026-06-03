import { MongoClient, type Db } from 'mongodb'

let cliente: MongoClient | null = null
let bancoDados: Db | null = null

export async function conectarMongoDB(): Promise<Db> {
  if (bancoDados) return bancoDados

  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('Variável de ambiente MONGO_URI não definida.')

  cliente = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    serverSelectionTimeoutMS: 10_000,
  })

  await cliente.connect()
  bancoDados = cliente.db()

  cliente.on('close', () => {
    bancoDados = null
  })

  return bancoDados
}

export async function desconectarMongoDB(): Promise<void> {
  if (cliente) {
    await cliente.close()
    cliente = null
    bancoDados = null
  }
}
