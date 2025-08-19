import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Authenticator {

    private readonly preEncryptedData = `{"iv":{"0":242,"1":62,"2":120,"3":42,"4":91,"5":50,"6":236,"7":130,"8":216,"9":125,"10":73,"11":137},"ciphertext":{"0":151,"1":226,"2":39,"3":51,"4":116,"5":32,"6":91,"7":18,"8":22,"9":191,"10":148,"11":218,"12":157,"13":102,"14":182,"15":153,"16":101,"17":24,"18":81,"19":115,"20":30,"21":161,"22":34,"23":34,"24":30,"25":246,"26":222,"27":203,"28":234,"29":111,"30":193,"31":116,"32":13,"33":99,"34":6,"35":74,"36":198,"37":221,"38":210,"39":66,"40":119,"41":146,"42":104,"43":129,"44":117,"45":55,"46":179,"47":43,"48":89,"49":230,"50":4,"51":76,"52":29,"53":178,"54":158,"55":80,"56":215,"57":16,"58":115,"59":67,"60":1,"61":152}}`;
    private creds: string = "";

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
        console.log(key);
        const decrypted = await this.decrypt(encrypted, key);
        return decrypted;
    }

    getCreds() {
        return this.creds;
    }

    initialize() {
        (async () => {
            if (window.localStorage.getItem(`JailMonitor_creds`)) {
                this.creds = window.localStorage.getItem(`JailMonitor_creds`) as string;
            } else {
                const password = prompt("Enter your password");
                this.creds = await this.deriveCredentials(password as string);
                window.localStorage.setItem(`JailMonitor_creds`, this.creds);
            }
            console.log(`creds are set to ${this.creds}`);
        })();
    }

}