import sharp from "sharp";

export async function compressQrCode(base64Image: string) {
  const buffer = Buffer.from(base64Image, "base64");

  const compressedBuffer = await sharp(buffer)
    .resize(300, 300)
    .jpeg({ quality: 80 })
    .toBuffer();

  return compressedBuffer.toString("base64");
}
