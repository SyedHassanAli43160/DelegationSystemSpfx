const API_BASE_URL = "https://ecryptdecryptapi.azurewebsites.net/api/Encryption"; // Replace with actual API URL


export const encryptString = async (text: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/encrypt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Text: text
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to encrypt data.");
    }

    const result = await response.text();
    console.log("result",result);
    return result; // Assuming API returns { encryptedData: "..." }
  } catch (error) {
    console.error("Error during encryption:", error);
    throw error;
  }
};
export const decryptString = (cipherText: string) => {
  return fetch(`${API_BASE_URL}/decrypt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Text: cipherText
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to decrypt data.");
      }
      return response.text(); // Assuming API returns raw decrypted string
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.error("Error during decryption:", error);
      throw error;
    });
};
