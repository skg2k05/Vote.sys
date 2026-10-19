const CompanyModel = require('../models/company');
const bcrypt = require('bcryptjs');

module.exports = {
	create: async function (req, res) {
		try {
			const existing = await CompanyModel.findOne({ email: req.body.email });
			if (existing) {
				return res.json({ status: 'error', message: 'Company already exists ', data: null });
			}
			const company = await CompanyModel.create({ email: req.body.email, password: req.body.password });
			res.json({
				status: 'success',
				message: 'Company added successfully!!!',
				data: { id: company._id, email: company.email },
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not register the company.', data: null });
		}
	},

	authenticate: async function (req, res) {
		try {
			const companyInfo = await CompanyModel.findOne({ email: req.body.email });
			if (!companyInfo || !bcrypt.compareSync(req.body.password, companyInfo.password)) {
				return res.json({ status: 'error', message: 'Invalid email/password!!!', data: null });
			}
			res.json({
				status: 'success',
				message: 'company found!!!',
				data: { id: companyInfo._id, email: companyInfo.email },
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ status: 'error', message: 'Could not authenticate the company.', data: null });
		}
	},
};
