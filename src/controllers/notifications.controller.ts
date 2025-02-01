import { Request, Response } from "express";
import { prisma } from "../services/prisma";

export const getNotifications = async (req: any, res: Response) => {
  const isAdmin = req.user.role === 'ADMIN';

  try {
    const condition = isAdmin
      ? { recipientId: null, read: false }
      : { recipientId: req.user.id, read: false };

    const notifications = await prisma.notification.findMany({
      where: condition,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao buscar notificações." });
  }
};


export const markAsRead = async (req: any, res: Response) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';

    const condition = isAdmin ? {
      recipientId: null,
      read: false,
    } : { recipientId: req.user.id, read: false, };

    await prisma.notification.updateMany({
      where: condition,
      data: {
        read: true,
      },
    });
    res.status(200).json({ message: "Notificações marcadas como lidas!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao marcar notificações como lidas." });
  }

}