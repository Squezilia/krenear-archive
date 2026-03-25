// import * as HyperExpress from "hyper-express";
import express from 'express';

import AuthRouter from "./api/auth/router";
import DeploymentRouter from "./api/deployment/router";
import WorkerRouter from "./api/worker/router";

import cors from "cors";
import prisma from "./prisma";
import { configs, configsSize } from "./configs";

// import { rateLimit } from "hyper-express-rate-limit";
import { rateLimit } from 'express-rate-limit';
import { cache } from "./cache";
import { IPLogs } from "@prisma/client";

import isBlocked from "./middleware/isBlocked";
import CloudflareIP from "./middleware/CloudflareIP";
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 3000;

// const server = new HyperExpress.Server();
const server = express();

// Body Parser
server.use(bodyParser.json());

// Cross-Origin Allow
server.use(cors());
server.options('*', cors());

// Add fix for cf-connecting-ip.
// If you don't use Cloudflare Tunneling dont use this.
server.use(CloudflareIP);
server.use(isBlocked);

server.get("/", (req, res) => {
  return res.json({
    name: "Krenear",
    version: "0.1.1",
    channel: process.env.ENVIRONMENT,
    uptime: process.uptime(),
    stats: {
      configsSize,
      usersSize,
      deploymentSize,
      deploymentAnalytics,
    },
    configs,
  });
});


//
// Routers
//
server.use("/auth", AuthRouter);
server.use("/deployment", DeploymentRouter);
// server.use("/admin", AdminRouter);
server.use("/worker", WorkerRouter);

// Rate Limiter
if (process.env.ENVIRONMENT != "development")
  server.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 175, // Limit each IP to 175 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      keyGenerator(req) {
        return req.realIp;
      },
    })
  );

//
// Server Info and Stats
//
let usersSize = 0;
let deploymentSize = 0;

let deploymentAnalytics: {
  [key: string]: number;
} = {};

async function updateStats() {
  usersSize = (await prisma.user.findMany({ where: {} })).length;

  deploymentSize = (await prisma.deployment.findMany({ where: {} })).length;

  configs.forEach(async (config) => {
    deploymentAnalytics[config.id] = (
      await prisma.deployment.findMany({
        where: {
          configuration: config.id,
        },
      })
    ).length;
  });
}

//
// IP Tables Cache
//
export var ipTable = cache.createPage<IPLogs>();

async function LoadIpTable() {
  for (let ip of await prisma.iPLogs.findMany()) {
    ipTable.table.push(ip);
  }
}

// Load Blocked IP Adresses
LoadIpTable();

updateStats();

setInterval(() => {
  updateStats();
}, 60000);

server
  .listen(PORT, () => {
    console.log(`✨ Server started on port ${PORT}`)
  });
