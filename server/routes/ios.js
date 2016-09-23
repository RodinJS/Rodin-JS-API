import express from 'express';
import multer from 'multer';
import shortid from 'shortid';
import iosCtrl from '../controllers/ios';
import check from '../controllers/check';

const router = express.Router();	// eslint-disable-line new-cap

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './files/');
	},
	filename: function (req, file, cb) {
		const ext = file.originalname.split('.').pop().trim();
		file.ext = ext;
		cb(null, shortid.generate() + '.' + ext);
	}
})

const upload = multer({ storage: storage })

router.route('/cert')
  .post(check.ifTokenValid, upload.array('cert', 2), iosCtrl.cert);

export default router;
