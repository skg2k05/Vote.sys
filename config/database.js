//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/BlockVotes';
mongoose.connect(mongoDB).catch(function (err) {
	console.error('MongoDB connection error:', err.message);
});
mongoose.Promise = global.Promise;
module.exports = mongoose;
