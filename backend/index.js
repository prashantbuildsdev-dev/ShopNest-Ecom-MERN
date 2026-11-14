
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const { isDatabaseReady } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.FRONTEND_URL,
        process.env.FRONTED_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
    res.status(isDatabaseReady() ? 200 : 503).json({
        status: isDatabaseReady() ? "ok" : "database_unavailable"
    });
});

app.use("/api", (req, res, next) => {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            message: "Database is temporarily unavailable."
        });
    }
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({ message: "Invalid JSON request body" });
    }

    if (err.name === "MulterError" || err.message === "Only image files are allowed") {
        return res.status(400).json({ message: err.message });
    }

    console.error(err);
    res.status(err.status || 500).json({ message: "Server error" });
});

if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../fronted/dist");
    app.use(express.static(frontendPath));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("ShopNest API is running...");
    });
}

connectDB().catch(error => console.error(error.message));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
