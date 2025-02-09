import { Request, Response } from "express";
import { prisma } from "../services/prisma";
import { transporter } from "../services/email-service";
import QRCode from "qrcode";
import { calculateDateDifference } from "../utils/dataDiference";
import { uploadImageToImgBB } from "../utils/img";

export const createBooking = async (req: any, res: Response) => {
  const { formId, ...formData } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        email: req.user.email,
      },
    });

    const dates = await prisma.schedule.findFirst({
      where: {
        date: formData.data,
      },
      include: {
        timeslots: true,
      },
    });

    if (!dates) {
      return res.status(400).json({ message: "Data não disponível." });
    }

    const selectedHour = dates.timeslots.find(
      (timeslot) =>
        timeslot.starttime === formData.starttime &&
        timeslot.endtime === formData.endtime
    );

    if (!selectedHour || !selectedHour.available) {
      return res.status(400).json({ message: "Horário não disponível." });
    }

    if (!user) {
      return res.status(403).json({ message: "Usuário não encontrado!" });
    }

    if (!formId || !formData) {
      return res.status(400).json({
        message: "Formulário ou dados do agendamento não fornecidos.",
      });
    }

    const schedule = await prisma.schedule.findFirst({
      where: {
        date: formData.data,
      },
    });

    if (!schedule) {
      console.log("Data não disponível.");
      return res.status(400).json({ message: "Data não disponível." });
    }

    await prisma.schedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        timeslots: {
          updateMany: {
            where: {
              starttime: formData.starttime,
              endtime: formData.endtime,
            },
            data: {
              available: false,
            },
          },
        },
      },
    });

    await prisma.booking.create({
      data: {
        form: {
          connect: { id: formId },
        },
        user: {
          connect: { id: user.id },
        },
        data: formData,
      },
    });

    await prisma.notification.create({
      data: {
        message: "Novo agendamento!",
        description: `${formData.data} às ${formData.starttime} - ${formData.endtime}`,
        recipientId: null,
        recipientRole: "ADMIN",
      },
    });

    res.status(201).json({ message: "Agendamento realizado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao realizar o agendamento." });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    if (!bookings) {
      return res
        .status(404)
        .json({ message: "Nenhum agendamento encontrado!" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
  }
};

export const getUserBookings = async (req: any, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        email: req.user.email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        form: true,
      },
    });

    if (!bookings) {
      return res
        .status(404)
        .json({ message: "Nenhum agendamento encontrado!" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, userId, role } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    const form = await prisma.form.findUnique({
      where: {
        id: req.body.booking.formId,
      },
    });

    const bookingInfo = `
      Agendamento:
      - Nome: ${user.fullname}
      - Status: ${status}
      - Data: ${req.body.booking.data.data}
      - Hora: ${req.body.booking.data["starttime"] || ""} - ${
      req.body.booking.data["endtime"] || ""
    }
      - Formulário: ${form?.form_name}
      - Observação: ${req.body.observation || ""}
      - Link para mais detalhes: https:seusite.com/agendamento/${id}
    `;

    // const qrCodeDataURL = await QRCode.toDataURL(bookingInfo);

    let qrCodeUrl = null;

    if (status === "aprovado") {
      const qrCodeBuffer = await QRCode.toBuffer(bookingInfo);

      const fakeFile: Express.Multer.File = {
        fieldname: "qrCode",
        originalname: "qrcode.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: qrCodeBuffer.length,
        buffer: qrCodeBuffer,
        destination: "",
        filename: "",
        path: "",
        stream: null as any,
      };
      console.log("Iniciano upload da imagem para o ImgBB...");

      qrCodeUrl = await uploadImageToImgBB(fakeFile);
    }

    await transporter.sendMail({
      from: `"Agendamento" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Status do agendamento atualizado",
      html: `
        <div style="background-color: #0F172A; padding: 20px; text-align: center; color: white;">
          <img src="https:i.imgur.com/X0knn9X.png" alt="Logo" style="width: 250px; height: auto;" />
          <p>Obrigado por usar nossos serviços!</p>
        </div>
        <h3>Informações do agendamento:</h3>
        <p>Status: ${status}</p>
        <p>Data: ${req.body.booking.data.data}</p>
        <p>Horário: ${req.body.booking.data["starttime"] || ""} - ${
        req.body.booking.data["endtime"] || ""
      }</p>
        <p>Veja o QR Code anexado para mais informações sobre o seu agendamento.</p>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: await QRCode.toBuffer(bookingInfo),
          contentType: "image/png",
        },
      ],
    });

    if (status === "cancelado") {
      const starttime = req.body.booking.data["starttime"];
      const scheduleDate = req.body.booking.data["data"];
      const scheduleDateTime = `${scheduleDate} ${starttime}`;
      const { days, hours } = calculateDateDifference(scheduleDateTime);

      const schedule = await prisma.schedule.findFirst({
        where: {
          date: req.body.booking.data.data,
        },
        include: {
          timeslots: true,
        },
      });

      if (!schedule) {
        throw new Error("Schedule not found");
      }

      if (days >= 1) {
        await prisma.schedule.update({
          where: {
            id: schedule.id,
          },
          data: {
            timeslots: {
              updateMany: {
                where: {
                  starttime: req.body.booking.data["starttime"],
                  endtime: req.body.booking.data["endtime"],
                },
                data: {
                  available: true,
                },
              },
            },
          },
        });
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: id,
      },
      data: {
        status: status,
        qrCode: qrCodeUrl,
      },
    });

    await prisma.notification.create({
      data: {
        message: "Status do agendamento atualizado!",
        description:
          "O status do seu agendamento foi atualizado para " + status,
        recipientId: userId,
        recipientRole: role,
      },
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao atualizar o agendamento" });
  }
};

