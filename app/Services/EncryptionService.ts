import crypto from 'crypto'

const algorithm = 'aes-128-ecb'

export default class EncryptionService {
    public async encrypt(text: string, key: string) {
        key = key.substring(0, 16)
        let thekey = await this.atohex(key)
        const iv = null
        var cipher = crypto.createCipheriv(algorithm, thekey, iv)
        cipher.setAutoPadding(true)
        var mystr = cipher.update(await this.atohex(text))
        return Buffer.concat([mystr, cipher.final()]).toString('base64')
    }

    public async decrypt(cipher: string, key: string) {
        key = key.substring(0, 16)
        let thekey = await this.atohex(key)
        let thedeciper = await this.b64tohex(cipher)
        const iv = null
        var decipher = crypto.createDecipheriv(algorithm, thekey, iv)
        decipher.setAutoPadding(false)
        var mystr = decipher.update(thedeciper).toString('utf8')

        // Remove padding
        mystr = mystr.replace(/[\x00-\x1F\x80-\xFF]/g, '')
        
        return mystr
    }

    // Base64 to hex
    public async b64tohex(str: string) {
        return Buffer.from(str, 'base64')
    }

    // ASCII to hex
    public async atohex(str: string) {
        return Buffer.from(str, 'ascii')
    }
}