
function base64ToArrayBuffer(base64: string) {
    return Buffer.from(base64, 'base64');
  }
  
  function arrayBufferToBase64(buffer: ArrayBuffer) {
    return Buffer.from(buffer).toString('base64');
  }


export async function encryptAES(plainText: string, base64Key: string): Promise<string> {

    
    
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const keyBuffer = base64ToArrayBuffer(base64Key);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      "AES-GCM",
      false,
      ["encrypt"]
    );
  
    const encoded = new TextEncoder().encode(plainText);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
  
    // Concatenate IV + ciphertext and return as Base64
    const combined = Buffer.concat([Buffer.from(iv), Buffer.from(ciphertext)]);
    return arrayBufferToBase64(combined);
  }
  