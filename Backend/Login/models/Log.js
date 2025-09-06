const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	lastLogin: {
		type: Date,
		default: null,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	generateCodeCount: {
		type: Map,
		of: Number,
		default: {},
	},
	refactorCodeCount: {
		type: Map,
		of: Number,
		default: {},
	},
	runCodeCount: {
		type: Map,
		of: Number,
		default: {},
	},
	sharedLinks: {
		type: Object,
		default: {},
	},
	actionType: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('log', logsSchema);