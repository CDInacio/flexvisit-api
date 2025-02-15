"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDateDifference = void 0;
const parseDateTime = (dateTime) => {
    const [datePart, timePart] = dateTime === null || dateTime === void 0 ? void 0 : dateTime.split(" ");
    const [day, month, year] = datePart === null || datePart === void 0 ? void 0 : datePart.split("/");
    const [hours, minutes] = timePart === null || timePart === void 0 ? void 0 : timePart.split(":");
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
};
const calculateDateDifference = (scheduleDateTime) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
    const date1 = parseDateTime(formattedDateTime);
    const date2 = parseDateTime(scheduleDateTime);
    const differenceInMilliseconds = date2.getTime() - date1.getTime();
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    const remainingMinutes = Math.floor(differenceInMinutes % 60);
    const differenceInDays = Math.floor(differenceInHours / 24);
    const remainingHours = differenceInHours % 24;
    return {
        days: differenceInDays,
        hours: remainingHours,
        minutes: remainingMinutes,
    };
};
exports.calculateDateDifference = calculateDateDifference;
