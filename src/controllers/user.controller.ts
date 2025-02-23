import e, { Request, Response } from "express";
import { User } from "../../types/user";
import { prisma } from "../services/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { uploadImageToImgBB } from "../utils/img";
import { ObjectId } from "mongodb";

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const teste = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "Teste" });
};

export const signup = async (req: Request, res: Response) => {
  const { fullname, document, phoneNumber, email, password, role } =
    req.body as User;

  try {
    const user = await prisma.users.findFirst({
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
      password: await hashPassword(password),
      role: role as Role,
    };

    await prisma.users.create({
      data: newUser,
    });

    return res.status(201).json({ message: "Usuário criado com sucesso." });
  } catch (e) {
    console.log(e);
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body as User;
  console.log(req.body);
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Usuário não cadastrado!" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({
          message:
            "As credenciais fornecidas estão incorretas. Por favor, verifique o e-mail e a senha e tente novamente.",
        });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { algorithm: "HS256", expiresIn: "15d" }
    );

    const payload = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };
    console.log(payload);
    return res.status(200).send({ user: payload, token });
  } catch (e) {
    console.log(e);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();
    if (!users) {
      return res.status(400).json({ message: "Nenhum usuário encontrado." });
    }
    return res.status(200).json(users);
  } catch (e) {
    console.log(e);
  }
};

export const getUser = async (req: any, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email: req.user.email },
      include: { forms: true, bookings: true },
    });

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(user);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const createBooking = async (req: Request, res: Response) => {};

export const updateUserImg = async (req: Request, res: Response) => {
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
    const imageUrl = await uploadImageToImgBB(imageFile);
    console.log(imageUrl);
    // Atualiza o usuário no banco
    const updatedUser = await prisma.users.update({
      where: { id },
      data: { profileImage: imageUrl },
    });

    return res.status(200).json({
      message: "Imagem do usuário atualizada com sucesso.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar o usuário." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Id não informado." });
    }

    await prisma.booking.deleteMany({
      where: { userId: id },
    });

    await prisma.users.delete({
      where: { id: id },
    });

    return res.status(200).json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao deletar o usuário." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedUser = await prisma.users.update({
      where: { id: id },
      data: { ...req.body },
    });

    return res
      .status(200)
      .json({ message: "Usuário atualizado com sucesso.", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar o usuário." });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: { forms: true, bookings: true },
    });

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(user);
  } catch (e) {
    console.log(e);
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies; // Ou req.body, dependendo de como está sendo enviado

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh Token não fornecido!" });
  }

  try {
    // Verifica se o Refresh Token é válido
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    // Verifica se o Refresh Token está no banco de dados
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res.status(403).json({ message: "Refresh Token inválido!" });
    }

    // Gera um novo Access Token
    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    return res
      .status(403)
      .json({ message: "Refresh Token inválido ou expirado!" });
  }
};

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
