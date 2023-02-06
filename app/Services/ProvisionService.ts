import { appDerivedKey } from 'Config/app';
import EncryptionService from './EncryptionService';
import Device from 'App/Models/Device';

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

        let sn: string
        let csn = true
        do {
            sn = await 'DCA' + Math.random().toString().substring(2, 15)
            csn = (await Device.findBy('serial_number', sn)) != null
        } while (csn);

        return sn
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
        const encryptionService = new EncryptionService()
        const adk = await this.getAppDerivedKey()
        const dki = adk.index
        const key = adk.key

        const text = await this.getDeviceKeyData(mac, sn, dki)

        return await encryptionService.encrypt(text, key)
    }
}