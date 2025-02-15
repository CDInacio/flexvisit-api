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
exports.refreshAccessToken = exports.getUserDetails = exports.updateUser = exports.deleteUser = exports.updateUserImg = exports.createBooking = exports.getUser = exports.getAllUsers = exports.signin = exports.signup = exports.teste = void 0;
const prisma_1 = require("../services/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const img_1 = require("../utils/img");
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(password, 10);
});
const teste = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({ message: "Teste" });
});
exports.teste = teste;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullname, document, phoneNumber, email, password, role } = req.body;
    try {
        const user = yield prisma_1.prisma.users.findFirst({
            where: {
                OR: [
                    { email: email },
                    { document: document },
                    { phoneNumber: phoneNumber },
                ],
            },
        });
        if (user) {
            return res.status(400).json({ message: "Usuário ja cadastrado" });
        }
        let newUser = {
            fullname,
            email,
            document,
            phoneNumber,
            password: yield hashPassword(password),
            role: role,
        };
        yield prisma_1.prisma.users.create({
            data: newUser,
        });
        return res.status(201).json({ message: "Usuário criado com sucesso." });
    }
    catch (e) {
        console.log(e);
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ message: 'Usuário não cadastrado!' });
        }
        if (!(yield bcrypt_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: 'As credenciais fornecidas estão incorretas. Por favor, verifique o e-mail e a senha e tente novamente.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: '15d' });
        const payload = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            profileImage: user.profileImage,
            role: user.role,
        };
        console.log(payload);
        return res.status(200).send({ user: payload, token });
    }
    catch (e) {
        console.log(e);
    }
});
exports.signin = signin;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.users.findMany();
        if (!users) {
            return res.status(400).json({ message: "Nenhum usuário encontrado." });
        }
        return res.status(200).json(users);
    }
    catch (e) {
        console.log(e);
    }
});
exports.getAllUsers = getAllUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: { email: req.user.email },
            include: { forms: true, bookings: true },
        });
        if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado." });
        }
        return res.status(200).json(user);
    }
    catch (e) {
        console.log(e);
    }
});
exports.getUser = getUser;
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.createBooking = createBooking;
const updateUserImg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id não informado." });
        }
        const imageFile = req.file;
        console.log(imageFile);
        if (!imageFile) {
            return res.status(400).json({ message: "Imagem não fornecida." });
        }
        // Faz o upload para o ImgBB
        const imageUrl = yield (0, img_1.uploadImageToImgBB)(imageFile);
        console.log(imageUrl);
        // Atualiza o usuário no banco
        const updatedUser = yield prisma_1.prisma.users.update({
            where: { id },
            data: { profileImage: imageUrl },
        });
        return res.status(200).json({
            message: "Imagem do usuário atualizada com sucesso.",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao atualizar o usuário." });
    }
});
exports.updateUserImg = updateUserImg;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id não informado." });
        }
        yield prisma_1.prisma.booking.deleteMany({
            where: { userId: id },
        });
        yield prisma_1.prisma.users.delete({
            where: { id: id },
        });
        return res.status(200).json({ message: "Usuário deletado com sucesso." });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao deletar o usuário." });
    }
});
exports.deleteUser = deleteUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const updatedUser = yield prisma_1.prisma.users.update({
            where: { id: id },
            data: Object.assign({}, req.body),
        });
        return res
            .status(200)
            .json({ message: "Usuário atualizado com sucesso.", user: updatedUser });
    }
    catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar o usuário." });
    }
});
exports.updateUser = updateUser;
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: { id },
            include: { forms: true, bookings: true },
        });
        if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado." });
        }
        return res.status(200).json(user);
    }
    catch (e) {
        console.log(e);
    }
});
exports.getUserDetails = getUserDetails;
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies; // Ou req.body, dependendo de como está sendo enviado
    if (!refreshToken) {
        return res.status(403).json({ message: "Refresh Token não fornecido!" });
    }
    try {
        // Verifica se o Refresh Token é válido
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Verifica se o Refresh Token está no banco de dados
        const storedToken = yield prisma_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!storedToken) {
            return res.status(403).json({ message: "Refresh Token inválido!" });
        }
        // Gera um novo Access Token
        const newAccessToken = jsonwebtoken_1.default.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        return res.status(200).json({ accessToken: newAccessToken });
    }
    catch (error) {
        console.error(error);
        return res.status(403).json({ message: "Refresh Token inválido ou expirado!" });
    }
});
exports.refreshAccessToken = refreshAccessToken;
// export const logout = async (req: Request, res: Response) => {
//   const { refreshToken } = req.cookies;
//   if (!refreshToken) {
//     return res.status(400).json({ message: "Nenhum token fornecido!" });
//   }
//   try {
//     // Remove o Refresh Token do banco
//     await prisma.refreshToken.delete({
//       where: { token: refreshToken },
//     });
//     // Remove o cookie do cliente
//     res.clearCookie("refreshToken");
//     return res.status(200).json({ message: "Logout realizado com sucesso!" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Erro ao realizar logout." });
//   }
// };