export const updateBooking = async (req: any, res: Response) => {
  const { id } = req.params;
  const { starttime, endtime, data: newDate, ...otherFields } = req.body;
  const { id: userId } = req.user;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    // Buscar o agendamento existente
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    const bookingData = (booking.data as Record<string, any>) || {};

    const oldstarttime = bookingData["starttime"];
    const oldendtime = bookingData["endtime"];
    const oldDate = bookingData["data"];

    // Se a data for alterada, buscar as agendas da data antiga e da nova
    const oldSchedule = await prisma.schedule.findUnique({
      where: { date: oldDate },
      include: { timeslots: true },
    });
    const newSchedule = await prisma.schedule.findUnique({
      where: { date: newDate },
      include: { timeslots: true },
    });

    if (
      newDate !== oldDate ||
      starttime !== oldstarttime ||
      endtime !== oldendtime
    ) {
      // Liberar o horário antigo
      if (oldSchedule) {
        await prisma.timeslot.updateMany({
          where: {
            scheduleId: oldSchedule.id,
            starttime: oldstarttime,
            endtime: oldendtime,
          },
          data: { available: true },
        });
      }

      // Ocupa o novo horário
      if (!newSchedule) {
        return res.status(404).json({ error: "Nova agenda não encontrada." });
      }

      const timeslotUpdated = await prisma.timeslot.updateMany({
        where: {
          scheduleId: newSchedule.id,
          starttime,
          endtime,
          available: true, // Garante que só altera se o horário estiver disponível
        },
        data: { available: false },
      });

      // Verificar se o novo horário não estava disponível
      if (timeslotUpdated.count === 0) {
        return res
          .status(400)
          .json({ error: "O horário solicitado não está disponível." });
      }
    }

    // Atualizar os campos enviados
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        data: {
          ...(typeof booking.data === "object" ? booking.data : {}),
          ...otherFields,
          starttime,
          endtime,
          data: newDate,
        },
      },
    });
    console.log(user);

    await prisma.notification.create({
      data: {
        message: "Um agendamento foi atualizado!",
        description: `O usuário ${user?.fullname} atualizou seu agendamento.`,
        recipientId: null,
        recipientRole: "ADMIN",
      },
    });

    return res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Buscar o agendamento
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    // Buscar a agenda relacionada
    const schedule = await prisma.schedule.findFirst({
      where: {
        date: (booking.data as Record<string, any>)?.["data"],
      },
      include: {
        timeslots: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Agenda não encontrada." });
    }

    const bookingData = booking.data as Record<string, any> | null;
    if (!bookingData) {
      return res
        .status(400)
        .json({ error: "Dados do agendamento não encontrados." });
    }
    const starttime = bookingData["starttime"];
    const scheduleDate = bookingData["data"];
    const scheduleDateTime = `${scheduleDate} ${starttime}`;
    const { days, hours } = calculateDateDifference(scheduleDateTime);

    if (days >= 1) {
      await prisma.timeslot.updateMany({
        where: {
          scheduleId: schedule.id,
          starttime: bookingData["starttime"],
          endtime: bookingData["endtime"],
        },
        data: {
          available: true,
        },
      });
    }

    await prisma.booking.delete({
      where: { id },
    });

    return res
      .status(200)
      .json({ message: "Agendamento removido com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const form = await prisma.booking.findUnique({
      where: { id },
      include: { form: true },
    });
    if (!form) {
      return res.status(400).json({ message: "Formulário não encontrado." });
    }

    return res.status(200).json(form);
  } catch (error) {
    console.log(error);
  }
};

export const getDataOverview = async (req: Request, res: Response) => {
  try {
    const forms = await prisma.form.findMany();
    const bookings = await prisma.booking.findMany();

    const totalBookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const totalUsers = await prisma.users.count();

    const newUsersLastMonth = await prisma.users.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Últimos 30 dias
        },
      },
    });

    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      forms: forms.length,
      bookings: bookings.length,
      totalUsers,
      newUsersLastMonth,
      totalBookingsByStatus,
      recentBookingsCount: recentBookings.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao obter visão geral dos dados" });
  }
};
