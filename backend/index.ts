import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
// import { setupVite, serveStatic } from "./vite"; // Disabled for clean separation
import { connectDB } from "./db";
import { errorHandler } from "./errorHandler";
import { wsManager } from "./websocket";
import { initializeBackgroundJobs } from "./jobs/backgroundJobs";
import path from "path";
import { fileURLToPath } from "url";

// Needed for serving static in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables already loaded at the top

// Connect to MongoDB
let isMongoConnected = false;
connectDB()
  .then(() => {
    isMongoConnected = true;
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

const app = express();

// CORS configuration for frontend communications
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost for development (any port)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow ALL Vercel deployments (production + preview branches)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Custom domain support (for future launch)
    const customDomain = process.env.CUSTOM_DOMAIN; // e.g., "altq.com"
    if (customDomain && origin.includes(customDomain)) {
      return callback(null, true);
    }
    
    // Block everything else
    callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check route for Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongo: isMongoConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Basic root route
app.get("/", (req, res) => {
  res.json({
    message: "SMART-Q Backend API",
    status: "running",
    version: "1.0.0",
    env: process.env.NODE_ENV,
    cors_info: "CORS should allow https://noline-woad.vercel.app"
  });
});

// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    message: "CORS is working!",
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
});

// Ping endpoint for keep-alive and health checks
app.get("/api/ping", (req, res) => {
  res.json({
    status: "alive",
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const pathName = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathName.startsWith("/api")) {
      let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Custom error handler
  app.use(errorHandler);

  const env = app.get("env") || "development";

  if (env === "development") {
    // Development mode - backend only, frontend runs separately
  } else {
    // ✅ Serve frontend build in production
    // NOTE: server runs from dist/server.js, so frontend dist is at ../frontend/dist
    const clientDistPath = path.resolve(__dirname, "../frontend/dist");

    app.use(express.static(clientDistPath));

    // Fallback for React Router
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  // Initialize WebSocket server
  wsManager.initialize(server);

  // Initialize push notification service
  const { pushNotificationService } = await import('./services/pushNotificationService');
  await pushNotificationService.initialize();

  // Initialize background jobs
  initializeBackgroundJobs();

  // Listen on Render’s port
  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    }
  );
})();
