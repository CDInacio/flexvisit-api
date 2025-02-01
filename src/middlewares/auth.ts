import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuth = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token não fornecido!" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Acesso não autorizado!!" });
    }
    req.user = user;
    next();
  });
};

export const isAdminOrCoordinatorOrAttendant = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (
    req.user.role !== "ADMIN" &&
    req.user.role !== "COORDINATOR" &&
    req.user.role !== "ATTENDANT"
  ) {
    return res
      .status(403)
      .json({ message: "Acesso não autorizado! Não é admin!" });
  }
  next();
};

export const isAdminOrAttendant = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "ATTENDANT") {
    return res
      .status(403)
      .json({ message: "Acesso não autorizado! Não é admin!" });
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "COORDINATOR") {
    return res
      .status(403)
      .json({ message: "Acesso não autorizado! Não é admin!" });
  }
  next();
};
