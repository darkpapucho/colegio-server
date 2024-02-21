import { generateKeyPairSync } from 'crypto'
import { join } from 'path'
import { writeFileSync } from 'fs'
import { config } from 'dotenv'
config()

const SECRET = process.env.JWKS_PASSPHRASE

export function generateJWKS() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: SECRET,
    },
  })
  writeFileSync(join(__dirname, '..', '..', 'keys', 'private.key'), privateKey)
  writeFileSync(join(__dirname, '..', '..', 'keys', 'public.key'), publicKey)
}
