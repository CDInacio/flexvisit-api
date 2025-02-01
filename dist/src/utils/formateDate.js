"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formateDate = void 0;
const formateDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date));
};
exports.formateDate = formateDate;
