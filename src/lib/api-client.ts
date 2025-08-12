async function clientEncryptApiKey(
  apiKey: string,
  userId: string,
): Promise<string> {
  try {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(userId + "gemini_api_key_salt"),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("notes_buddy_salt"),
        iterations: 1000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(apiKey),
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch {
    throw new Error("Failed to encrypt API key");
  }
}

async function clientDecryptApiKey(
  encryptedData: string,
  userId: string,
): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(userId + "gemini_api_key_salt"),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("notes_buddy_salt"),
        iterations: 1000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error("Failed to decrypt API key");
  }
}

export const clientApiKeyUtils = {
  storeApiKey: async (apiKey: string, userId: string): Promise<void> => {
    try {
      const encrypted = await clientEncryptApiKey(apiKey, userId);
      localStorage.setItem("gemini_api_key_encrypted", encrypted);
    } catch (error) {
      throw error;
    }
  },

  getApiKey: async (userId: string): Promise<string | null> => {
    try {
      const encrypted = localStorage.getItem("gemini_api_key_encrypted");
      if (!encrypted) {
        return null;
      }
      return await clientDecryptApiKey(encrypted, userId);
    } catch {
      localStorage.removeItem("gemini_api_key_encrypted");
      return null;
    }
  },

  removeApiKey: (): void => {
    localStorage.removeItem("gemini_api_key_encrypted");
  },

  hasApiKey: (): boolean => {
    return localStorage.getItem("gemini_api_key_encrypted") !== null;
  },
};
