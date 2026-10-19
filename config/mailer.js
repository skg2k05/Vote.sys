const nodemailer = require('nodemailer');

const configured = Boolean(process.env.EMAIL && process.env.PASSWORD);

let transporter = null;
if (configured) {
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	});
}

function sendMail(mailOptions, cb) {
	if (!transporter) {
		console.log('--- Mail skipped (EMAIL/PASSWORD not set in .env) ---');
		console.log('To:', mailOptions.to);
		console.log('Subject:', mailOptions.subject);
		console.log('Body:', mailOptions.html);
		console.log('-----------------------------------------------------');
		if (cb) cb(null, { skipped: true });
		return;
	}
	transporter.sendMail(mailOptions, cb);
}

module.exports = { sendMail, configured };
