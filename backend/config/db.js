
const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
    try {
        const dnsServers = process.env.MONGODB_DNS_SERVERS;

        if (dnsServers) {
            dns.setServers(dnsServers.split(',').map(server => server.trim()));
        }

        const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

        if (!mongoUri) throw new Error('MongoDB URI is missing');

        const conn = await mongoose.connect(mongoUri);
        console.log("MongoDB Connected Successfully!");
        
    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
