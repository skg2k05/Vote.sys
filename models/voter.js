const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const Schema = mongoose.Schema;
const VoterSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	temp_password: {
		type: String,
		default: '',
	},
	wallet_address: {
		type: String,
		default: '',
	},
	election_address: {
		type: String,
		required: true,
	},
});

// hash user password before saving into database
VoterSchema.pre('save', function (next) {
	if (this.isModified('password')) {
		this.password = bcrypt.hashSync(this.password, saltRounds);
	}
	next();
});

module.exports = mongoose.model('VoterList', VoterSchema);
