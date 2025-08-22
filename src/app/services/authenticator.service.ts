import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Authenticator {

    private readonly preEncryptedData = `{"iv":{"0":242,"1":62,"2":120,"3":42,"4":91,"5":50,"6":236,"7":130,"8":216,"9":125,"10":73,"11":137},"ciphertext":{"0":151,"1":226,"2":39,"3":51,"4":116,"5":32,"6":91,"7":18,"8":22,"9":191,"10":148,"11":218,"12":157,"13":102,"14":182,"15":153,"16":101,"17":24,"18":81,"19":115,"20":30,"21":161,"22":34,"23":34,"24":30,"25":246,"26":222,"27":203,"28":234,"29":111,"30":193,"31":116,"32":13,"33":99,"34":6,"35":74,"36":198,"37":221,"38":210,"39":66,"40":119,"41":146,"42":104,"43":129,"44":117,"45":55,"46":179,"47":43,"48":89,"49":230,"50":4,"51":76,"52":29,"53":178,"54":158,"55":80,"56":215,"57":16,"58":115,"59":67,"60":1,"61":152}}`;
    private readonly encryptedEmail = `{"iv":{"0":1,"1":206,"2":91,"3":66,"4":94,"5":46,"6":30,"7":110,"8":176,"9":142,"10":214,"11":86},"ciphertext":{"0":25,"1":179,"2":223,"3":7,"4":135,"5":75,"6":51,"7":118,"8":197,"9":170,"10":108,"11":49,"12":13,"13":162,"14":52,"15":170,"16":107,"17":203,"18":253,"19":224,"20":39,"21":44,"22":226,"23":127,"24":86,"25":116,"26":31,"27":255,"28":136,"29":222,"30":121,"31":107,"32":104,"33":37,"34":154,"35":87,"36":59,"37":157,"38":1}}`;
    private creds: string = "";
    private emailAddress: string = "";

    constructor() {
        this.initialize();
    }

    async decrypt(encrypted: any, key: CryptoKey) {
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: encrypted.iv,
            },
            key,
            encrypted.ciphertext
        );

        return new TextDecoder().decode(decryptedData);
    }

    async deriveCredentials(password: string) {

        const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw",
                encoder.encode(password),
                "PBKDF2",
                false,
                ["deriveBits", "deriveKey"]
            );

            const key = await window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: encoder.encode(`this-is-my-salt-for-now`),
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );

        const generalObject = JSON.parse(this.preEncryptedData);
        const arrayObject = {"iv": new Uint8Array(Object.values(generalObject.iv)), "ciphertext": new Uint8Array(Object.values(generalObject.ciphertext))};
        const encrypted = arrayObject;
        const decrypted = await this.decrypt(encrypted, key);

        const generalEmailObject = JSON.parse(this.encryptedEmail);
        const arrayEmailObject = {"iv": new Uint8Array(Object.values(generalEmailObject.iv)), "ciphertext": new Uint8Array(Object.values(generalEmailObject.ciphertext))};
        const encryptedEmail = arrayEmailObject;
        const decryptedEmail = await this.decrypt(encryptedEmail, key);
        return {
            creds: decrypted,
            email: decryptedEmail
        }
    }

    getCreds() {
        return this.creds;
    }

    getEmail() {
        return this.emailAddress;
    }

    initialize() {
        (async () => {
            try {
                if (window.localStorage.getItem(`JailMonitor_creds`)) {
                    this.creds = window.localStorage.getItem(`JailMonitor_creds`) as string;
                    this.emailAddress = window.localStorage.getItem(`JailMonitor_emailAddress`) as string;
                } else {
                    const password = prompt("Enter your password");
                    const credsAndEmail = await this.deriveCredentials(password as string);
                    this.creds = credsAndEmail.creds;
                    this.emailAddress = credsAndEmail.email;
                    window.localStorage.setItem(`JailMonitor_creds`, this.creds);
                    window.localStorage.setItem(`JailMonitor_emailAddress`, this.emailAddress);
                    // Ad hoc fix for one time startup authentication failures
                    window.location.reload();
                }
            } catch {
                alert(`Authentication failed.`);
                window.localStorage.removeItem(`JailMonitor_creds`);
                window.localStorage.removeItem(`JailMonitor_emailAddress`);
                window.location.reload();
            }
        })();
    }

}