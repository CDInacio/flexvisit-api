import express from "express";
import { isAdminOrAttendant, isAuth } from "../middlewares/auth";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  getDataOverview,
  getUserBookings,
  updateBooking,
  updateBookingStatus,
} from "../controllers/booking.controller";

export const bookingRouter = express.Router();

bookingRouter.post("/create", isAuth, createBooking);
bookingRouter.get("/getAll", isAuth, getBookings);
bookingRouter.get("/user", isAuth, getUserBookings);
bookingRouter.get("/getBookingById/:id", isAuth, getBookingById);
bookingRouter.delete("/delete/:id", isAuth, deleteBooking);
bookingRouter.put(
  "/updateStatus/:id",
  isAuth,
  isAdminOrAttendant,
  updateBookingStatus
);
bookingRouter.put("/update/:id", isAuth, updateBooking);
bookingRouter.get("/overview", isAuth, isAdminOrAttendant, getDataOverview);
