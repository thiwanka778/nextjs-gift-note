
function base64ToArrayBuffer(base64: string) {
    return Buffer.from(base64, 'base64');
  }
  
  function arrayBufferToBase64(buffer: ArrayBuffer) {
    return Buffer.from(buffer).toString('base64');
  }

export async function decryptAES(encryptedBase64: string, base64Key: string): Promise<string> {
    const combined = Buffer.from(encryptedBase64, 'base64');
    const iv = combined.subarray(0, 12); // Extract IV
    const data = combined.subarray(12);  // Actual ciphertext
  
    const keyBuffer = base64ToArrayBuffer(base64Key);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      "AES-GCM",
      false,
      ["decrypt"]
    );
  
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
  
    return new TextDecoder().decode(decrypted);
  }
  