const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { isDatabaseReady } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use((req, res, next) => {
    const startedAt = Date.now();
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);

    res.on("finish", () => {
        console.log(`Completed request: ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
    });

    next();
});

app.use(cors(
    {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL, process.env.FRONTED_URL].filter(Boolean),
        credentials: true

    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
    res.status(isDatabaseReady() ? 200 : 503).json({
        status: isDatabaseReady() ? 'ok' : 'database_unavailable'
    });
});

// Do not let Mongoose buffer queries while Atlas is unreachable. Returning a
// clear 503 makes the actual deployment/database problem visible to the client.
app.use('/api', (req, res, next) => {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            message: 'Database is temporarily unavailable. Check MongoDB Atlas Network Access and the MONGO_URL setting.'
        });
    }

    return next();
});

app.use("/api/auth", authRoutes);
app.use("/api/product", require('./routes/productRoutes'));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/analytics", require('./routes/analyticsRoutes'));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON request body' });
    }

    if (err.name === 'MulterError' || err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(err.status || 500).json({ message: 'Server error' });
});

//server fronted in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../fronted/dist');
  app.use(express.static(frontendDistPath));
  
  app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('ShopNest API is running in Development mode...');
  });
}


const PORT = process.env.PORT || 5000;

connectDB().catch((error) => {
  // Keep Express alive so health checks and request logging remain available.
  // Mongoose will continue attempting to reconnect when the database returns.
  console.error(error.message);
});

app.listen(PORT, () => {
    console.log('======================================');
    console.log('ShopNest backend started');
    console.log(`Port: ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log('Routes: /, /api/auth, /api/product, /api/orders, /api/payment, /api/analytics');
    console.log('Send Postman requests to this URL/port to see terminal logs.');
    console.log('======================================');
});
