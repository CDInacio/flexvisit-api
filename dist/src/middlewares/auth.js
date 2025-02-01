"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAdminOrAttendant = exports.isAdminOrCoordinatorOrAttendant = exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Token não fornecido!" });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ message: "Acesso não autorizado!!" });
        }
        req.user = user;
        next();
    });
};
exports.isAuth = isAuth;
const isAdminOrCoordinatorOrAttendant = (req, res, next) => {
    if (req.user.role !== "ADMIN" &&
        req.user.role !== "COORDINATOR" &&
        req.user.role !== "ATTENDANT") {
        return res
            .status(403)
            .json({ message: "Acesso não autorizado! Não é admin!" });
    }
    next();
};
exports.isAdminOrCoordinatorOrAttendant = isAdminOrCoordinatorOrAttendant;
const isAdminOrAttendant = (req, res, next) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "ATTENDANT") {
        return res
            .status(403)
            .json({ message: "Acesso não autorizado! Não é admin!" });
    }
    next();
};
exports.isAdminOrAttendant = isAdminOrAttendant;
const isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "COORDINATOR") {
        return res
            .status(403)
            .json({ message: "Acesso não autorizado! Não é admin!" });
    }
    next();
};
exports.isAdmin = isAdmin;
