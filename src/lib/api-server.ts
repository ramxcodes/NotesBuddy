import crypto from "crypto";

import { pbkdf2Sync } from "crypto";

export function decryptApiKey(encryptedData: string, userId: string): string {
  try {
    const combined = Buffer.from(encryptedData, "base64");

    const iv = combined.subarray(0, 12);
    const encryptedWithTag = combined.subarray(12);

    const authTag = encryptedWithTag.subarray(-16);
    const encrypted = encryptedWithTag.subarray(0, -16);

    const keyMaterial = pbkdf2Sync(
      userId + "gemini_api_key_salt",
      "notes_buddy_salt",
      1000,
      32,
      "sha256",
    );

    const decipher = crypto.createDecipheriv("aes-256-gcm", keyMaterial, iv);
    decipher.setAuthTag(authTag);

    const decryptedBuffer = decipher.update(encrypted);
    const finalBuffer = decipher.final();

    return Buffer.concat([decryptedBuffer, finalBuffer]).toString("utf8");
  } catch {
    throw new Error("Failed to decrypt API key");
  }
}
