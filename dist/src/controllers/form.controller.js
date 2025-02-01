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
exports.getForm = exports.getForms = exports.getUserForms = exports.getAdminForms = exports.updateFormStatus = exports.deleteForm = exports.updateForm = exports.createForm = void 0;
const prisma_1 = require("../services/prisma");
const createForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.form.create({
            data: {
                form_name: req.body.form_name,
                form_description: req.body.form_description,
                user_id: req.user.id,
                form_fields: {
                    create: req.body.form_fields.map((field) => ({
                        field_type: field.field_type,
                        field_required: field.field_required,
                        field_name: field.field_name,
                        options: field.field_type === 'multiple_choice' || field.field_type === 'dropdown'
                            ? field.options
                            : undefined, // Salva as opções para 'multiple_choice' e 'dropdown'
                    })),
                },
            },
        });
        return res.status(201).json({ message: 'Formulário criado com sucesso.' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erro ao criar formulário.' });
    }
});
exports.createForm = createForm;
const updateForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { form_fields } = req.body;
        for (const field of form_fields) {
            if (field.field_type === 'multiple_choice' || field.field_type === 'dropdown') {
                console.log(field.options);
            }
        }
        yield prisma_1.prisma.form.update({
            where: { id },
            data: {
                form_name: req.body.form_name,
                form_description: req.body.form_description,
            },
        });
        const existingFields = yield prisma_1.prisma.formField.findMany({
            where: { formId: id },
        });
        // IDs dos campos enviados no request
        const updatedFieldIds = req.body.form_fields.map((field) => field.id);
        // Remover campos que não estão mais no formulário
        const fieldsToRemove = existingFields.filter((field) => !updatedFieldIds.includes(field.id));
        yield prisma_1.prisma.formField.deleteMany({
            where: { id: { in: fieldsToRemove.map((field) => field.id) } },
        });
        // Atualizar ou criar campos enviados no request
        for (const field of req.body.form_fields) {
            if (field.id) {
                // Atualizar campo existente
                yield prisma_1.prisma.formField.update({
                    where: { id: field.id },
                    data: {
                        field_type: field.field_type,
                        field_required: field.field_required,
                        field_name: field.field_name,
                        options: field.field_type === 'multiple_choice' || field.field_type === 'dropdown'
                            ? field.options
                            : undefined,
                    }
                });
            }
            else {
                // Criar novo campo
                yield prisma_1.prisma.formField.create({
                    data: {
                        field_name: field.field_name,
                        field_type: field.field_type,
                        field_required: field.field_required,
                        options: field.field_type === 'multiple_choice' ? field.options : undefined,
                        formId: id,
                    },
                });
            }
        }
        return res.status(200).json({
            message: 'Formulário e campos atualizados com sucesso.',
        });
    }
    catch (error) {
        console.error('Erro ao atualizar o formulário:', error);
        return res.status(500).json({ message: 'Erro ao atualizar o formulário.' });
    }
});
exports.updateForm = updateForm;
const deleteForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const booking = yield prisma_1.prisma.booking.findFirst({
            where: {
                formId: id,
            },
        });
        if (booking) {
            return res.status(400).json({ message: 'Este formulário não pode ser deletado pois possui agendamentos associados.' });
        }
        yield prisma_1.prisma.form.delete({
            where: { id },
        });
        return res.status(200).json({ message: 'Formulário deletado com sucesso.' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Erro ao deletar formulário.' });
    }
});
exports.deleteForm = deleteForm;
const updateFormStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
        if (isActive) {
            yield prisma_1.prisma.form.updateMany({
                where: {
                    id: {
                        not: id,
                    },
                },
                data: {
                    isActive: false,
                },
            });
        }
        yield prisma_1.prisma.form.update({
            where: {
                id: id,
            },
            data: {
                isActive: isActive,
            },
        });
        return res.status(200).json({ message: 'Atualizado com sucesso' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateFormStatus = updateFormStatus;
const getAdminForms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forms = yield prisma_1.prisma.form.findMany({
            include: { form_fields: true, user: true },
        });
        if (forms.length === 0) {
            return res.status(400).json({ message: 'Nenhum formulário encontrado.' });
        }
        return res.status(200).json(forms);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getAdminForms = getAdminForms;
const getUserForms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forms = yield prisma_1.prisma.form.findMany({
            where: { isActive: true },
            include: { form_fields: true, user: true },
        });
        if (forms.length === 0) {
            return res.status(400).json({ message: 'Nenhum formulário encontrado.' });
        }
        return res.status(200).json(forms);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUserForms = getUserForms;
const getForms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forms = yield prisma_1.prisma.form.findMany({
            include: { form_fields: true, user: true },
        });
        if (forms.length === 0) {
            return res.status(400).json({ message: "Nenhum formulário encontrado." });
        }
        return res.status(200).json(forms);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getForms = getForms;
const getForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Captura o id da URL
        console.log('form id->', id);
        // Verifique se o id é válido (se necessário)
        if (!id || id.length === 0) {
            console.log('id inválido');
            return res.status(400).json({ message: "ID inválido." });
        }
        // Procure o formulário no banco de dados
        const form = yield prisma_1.prisma.form.findUnique({
            where: { id: id }, // Certifique-se de que o campo de ID no banco é do tipo ObjectId
            include: { form_fields: true },
        });
        if (!form) {
            return res.status(404).json({ message: "Formulário não encontrado." });
        }
        console.log(form);
        return res.status(200).json(form);
    }
    catch (error) {
        return res.status(500).json({ message: "Erro ao buscar o formulário." });
    }
});
exports.getForm = getForm;
