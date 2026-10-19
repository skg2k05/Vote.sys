const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

router.post('/', function (req, res) {
	const image = req.body.image;

	if (!image || !image.startsWith('data:image/')) {
		return res.json({ status: 'error', message: 'No image provided.', data: null });
	}

	const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
	if (!match) {
		return res.json({ status: 'error', message: 'Invalid image format.', data: null });
	}

	const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
	const name = crypto.randomBytes(16).toString('hex') + '.' + ext;
	const dir = path.join(__dirname, '..', 'static', 'uploads');

	fs.ensureDirSync(dir);
	fs.writeFileSync(path.join(dir, name), Buffer.from(match[2], 'base64'));

	res.json({ status: 'success', message: 'Image uploaded.', data: { hash: '/static/uploads/' + name } });
});

module.exports = router;
