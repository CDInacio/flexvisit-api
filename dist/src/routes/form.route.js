"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const form_controller_1 = require("../controllers/form.controller");
exports.formRouter = express_1.default.Router();
exports.formRouter.post("/create", auth_1.isAuth, auth_1.isAdmin, form_controller_1.createForm);
exports.formRouter.delete("/delete/:id", auth_1.isAuth, auth_1.isAdmin, form_controller_1.deleteForm);
exports.formRouter.put("/updateStatus/:id", auth_1.isAuth, auth_1.isAdmin, form_controller_1.updateFormStatus);
exports.formRouter.put("/update/:id", auth_1.isAuth, auth_1.isAdmin, form_controller_1.updateForm);
exports.formRouter.get("/getAll", auth_1.isAuth, form_controller_1.getForms);
exports.formRouter.get("/get/:id", auth_1.isAuth, form_controller_1.getForm);
