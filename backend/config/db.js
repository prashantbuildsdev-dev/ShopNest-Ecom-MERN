const mongoose = require('mongoose');
const dns = require('dns');

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string. Add MONGO_URI to backend/.env');
    }

    // Some networks reject Node's default SRV DNS lookup even though Atlas is
    // reachable. This changes DNS only for this backend process, not Windows.
    const dnsServers = String(process.env.MONGODB_DNS_SERVERS || '')
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean);
    if (dnsServers.length > 0) {
        dns.setServers(dnsServers);
        console.log(`MongoDB DNS resolver configured: ${dnsServers.join(', ')}`);
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            dbName: process.env.MONGODB_DATABASE || undefined
        });
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        console.log(`MongoDB database: ${conn.connection.name}`);
        console.log('MongoDB products collection: products');
    }
    catch (error) {
        throw new Error(`MongoDB connection failed (${error.name}): ${error.message}`);
    }
};

module.exports = connectDB;
module.exports.isDatabaseReady = isDatabaseReady;
