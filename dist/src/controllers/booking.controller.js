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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataOverview = exports.getBookingById = exports.deleteBooking = exports.updateBooking = exports.updateBookingStatus = exports.getUserBookings = exports.getBookings = exports.createBooking = void 0;
const prisma_1 = require("../services/prisma");
const email_service_1 = require("../services/email-service");
const qrcode_1 = __importDefault(require("qrcode"));
const dataDiference_1 = require("../utils/dataDiference");
const compressQrCode_1 = require("../utils/compressQrCode");
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { formId } = _a, formData = __rest(_a, ["formId"]);
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: {
                email: req.user.email,
            },
        });
        const dates = yield prisma_1.prisma.schedule.findFirst({
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
        const selectedHour = dates.timeslots.find((timeslot) => timeslot.starttime === formData.starttime &&
            timeslot.endtime === formData.endtime);
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
        const schedule = yield prisma_1.prisma.schedule.findFirst({
            where: {
                date: formData.data,
            },
        });
        if (!schedule) {
            console.log("Data não disponível.");
            return res.status(400).json({ message: "Data não disponível." });
        }
        yield prisma_1.prisma.schedule.update({
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
        yield prisma_1.prisma.booking.create({
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
        yield prisma_1.prisma.notification.create({
            data: {
                message: "Novo agendamento!",
                description: `${formData.data} às ${formData.starttime} - ${formData.endtime}`,
                recipientId: null,
                recipientRole: "ADMIN",
            },
        });
        res.status(201).json({ message: "Agendamento realizado com sucesso!" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao realizar o agendamento." });
    }
});
exports.createBooking = createBooking;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield prisma_1.prisma.booking.findMany({
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
    }
    catch (error) {
        console.log(error);
    }
});
exports.getBookings = getBookings;
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: {
                email: req.user.email,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }
        const bookings = yield prisma_1.prisma.booking.findMany({
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
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUserBookings = getUserBookings;
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, userId, role, observation } = req.body;
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }
        const form = yield prisma_1.prisma.form.findUnique({
            where: {
                id: req.body.booking.formId,
            },
        });
        const bookingInfo = `
      Agendamento:
      - Nome: ${user.fullname}
      - Status: ${status}
      - Data: ${req.body.booking.data.data}
      - Hora: ${req.body.booking.data["starttime"] || ""} - ${req.body.booking.data["endtime"] || ""}
      - Formulário: ${form === null || form === void 0 ? void 0 : form.form_name}
      - Observação: ${req.body.observation || ""}
      - Link para mais detalhes: https:seusite.com/agendamento/${id}
    `;
        const updateData = {
            status: status,
            observation: req.body.observation,
        };
        const qrCodeDataURL = yield qrcode_1.default.toDataURL(bookingInfo);
        if (status === "aprovado" && qrCodeDataURL) {
            const compressedQrCode = yield (0, compressQrCode_1.compressQrCode)(qrCodeDataURL);
            updateData.qrCode = `data:image/jpeg;base64,${compressedQrCode}`;
        }
        yield email_service_1.transporter.sendMail({
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
        <p>Horário: ${req.body.booking.data["starttime"] || ""} - ${req.body.booking.data["endtime"] || ""}</p>
        <p>Veja o QR Code anexado para mais informações sobre o seu agendamento.</p>
      `,
            attachments: [
                {
                    filename: "qrcode.png",
                    content: yield qrcode_1.default.toBuffer(bookingInfo),
                    contentType: "image/png",
                },
            ],
        });
        if (status === "cancelado") {
            const starttime = req.body.booking.data["starttime"];
            const scheduleDate = req.body.booking.data["data"];
            const scheduleDateTime = `${scheduleDate} ${starttime}`;
            const { days, hours } = (0, dataDiference_1.calculateDateDifference)(scheduleDateTime);
            const schedule = yield prisma_1.prisma.schedule.findFirst({
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
                yield prisma_1.prisma.schedule.update({
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
        const updatedBooking = yield prisma_1.prisma.booking.update({
            where: {
                id: id,
            },
            data: updateData,
        });
        yield prisma_1.prisma.notification.create({
            data: {
                message: "Status do agendamento atualizado!",
                description: "O status do seu agendamento foi atualizado para " + status,
                recipientId: userId,
                recipientRole: role,
            },
        });
        res.status(200).json(updatedBooking);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao atualizar o agendamento" });
    }
});
exports.updateBookingStatus = updateBookingStatus;
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const _b = req.body, { starttime, endtime, data: newDate } = _b, otherFields = __rest(_b, ["starttime", "endtime", "data"]);
    const { id: userId } = req.user;
    try {
        const user = yield prisma_1.prisma.users.findUnique({
            where: {
                id: userId,
            },
        });
        // Buscar o agendamento existente
        const booking = yield prisma_1.prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) {
            return res.status(404).json({ error: "Agendamento não encontrado." });
        }
        const bookingData = booking.data || {};
        const oldstarttime = bookingData["starttime"];
        const oldendtime = bookingData["endtime"];
        const oldDate = bookingData["data"];
        // Se a data for alterada, buscar as agendas da data antiga e da nova
        const oldSchedule = yield prisma_1.prisma.schedule.findUnique({
            where: { date: oldDate },
            include: { timeslots: true },
        });
        const newSchedule = yield prisma_1.prisma.schedule.findUnique({
            where: { date: newDate },
            include: { timeslots: true },
        });
        if (newDate !== oldDate ||
            starttime !== oldstarttime ||
            endtime !== oldendtime) {
            // Liberar o horário antigo
            if (oldSchedule) {
                yield prisma_1.prisma.timeslot.updateMany({
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
            const timeslotUpdated = yield prisma_1.prisma.timeslot.updateMany({
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
        const updatedBooking = yield prisma_1.prisma.booking.update({
            where: { id },
            data: {
                data: Object.assign(Object.assign(Object.assign({}, (typeof booking.data === "object" ? booking.data : {})), otherFields), { starttime,
                    endtime, data: newDate }),
            },
        });
        console.log(user);
        yield prisma_1.prisma.notification.create({
            data: {
                message: "Um agendamento foi atualizado!",
                description: `O usuário ${user === null || user === void 0 ? void 0 : user.fullname} atualizou seu agendamento.`,
                recipientId: null,
                recipientRole: "ADMIN",
            },
        });
        return res.status(200).json(updatedBooking);
    }
    catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});
exports.updateBooking = updateBooking;
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { id } = req.params;
    try {
        // Buscar o agendamento
        const booking = yield prisma_1.prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) {
            return res.status(404).json({ error: "Agendamento não encontrado." });
        }
        // Buscar a agenda relacionada
        const schedule = yield prisma_1.prisma.schedule.findFirst({
            where: {
                date: (_c = booking.data) === null || _c === void 0 ? void 0 : _c["data"],
            },
            include: {
                timeslots: true,
            },
        });
        if (!schedule) {
            return res.status(404).json({ error: "Agenda não encontrada." });
        }
        const bookingData = booking.data;
        if (!bookingData) {
            return res
                .status(400)
                .json({ error: "Dados do agendamento não encontrados." });
        }
        const starttime = bookingData["starttime"];
        const scheduleDate = bookingData["data"];
        const scheduleDateTime = `${scheduleDate} ${starttime}`;
        const { days, hours } = (0, dataDiference_1.calculateDateDifference)(scheduleDateTime);
        if (days >= 1) {
            yield prisma_1.prisma.timeslot.updateMany({
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
        yield prisma_1.prisma.booking.delete({
            where: { id },
        });
        return res
            .status(200)
            .json({ message: "Agendamento removido com sucesso." });
    }
    catch (error) {
        console.error("Erro ao deletar agendamento:", error);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});
exports.deleteBooking = deleteBooking;
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const form = yield prisma_1.prisma.booking.findUnique({
            where: { id },
            include: { form: true },
        });
        if (!form) {
            return res.status(400).json({ message: "Formulário não encontrado." });
        }
        return res.status(200).json(form);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getBookingById = getBookingById;
const getDataOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forms = yield prisma_1.prisma.form.findMany();
        const bookings = yield prisma_1.prisma.booking.findMany();
        const totalBookingsByStatus = yield prisma_1.prisma.booking.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });
        const totalUsers = yield prisma_1.prisma.users.count();
        const newUsersLastMonth = yield prisma_1.prisma.users.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Últimos 30 dias
                },
            },
        });
        const recentBookings = yield prisma_1.prisma.booking.findMany({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao obter visão geral dos dados" });
    }
});
exports.getDataOverview = getDataOverview;
