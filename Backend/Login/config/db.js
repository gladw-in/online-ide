const mongoose = require('mongoose');

let cached = globalThis.mongoose;

const opts = {
	bufferCommands: false,
	serverSelectionTimeoutMS: 4000,
	socketTimeoutMS: 8000,
	connectTimeoutMS: 4000,
	maxPoolSize: 5,
	minPoolSize: 0,
	maxIdleTimeMS: 10000,
};

if (!cached) {
	cached = globalThis.mongoose = {
		conn: null,
		promise: null
	};
}

const checkAndConnectDB = async () => {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
			.catch(err => {
				cached.promise = null;
				throw err;
			});
	}
	cached.conn = await cached.promise;
	return cached.conn;
};

module.exports = {
	checkAndConnectDB
};