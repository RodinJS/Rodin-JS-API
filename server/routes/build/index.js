import express from "express";
import iosRouter from "./ios";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../../uploads/'));
  },

  filename: function (req, file, cb) {
    let nameArray = file.originalname.split('.');
    nameArray.splice(-1, 0, Date.now());
    let newName = nameArray.join('.');
    console.log(newName);
    cb(null, newName);
  }
});

const upload = multer({storage: storage});

const router = express.Router();

router.use('/ios', upload.fields(
  [
    {
      name: 'icon-m',
      maxCount: 1
    },
    {
      name: 'icon-h',
      maxCount: 1
    },
    {
      name: 'icon-xh',
      maxCount: 1
    },
    {
      name: 'icon-xxh',
      maxCount: 1
    },
    {
      name: 'icon-xxxh',
      maxCount: 1
    },
    {
      name: 'cert',
      maxCount: 1
    },
    {
      name: 'profile',
      maxCount: 1
    }
  ]
));
router.use('/ios', iosRouter);

export default router;
