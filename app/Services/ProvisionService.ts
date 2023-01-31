import { appDerivedKey } from 'Config/app';
import crypto from 'crypto'

const algorithm = 'aes-128-ecb';
const iv = null;

export default class ProvisionService {
    /**
     * Get App Derived Key
     * 
     * @returns array
     */
    public async getAppDerivedKey() {
        return await {
            index: '0101',
            key: appDerivedKey
        }
    }

    /**
     * Generate Serial Number
     */
    public async generateSN() {
        // Get SN from other source
        // SN 8 byte = 16 char
        return await 'DCA' + Math.random().toString().substring(2, 15)
    }

    /**
     * Get Device Key Data (The Algorithm)
     * @param mac
     * @param sn
     * @param dki
     */
    public async getDeviceKeyData(mac: string, sn: string, dki: string) {
        let dkd = mac + sn + dki

        return dkd
    }

    /**
     * Get Device Key
     * 
     * @param mac
     * @param sn
     */
    public async getDeviceKey(mac: string, sn: string) {
        const adk = await this.getAppDerivedKey()
        const dki = adk.index
        const key = adk.key

        const text = await this.getDeviceKeyData(mac, sn, dki)

        return await this.encrypt(text, key)
    }

    public async encrypt(text: string, key: string) {
        var cipher = crypto.createCipheriv(algorithm, key, iv);

        var mystr = cipher.update(text, 'utf8', 'base64')
        mystr += cipher.final('base64');

        return mystr;
    }

    public async decrypt(text: string) {
        const key = await (await this.getAppDerivedKey()).key
        const algorithm = 'aes-128-ecb';
        var cipher = crypto.createDecipheriv(algorithm, key, iv);
        var mystr = cipher.update(text, 'base64', 'utf8')
        mystr += cipher.final('utf8');

        return mystr
    }
}