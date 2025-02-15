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
exports.getAvaliableDates = exports.createSchedule = exports.getSchedule = void 0;
const prisma_1 = require("../services/prisma");
const getSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedules = yield prisma_1.prisma.schedule.findMany({
            include: { timeslots: true },
        });
        return res.status(200).json(schedules);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar as agendas.' });
    }
});
exports.getSchedule = getSchedule;
const createSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedules = req.body;
        for (const schedule of schedules) {
            const invalidTimeSlots = schedule.timeSlots.filter((slot) => slot.starttime === slot.endtime);
            if (invalidTimeSlots.length > 0) {
                return res.status(400).json({
                    message: `Horários inválidos encontrados na data ${schedule.date}. Os horários com starttime igual a endtime não são permitidos.`,
                    invalidTimeSlots,
                });
            }
            // Verificar se já existe uma data no banco
            const existingSchedule = yield prisma_1.prisma.schedule.findUnique({
                where: { date: schedule.date },
                include: { timeslots: true },
            });
            if (existingSchedule) {
                // Filtrar horários que já existem para evitar duplicatas
                const newTimeSlots = schedule.timeSlots.filter((slot) => {
                    return !existingSchedule.timeslots.some((existingSlot) => existingSlot.starttime === slot.starttime &&
                        existingSlot.endtime === slot.endtime);
                });
                if (newTimeSlots.length > 0) {
                    yield prisma_1.prisma.timeslot.createMany({
                        data: newTimeSlots.map((slot) => ({
                            starttime: slot.starttime,
                            endtime: slot.endtime,
                            scheduleId: existingSchedule.id,
                        })),
                    });
                }
            }
            else {
                // Criar nova agenda com horários válidos
                yield prisma_1.prisma.schedule.create({
                    data: {
                        date: schedule.date,
                        timeslots: {
                            create: schedule.timeSlots.map((slot) => ({
                                starttime: slot.starttime,
                                endtime: slot.endtime,
                            })),
                        },
                    },
                });
            }
        }
        return res.status(201).json({ message: 'Agenda criada com sucesso.' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao criar a agenda.' });
    }
});
exports.createSchedule = createSchedule;
const getAvaliableDates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availableSchedules = yield prisma_1.prisma.schedule.findMany({
            include: { timeslots: true },
        });
        return res.status(200).json(availableSchedules);
    }
    catch (error) { }
});
exports.getAvaliableDates = getAvaliableDates;
