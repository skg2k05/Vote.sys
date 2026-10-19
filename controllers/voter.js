const VoterModel = require('../models/voter');
const bcrypt = require('bcryptjs');
const mailer = require('../config/mailer');

const saltRounds = 10;

function randomPassword() {
	return Math.random().toString(36).slice(2, 10);
}

function credentialsMail(email, password, electionName, electionDescription) {
	return {
		from: process.env.EMAIL,
		to: email,
		subject: electionName,
		html:
			(electionDescription || 'Election Details') +
			'<br>Your voting id is: ' +
			email +
			'<br>Your password is: ' +
			password +
			'<br><a href="http://localhost:3000/voter_login">Click here to visit the website</a>',
	};
}

module.exports = {
	create: async function (req, res) {
		try {
			const existing = await VoterModel.findOne({
				email: req.body.email,
				election_address: req.body.election_address,
			});
			if (existing) {
				return res.json({ status: 'error', message: 'Voter already exists in this election.', data: null });
			}

			const tempPassword = req.body.password && req.body.password.trim() ? req.body.password.trim() : randomPassword();
			const voter = await VoterModel.create({
				email: req.body.email.trim(),
				password: tempPassword,
				temp_password: tempPassword,
				wallet_address: req.body.wallet_address ? req.body.wallet_address.trim() : '',
				election_address: req.body.election_address,
			});

			console.log('=====================================================');
			console.log('>>> NEW VOTER REGISTERED <<<');
			console.log('Email:    ', voter.email);
			console.log('Password: ', tempPassword);
			console.log('Wallet:   ', voter.wallet_address || '(none)');
			console.log('=====================================================');

			mailer.sendMail(
				credentialsMail(voter.email, tempPassword, req.body.election_name, req.body.election_description),
				function (err, info) {
					res.json({
						status: 'success',
						message: 'Voter registered successfully!',
						data: {
							id: voter._id,
							email: voter.email,
							tempPassword: tempPassword,
						},
					});
				}
			);
		} catch (err) {
			console.error('Voter creation error:', err.message);
			res.status(500).json({ status: 'error', message: 'Could not add the voter: ' + err.message, data: null });
		}
	},

	authenticate: async function (req, res) {
		try {
			const email = req.body.email ? req.body.email.trim() : '';
			const password = req.body.password ? req.body.password.trim() : '';
			const voterInfo = await VoterModel.findOne({ email: email });

			if (!voterInfo || !bcrypt.compareSync(password, voterInfo.password)) {
				return res.json({ status: 'error', message: 'Invalid email/password.', data: null });
			}
			res.json({
				status: 'success',
				message: 'voter authenticated',
				data: {
					id: voterInfo._id,
					email: voterInfo.email,
					wallet_address: voterInfo.wallet_address,
					election_address: voterInfo.election_address,
				},
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not authenticate the voter.', data: null });
		}
	},

	getAll: async function (req, res) {
		try {
			const voters = await VoterModel.find({ election_address: req.body.election_address });
			const voterList = voters.map(voter => ({
				id: voter._id,
				email: voter.email,
				wallet_address: voter.wallet_address,
				temp_password: voter.temp_password || '',
			}));
			res.json({
				status: 'success',
				message: 'voters list found',
				data: { voters: voterList },
				count: voterList.length,
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not load the voters.', data: null });
		}
	},

	resetPassword: async function (req, res) {
		try {
			const voter = await VoterModel.findById(req.params.voterId);
			if (!voter) {
				return res.json({ status: 'error', message: 'Voter not found.', data: null });
			}

			const newPassword = req.body.password && req.body.password.trim() ? req.body.password.trim() : randomPassword();
			voter.password = newPassword;
			voter.temp_password = newPassword;
			await voter.save();

			console.log('=====================================================');
			console.log('>>> VOTER PASSWORD RESET <<<');
			console.log('Email:        ', voter.email);
			console.log('New Password: ', newPassword);
			console.log('=====================================================');

			res.json({
				status: 'success',
				message: 'Password reset successfully!',
				data: { tempPassword: newPassword, email: voter.email },
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not reset password.', data: null });
		}
	},

	updateById: async function (req, res) {
		try {
			const tempPassword = req.body.password && req.body.password.trim() ? req.body.password.trim() : randomPassword();
			const updateData = {
				email: req.body.email,
				password: bcrypt.hashSync(tempPassword, saltRounds),
				temp_password: tempPassword,
			};
			await VoterModel.findByIdAndUpdate(req.params.voterId, updateData);

			mailer.sendMail(
				credentialsMail(req.body.email, tempPassword, req.body.election_name, req.body.election_description),
				function () {
					res.json({
						status: 'success',
						message: 'Voter updated successfully!',
						data: { tempPassword: tempPassword },
					});
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not update the voter.', data: null });
		}
	},

	deleteById: async function (req, res) {
		try {
			await VoterModel.findByIdAndDelete(req.params.voterId);
			res.json({ status: 'success', message: 'voter deleted successfully!!!', data: null });
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not delete the voter.', data: null });
		}
	},

	resultMail: async function (req, res) {
		try {
			const voters = await VoterModel.find({ election_address: req.body.election_address });
			const election_name = req.body.election_name;
			const winner_candidate = req.body.winner_candidate;

			for (const voter of voters) {
				mailer.sendMail(
					{
						from: process.env.EMAIL,
						to: voter.email,
						subject: election_name + ' results',
						html:
							'The results of ' +
							election_name +
							' are out.<br>The winner candidate is: <b>' +
							winner_candidate +
							'</b>.',
					},
					function (err) {
						if (err) console.log('Could not send result mail:', err.message);
					}
				);
			}

			if (req.body.candidate_email) {
				mailer.sendMail(
					{
						from: process.env.EMAIL,
						to: req.body.candidate_email,
						subject: election_name + ' results !!!',
						html: 'Congratulations you won ' + election_name + ' election.',
					},
					function (err) {
						if (err) console.log('Could not send winner mail:', err.message);
					}
				);
			}

			res.json({ status: 'success', message: 'mails sent successfully!!!', data: null });
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not send the result mails.', data: null });
		}
	},
};
