const mailer = require('../config/mailer');

module.exports = {
	register: function (req, res, cb) {
		mailer.sendMail(
			{
				from: process.env.EMAIL,
				to: req.body.email,
				subject: req.body.election_name + 'Registration',
				html: 'Congrats you have been registered for  ' + req.body.election_name + ' election.',
			},
			function (err) {
				if (err) {
					console.log(err);
					res.json({ status: 'error', message: 'mail error', data: null });
				} else {
					res.json({ status: 'success', message: 'mail sent successfully!!!', data: null });
				}
			}
		);
	},
};
