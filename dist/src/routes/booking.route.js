"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const booking_controller_1 = require("../controllers/booking.controller");
exports.bookingRouter = express_1.default.Router();
exports.bookingRouter.post("/create", auth_1.isAuth, booking_controller_1.createBooking);
exports.bookingRouter.get("/getAll", auth_1.isAuth, booking_controller_1.getBookings);
exports.bookingRouter.get("/user", auth_1.isAuth, booking_controller_1.getUserBookings);
exports.bookingRouter.get("/getBookingById/:id", auth_1.isAuth, booking_controller_1.getBookingById);
exports.bookingRouter.delete("/delete/:id", auth_1.isAuth, booking_controller_1.deleteBooking);
exports.bookingRouter.put("/updateStatus/:id", auth_1.isAuth, auth_1.isAdminOrAttendant, booking_controller_1.updateBookingStatus);
exports.bookingRouter.put("/update/:id", auth_1.isAuth, booking_controller_1.updateBooking);
exports.bookingRouter.get("/overview", auth_1.isAuth, auth_1.isAdminOrAttendant, booking_controller_1.getDataOverview);
