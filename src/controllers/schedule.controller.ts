import { Request, Response } from 'express'
import { prisma } from '../services/prisma'

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { timeslots: true },
    });

    return res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar as agendas.' });
  }
}

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const schedules = req.body;

    for (const schedule of schedules) {
      const invalidTimeSlots = schedule.timeSlots.filter(
        (slot: any) => slot.starttime === slot.endtime
      );

      if (invalidTimeSlots.length > 0) {
        return res.status(400).json({
          message: `Horários inválidos encontrados na data ${schedule.date}. Os horários com starttime igual a endtime não são permitidos.`,
          invalidTimeSlots,
        });
      }

      // Verificar se já existe uma data no banco
      const existingSchedule = await prisma.schedule.findUnique({
        where: { date: schedule.date },
        include: { timeslots: true },
      });

      if (existingSchedule) {
        // Filtrar horários que já existem para evitar duplicatas
        const newTimeSlots = schedule.timeSlots.filter((slot: any) => {
          return !existingSchedule.timeslots.some(
            (existingSlot) =>
              existingSlot.starttime === slot.starttime &&
              existingSlot.endtime === slot.endtime
          );
        });

        if (newTimeSlots.length > 0) {
          await prisma.timeslot.createMany({
            data: newTimeSlots.map((slot: any) => ({
              starttime: slot.starttime,
              endtime: slot.endtime,
              scheduleId: existingSchedule.id,
            })),
          });
        }
      } else {
        // Criar nova agenda com horários válidos
        await prisma.schedule.create({
          data: {
            date: schedule.date,
            timeslots: {
              create: schedule.timeSlots.map((slot: any) => ({
                starttime: slot.starttime,
                endtime: slot.endtime,
              })),
            },
          },
        });
      }
    }

    return res.status(201).json({ message: 'Agenda criada com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar a agenda.' });
  }
};

export const getAvaliableDates = async (req: Request, res: Response) => {
  try {
    const availableSchedules = await prisma.schedule.findMany({
      include: { timeslots: true },
    });

    return res.status(200).json(availableSchedules);
  } catch (error) {}
};
