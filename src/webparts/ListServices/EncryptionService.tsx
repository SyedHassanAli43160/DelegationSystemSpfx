import CryptoJS from "crypto-js";

const secretKey = "s3cr3tK3y@2025!"; // Replace with a securely generated key

// Function to encrypt a string
export const encryptString = (text: string) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  };
  
  // Function to decrypt a string
  export const decryptString = (cipherText: string) => {
    console.log(cipherText);
    if (!cipherText || typeof cipherText !== "string") {
      throw new Error("Invalid ciphertext provided for decryption.");
    }
  
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
  
      if (!originalText) {
        throw new Error("Decryption failed. The ciphertext may be invalid or corrupted.");
      }
  
      return originalText;
    } catch (error) {
      console.error("Error during decryption:", error);
      throw error;
    }
  };