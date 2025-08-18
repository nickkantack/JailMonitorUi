import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Authenticator {

    private readonly preEncryptedData = `{"iv":{"0":59,"1":250,"2":64,"3":255,"4":151,"5":64,"6":227,"7":189,"8":32,"9":46,"10":55,"11":75},"ciphertext":{"0":110,"1":13,"2":188,"3":152,"4":219,"5":214,"6":226,"7":163,"8":152,"9":197,"10":125,"11":46,"12":142,"13":242,"14":76,"15":235,"16":41,"17":49,"18":175,"19":2,"20":123,"21":51,"22":51,"23":205,"24":196,"25":238,"26":96,"27":244,"28":68,"29":253,"30":109,"31":148,"32":17,"33":99,"34":60,"35":242,"36":29,"37":43,"38":10,"39":187,"40":190,"41":176,"42":153,"43":29,"44":21,"45":123,"46":122,"47":131,"48":241,"49":69,"50":116,"51":63,"52":195,"53":99,"54":46,"55":137,"56":221,"57":39,"58":253,"59":98,"60":51,"61":14}}`;
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