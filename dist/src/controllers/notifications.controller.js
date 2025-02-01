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
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = require("../services/prisma");
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isAdmin = req.user.role === 'ADMIN';
    try {
        const condition = isAdmin
            ? { recipientId: null, read: false }
            : { recipientId: req.user.id, read: false };
        const notifications = yield prisma_1.prisma.notification.findMany({
            where: condition,
            orderBy: {
                createdAt: "desc",
            },
        });
        return res.status(200).json(notifications);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao buscar notificações." });
    }
});
exports.getNotifications = getNotifications;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isAdmin = req.user.role === 'ADMIN';
        const condition = isAdmin ? {
            recipientId: null,
            read: false,
        } : { recipientId: req.user.id, read: false, };
        yield prisma_1.prisma.notification.updateMany({
            where: condition,
            data: {
                read: true,
            },
        });
        res.status(200).json({ message: "Notificações marcadas como lidas!" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erro ao marcar notificações como lidas." });
    }
});
exports.markAsRead = markAsRead;
