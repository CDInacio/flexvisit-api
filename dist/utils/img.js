"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToImgBB = void 0;
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const uploadImageToImgBB = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const apiKey = process.env.API_KEY_IMGBB;
        if (!apiKey) {
            throw new Error("API Key do ImgBB não configurada.");
        }
        if (!file || !file.buffer) {
            throw new Error("Buffer não encontrado no arquivo.");
        }
        // Processar a imagem com Sharp (redimensionar e comprimir)
        const processedImage = yield (0, sharp_1.default)(file.buffer)
            .resize({ width: 800 }) // Redimensiona a largura para 800px (mantém proporção)
            .jpeg({ quality: 80 }) // Converte para JPEG com 80% de qualidade
            .toBuffer();
        // Converter a imagem processada para Base64
        const base64Image = processedImage.toString("base64");
        // Criar o formData para envio ao ImgBB
        const formData = new form_data_1.default();
        formData.append("image", base64Image);
        // Fazer o upload para o ImgBB
        const response = yield axios_1.default.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
            headers: formData.getHeaders(),
        });
        return response.data.data.url; // Retorna a URL da imagem
    }
    catch (error) {
        const err = error;
        console.error("Erro ao fazer upload para o ImgBB:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        throw new Error("Erro ao fazer upload da imagem.");
    }
});
exports.uploadImageToImgBB = uploadImageToImgBB;
