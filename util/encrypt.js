async function encrypt(data, key) {
        const encodedData = new TextEncoder().encode(data);

        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM", // Algorithm
                iv: iv,
            },
            key,
            encodedData
        );

        return {
            iv: iv,
            ciphertext: new Uint8Array(encryptedData),
        };
    }

    async function decrypt(encrypted, key) {
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

    (async () => {

        /*
        Enter the password below (but don't commit the change!)
        */
        const password = `this-is-not-actually-a-password-so-dont-panic`;

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

        const data = `This is something to encrypt`;
        const encrypted = await encrypt(data, key);
        const decrypted = await decrypt(encrypted, key);

        console.log("Original data:", data);
        console.log("Encrypted data:", encrypted);
        console.log("Encrypted data:", JSON.stringify(encrypted));
        console.log("Decrypted data:", decrypted);
    })();