"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ensureDirectoryExistence = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const imagesPath = path_1.default.join(__dirname, '../../client/public/images/');
        // ensureDirectoryExistence(imagesPath);
        cb(null, '../client/public/images/');
    },
    filename: (req, file, cb) => {
        const { id } = req.params;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path_1.default.extname(file.originalname);
        cb(null, `user-${id}-${uniqueSuffix}${fileExtension}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
