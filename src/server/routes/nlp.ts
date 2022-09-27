import { Router } from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import path from 'path';
import multer from 'multer';

import { getReply } from '../../services/nlp/gpt';
// import { getTranscript } from '../../services/nlp/transcription';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const jsonParser = bodyParser.json();
const dirName = 'uploads';
const dir = path.join(__dirname, dirName);

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.wav');
  },
});

const upload = multer({ storage: storage });

router.post('/gpt', jsonParser, async (req, response) => {
  const { messages } = req.body;

  try {
    const reply = await getReply(messages);

    return response.status(200).json({ message: 'success', data: reply });
  } catch (error) {
    console.log(error.message);
    return response.status(400).json({ message: error.message });
  }
});
// .post(
//   '/transcript',
//   upload.single('sample'),
//   async function (req: any, response, next) {
//     try {
//       const data = await getTranscript(req.file.path);
//       fs.unlinkSync(req.file.path);

//       return response.status(200).json({ message: 'success', data });
//     } catch (error) {
//       console.log(error.message);
//       return response.status(400).json({ message: error.message });
//     }
//   }
// );

export default router;
