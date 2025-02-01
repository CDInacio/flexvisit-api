import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";

export const uploadImageToImgBB = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY_IMGBB;

    if (!apiKey) {
      throw new Error("API Key do ImgBB não configurada.");
    }

    if (!file || !file.buffer) {
      throw new Error("Buffer não encontrado no arquivo.");
    }

    // Processar a imagem com Sharp (redimensionar e comprimir)
    const processedImage = await sharp(file.buffer)
      .resize({ width: 800 }) // Redimensiona a largura para 800px (mantém proporção)
      .jpeg({ quality: 80 }) // Converte para JPEG com 80% de qualidade
      .toBuffer();

    // Converter a imagem processada para Base64
    const base64Image = processedImage.toString("base64");

    // Criar o formData para envio ao ImgBB
    const formData = new FormData();
    formData.append("image", base64Image);

    // Fazer o upload para o ImgBB
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data.data.url; // Retorna a URL da imagem
  } catch (error) {
    const err = error as any;
    console.error(
      "Erro ao fazer upload para o ImgBB:",
      err.response?.data || err.message
    );
    throw new Error("Erro ao fazer upload da imagem.");
  }
};
