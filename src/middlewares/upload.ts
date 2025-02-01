import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ensureDirectoryExistence = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesPath = path.join(__dirname, '../../client/public/images/');
    // ensureDirectoryExistence(imagesPath);
    cb(null, '../client/public/images/');
  },
  filename: (req, file, cb) => {
    const { id } = req.params; 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname); 
    cb(null, `user-${id}-${uniqueSuffix}${fileExtension}`); 
  },
});

export const upload = multer({
  storage: multer.memoryStorage(), 
});