import CryptoJS from "crypto-js";

export default class CryptoHelper {
    static decrypt(passphrase: string, encryptedJsonString: string | undefined): string | undefined {
        if (!encryptedJsonString) {
            return undefined;
        }
        let objJson = JSON.parse(encryptedJsonString);

        let encrypted = objJson.ciphertext;
        let salt = CryptoJS.enc.Hex.parse(objJson.salt);
        let iv = CryptoJS.enc.Hex.parse(objJson.iv);

        let key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: 999 });

        let decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}