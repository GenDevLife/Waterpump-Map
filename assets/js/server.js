/**
 * BACnet/Modbus Server with Demo Mode Support
 *
 * Features:
 * - Toggle between real Modbus connection and Demo mode
 * - Realistic demo data simulation
 * - WebSocket real-time data streaming
 * - REST API for configuration
 */

import ModbusRTU from "modbus-serial";
import { Server } from "socket.io";
import http from "http";

// ================================
// Server Configuration
// ================================
const CONFIG = {
  server: {
    port: 3001,
    host: "0.0.0.0",
  },
  modbus: {
    host: process.env.MODBUS_HOST || "127.0.0.1",
    port: parseInt(process.env.MODBUS_PORT) || 502,
    unitId: parseInt(process.env.MODBUS_UNIT_ID) || 1,
    timeout: 5000,
    maxRetries: 15,
    retryInterval: 15000,
  },
  polling: {
    interval: 1000, // ms
  },
};

// ================================
// Connection Mode
// ================================
let connectionMode = process.env.CONNECTION_MODE || "demo"; // 'demo' | 'modbus'
let isRunning = true;

// ================================
// Station Register Definitions
// ================================
const STATION_REGISTERS = {
  // Station No.1 - คลองสาธร (Pump Station)
  station1: {
    name: "Station No.1 - สถานีส่งน้ำคลองสาทร",
    type: "pump",
    registers: [
      { address: 0, name: "Network Status", key: "networkStatus" },
      { address: 1, name: "Pump No.1 Status", key: "pump1Status" },
      { address: 2, name: "Pump No.1 A/M", key: "pump1AM" },
      { address: 3, name: "Pump No.1 Overload", key: "pump1Overload" },
      { address: 4, name: "Pump No.2 Status", key: "pump2Status" },
      { address: 5, name: "Pump No.2 A/M", key: "pump2AM" },
      { address: 6, name: "Pump No.2 Overload", key: "pump2Overload" },
      { address: 7, name: "Pump No.3 Status", key: "pump3Status" },
      { address: 8, name: "Pump No.3 A/M", key: "pump3AM" },
      { address: 9, name: "Pump No.3 Overload", key: "pump3Overload" },
      {
        address: 10,
        name: "Water Level",
        key: "waterLevel",
        isFloat: true,
        min: 0,
        max: 5,
      },
      {
        address: 11,
        name: "Door Level",
        key: "doorLevel",
        isFloat: true,
        min: 0,
        max: 100,
      },
    ],
  },
  // Station No.2 - สวนลุม (Valve Station)
  station2: {
    name: "Station No.2 - จุดรับน้ำ สวนลุมฯ ประตู 2",
    type: "valve",
    registers: [
      { address: 12, name: "Network Status", key: "networkStatus" },
      { address: 13, name: "Valve Status", key: "valveStatus" },
      { address: 14, name: "Valve Control", key: "valveControl" },
      {
        address: 15,
        name: "Water Level",
        key: "waterLevel",
        isFloat: true,
        min: 0,
        max: 5,
      },
    ],
  },
  // Station No.3 - คูต้นสน (Valve Station)
  station3: {
    name: "Station No.3 - จุดรับน้ำคลองต้นสน",
    type: "valve",
    registers: [
      { address: 16, name: "Network Status", key: "networkStatus" },
      { address: 17, name: "Valve Status", key: "valveStatus" },
      { address: 18, name: "Valve Control", key: "valveControl" },
      {
        address: 19,
        name: "Water Level",
        key: "waterLevel",
        isFloat: true,
        min: 0,
        max: 5,
      },
    ],
  },
  // Station No.4 - หลังคลองไผ่สิงห์โต (Valve Station)
  station4: {
    name: "Station No.4 - จุดรับน้ำต้นคลองไผ่สิงห์โต",
    type: "valve",
    registers: [
      { address: 20, name: "Network Status", key: "networkStatus" },
      { address: 21, name: "Valve Status", key: "valveStatus" },
      { address: 22, name: "Valve Control", key: "valveControl" },
      {
        address: 23,
        name: "Water Level",
        key: "waterLevel",
        isFloat: true,
        min: 0,
        max: 5,
      },
    ],
  },
  // Station No.5 - บ่อรับน้ำเดิม (Double Valve Station)
  station5: {
    name: "Station No.5 - บ่อรับน้ำเดิมคลองไผ่สิงห์โต",
    type: "doubleValve",
    registers: [
      { address: 24, name: "Network Status", key: "networkStatus" },
      { address: 25, name: "Valve No.1 Status", key: "valve1Status" },
      { address: 26, name: "Valve No.1 Control", key: "valve1Control" },
      { address: 27, name: "Valve No.2 Status", key: "valve2Status" },
      { address: 28, name: "Valve No.2 Control", key: "valve2Control" },
      {
        address: 29,
        name: "Water Level",
        key: "waterLevel",
        isFloat: true,
        min: 0,
        max: 5,
      },
    ],
  },
  // Station No.6 - คลองไผ่สิงห์โต (Flood Gate)
  station6: {
    name: "Station No.6 - ประตูระบายน้ำคลองไผ่สิงห์โต",
    type: "floodGate",
    registers: [
      { address: 30, name: "Network Status", key: "networkStatus" },
      { address: 31, name: "Status Power", key: "statusPower" },
      { address: 32, name: "Control Valve", key: "controlValve" },
      { address: 33, name: "Overload Pump No.1", key: "overload" },
      {
        address: 34,
        name: "Door Level",
        key: "doorLevel",
        isFloat: true,
        min: 0,
        max: 100,
      },
      {
        address: 35,
        name: "Water Level",
        key: "waterLevel",
        isFloat: true,
        min: 0,
        max: 5,
      },
    ],
  },
};

// Flatten register ranges for Modbus reading
const REGISTER_RANGES = [];
Object.values(STATION_REGISTERS).forEach((station) => {
  station.registers.forEach((reg) => {
    REGISTER_RANGES.push({
      start: reg.address,
      length: 1,
      name: `${reg.name} at ${station.name}`,
      key: reg.key,
      isFloat: reg.isFloat || false,
      min: reg.min,
      max: reg.max,
    });
  });
});

// ================================
// HTTP & Socket.IO Server Setup
// ================================
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // API Routes
  if (url.pathname === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        mode: connectionMode,
        isConnected: connectionMode === "demo" ? true : modbusClient.isOpen,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (url.pathname === "/api/mode" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ mode: connectionMode }));
    return;
  }

  if (url.pathname === "/api/mode" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { mode } = JSON.parse(body);
        if (mode === "demo" || mode === "modbus") {
          await switchMode(mode);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, mode: connectionMode }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: 'Invalid mode. Use "demo" or "modbus"' })
          );
        }
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
      }
    });
    return;
  }

  if (url.pathname === "/api/stations") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(STATION_REGISTERS));
    return;
  }

  // Default 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ================================
// Demo Mode Data Generator
// ================================
class DemoDataGenerator {
  constructor() {
    this.state = this.initializeState();
    this.animationPhase = 0;
  }

  initializeState() {
    return {
      // Station 1 - Pump Station
      station1: {
        networkStatus: 1,
        pump1Status: 0,
        pump1AM: 1,
        pump1Overload: 0,
        pump2Status: 1,
        pump2AM: 1,
        pump2Overload: 0,
        pump3Status: 0,
        pump3AM: 0,
        pump3Overload: 0,
        waterLevel: 2.5,
        doorLevel: 45,
      },
      // Station 2 - Valve
      station2: {
        networkStatus: 1,
        valveStatus: 1,
        valveControl: 1,
        waterLevel: 1.8,
      },
      // Station 3 - Valve
      station3: {
        networkStatus: 1,
        valveStatus: 0,
        valveControl: 0,
        waterLevel: 2.1,
      },
      // Station 4 - Valve
      station4: {
        networkStatus: 1,
        valveStatus: 1,
        valveControl: 1,
        waterLevel: 1.5,
      },
      // Station 5 - Double Valve
      station5: {
        networkStatus: 1,
        valve1Status: 1,
        valve1Control: 1,
        valve2Status: 0,
        valve2Control: 0,
        waterLevel: 2.8,
      },
      // Station 6 - Flood Gate
      station6: {
        networkStatus: 1,
        statusPower: 1,
        controlValve: 1,
        overload: 0,
        doorLevel: 75,
        waterLevel: 3.2,
      },
    };
  }

  update() {
    this.animationPhase += 0.1;

    // Simulate realistic water level fluctuations
    const fluctuation = () =>
      Math.sin(this.animationPhase) * 0.1 + (Math.random() - 0.5) * 0.05;

    // Update water levels with smooth animation
    this.state.station1.waterLevel = Math.max(
      0,
      Math.min(5, 2.5 + fluctuation())
    );
    this.state.station2.waterLevel = Math.max(
      0,
      Math.min(5, 1.8 + fluctuation() * 0.8)
    );
    this.state.station3.waterLevel = Math.max(
      0,
      Math.min(5, 2.1 + fluctuation() * 0.6)
    );
    this.state.station4.waterLevel = Math.max(
      0,
      Math.min(5, 1.5 + fluctuation() * 0.7)
    );
    this.state.station5.waterLevel = Math.max(
      0,
      Math.min(5, 2.8 + fluctuation() * 0.5)
    );
    this.state.station6.waterLevel = Math.max(
      0,
      Math.min(5, 3.2 + fluctuation() * 0.9)
    );

    // Door level changes more slowly
    this.state.station1.doorLevel = Math.max(
      0,
      Math.min(100, 45 + Math.sin(this.animationPhase * 0.2) * 5)
    );
    this.state.station6.doorLevel = Math.max(
      0,
      Math.min(100, 75 + Math.sin(this.animationPhase * 0.3) * 3)
    );

    // Randomly toggle pump/valve states occasionally (simulate manual operation)
    if (Math.random() < 0.02) {
      const randomPump = `pump${Math.ceil(Math.random() * 3)}Status`;
      this.state.station1[randomPump] =
        this.state.station1[randomPump] === 1 ? 0 : 1;
    }

    // Simulate occasional overload events
    if (Math.random() < 0.005) {
      this.state.station1.pump1Overload = 1;
      setTimeout(() => {
        this.state.station1.pump1Overload = 0;
      }, 5000);
    }

    return this.generateModbusData();
  }

  generateModbusData() {
    const data = {};

    // Station 1 - Pump Station
    data["0-0"] = {
      name: "Network Status at Station No.1",
      values: [this.state.station1.networkStatus],
      startAddress: 0,
    };
    data["1-1"] = {
      name: "Status Pump No.1 at Station No.1",
      values: [this.state.station1.pump1Status],
      startAddress: 1,
    };
    data["2-2"] = {
      name: "A/M Pump No.1 at Station No.1",
      values: [this.state.station1.pump1AM],
      startAddress: 2,
    };
    data["3-3"] = {
      name: "Overload Pump No.1 at Station No.1",
      values: [this.state.station1.pump1Overload],
      startAddress: 3,
    };
    data["4-4"] = {
      name: "Status Pump No.2 at Station No.1",
      values: [this.state.station1.pump2Status],
      startAddress: 4,
    };
    data["5-5"] = {
      name: "A/M Pump No.2 at Station No.1",
      values: [this.state.station1.pump2AM],
      startAddress: 5,
    };
    data["6-6"] = {
      name: "Overload Pump No.2 at Station No.1",
      values: [this.state.station1.pump2Overload],
      startAddress: 6,
    };
    data["7-7"] = {
      name: "Status Pump No.3 at Station No.1",
      values: [this.state.station1.pump3Status],
      startAddress: 7,
    };
    data["8-8"] = {
      name: "A/M Pump No.3 at Station No.1",
      values: [this.state.station1.pump3AM],
      startAddress: 8,
    };
    data["9-9"] = {
      name: "Overload Pump No.3 at Station No.1",
      values: [this.state.station1.pump3Overload],
      startAddress: 9,
    };
    data["10-10"] = {
      name: "Water Level at Station No.1",
      values: [Math.round(this.state.station1.waterLevel * 100) / 100],
      startAddress: 10,
    };
    data["11-11"] = {
      name: "Door Level at Station No.1",
      values: [Math.round(this.state.station1.doorLevel)],
      startAddress: 11,
    };

    // Station 2 - Valve
    data["12-12"] = {
      name: "Network Status at Station No.2",
      values: [this.state.station2.networkStatus],
      startAddress: 12,
    };
    data["13-13"] = {
      name: "Status Valve at Station No.2",
      values: [this.state.station2.valveStatus],
      startAddress: 13,
    };
    data["14-14"] = {
      name: "Control Valve at Station No.2",
      values: [this.state.station2.valveControl],
      startAddress: 14,
    };
    data["15-15"] = {
      name: "Water Level at Station No.2",
      values: [Math.round(this.state.station2.waterLevel * 100) / 100],
      startAddress: 15,
    };

    // Station 3 - Valve
    data["16-16"] = {
      name: "Network Status at Station No.3",
      values: [this.state.station3.networkStatus],
      startAddress: 16,
    };
    data["17-17"] = {
      name: "Status Valve at Station No.3",
      values: [this.state.station3.valveStatus],
      startAddress: 17,
    };
    data["18-18"] = {
      name: "Control Valve at Station No.3",
      values: [this.state.station3.valveControl],
      startAddress: 18,
    };
    data["19-19"] = {
      name: "Water Level at Station No.3",
      values: [Math.round(this.state.station3.waterLevel * 100) / 100],
      startAddress: 19,
    };

    // Station 4 - Valve
    data["20-20"] = {
      name: "Network Status at Station No.4",
      values: [this.state.station4.networkStatus],
      startAddress: 20,
    };
    data["21-21"] = {
      name: "Status Valve at Station No.4",
      values: [this.state.station4.valveStatus],
      startAddress: 21,
    };
    data["22-22"] = {
      name: "Control Valve at Station No.4",
      values: [this.state.station4.valveControl],
      startAddress: 22,
    };
    data["23-23"] = {
      name: "Water Level at Station No.4",
      values: [Math.round(this.state.station4.waterLevel * 100) / 100],
      startAddress: 23,
    };

    // Station 5 - Double Valve
    data["24-24"] = {
      name: "Network Status at Station No.5",
      values: [this.state.station5.networkStatus],
      startAddress: 24,
    };
    data["25-25"] = {
      name: "Status Valve No.1 at Station No.5",
      values: [this.state.station5.valve1Status],
      startAddress: 25,
    };
    data["26-26"] = {
      name: "Control Valve No.1 at Station No.5",
      values: [this.state.station5.valve1Control],
      startAddress: 26,
    };
    data["27-27"] = {
      name: "Status Valve No.2 at Station No.5",
      values: [this.state.station5.valve2Status],
      startAddress: 27,
    };
    data["28-28"] = {
      name: "Control Valve No.2 at Station No.5",
      values: [this.state.station5.valve2Control],
      startAddress: 28,
    };
    data["29-29"] = {
      name: "Water Level at Station No.5",
      values: [Math.round(this.state.station5.waterLevel * 100) / 100],
      startAddress: 29,
    };

    // Station 6 - Flood Gate
    data["30-30"] = {
      name: "Network Status at Station No.6",
      values: [this.state.station6.networkStatus],
      startAddress: 30,
    };
    data["31-31"] = {
      name: "Status Power at Station No.6",
      values: [this.state.station6.statusPower],
      startAddress: 31,
    };
    data["32-32"] = {
      name: "Control Valve at Station No.6",
      values: [this.state.station6.controlValve],
      startAddress: 32,
    };
    data["33-33"] = {
      name: "Overload Pump No.1 at Station No.6",
      values: [this.state.station6.overload],
      startAddress: 33,
    };
    data["34-34"] = {
      name: "Door Level at Station No.6",
      values: [Math.round(this.state.station6.doorLevel)],
      startAddress: 34,
    };
    data["35-35"] = {
      name: "Water Level at Station No.6",
      values: [Math.round(this.state.station6.waterLevel * 100) / 100],
      startAddress: 35,
    };

    return data;
  }

  // Allow manual control of demo state
  setState(stationId, key, value) {
    if (this.state[stationId] && key in this.state[stationId]) {
      this.state[stationId][key] = value;
      return true;
    }
    return false;
  }
}

const demoGenerator = new DemoDataGenerator();

// ================================
// Modbus Client
// ================================
const modbusClient = new ModbusRTU();
let modbusRetryCount = 0;
let modbusLoopTimeout = null;
let previousValues = {};

async function connectModbus() {
  try {
    if (modbusLoopTimeout) {
      clearTimeout(modbusLoopTimeout);
      modbusLoopTimeout = null;
    }

    if (modbusClient.isOpen) {
      await modbusClient.close();
    }

    console.log(
      `🔌 Connecting to Modbus at ${CONFIG.modbus.host}:${CONFIG.modbus.port}...`
    );
    await modbusClient.connectTCP(CONFIG.modbus.host, {
      port: CONFIG.modbus.port,
    });
    console.log(
      `✅ Connected to Modbus server at ${CONFIG.modbus.host}:${CONFIG.modbus.port}`
    );

    modbusClient.setID(CONFIG.modbus.unitId);
    modbusClient.setTimeout(CONFIG.modbus.timeout);
    modbusRetryCount = 0;

    startDataPolling();
  } catch (err) {
    console.error("❌ Modbus connection failed:", err.message);
    modbusRetryCount++;

    if (modbusRetryCount <= CONFIG.modbus.maxRetries) {
      console.log(
        `🔄 Retrying connection (${modbusRetryCount}/${CONFIG.modbus.maxRetries})...`
      );
      setTimeout(connectModbus, CONFIG.modbus.retryInterval);
    } else {
      console.error("⚠️ Maximum retries reached. Switching to demo mode...");
      connectionMode = "demo";
      startDataPolling();
    }
  }
}

async function readModbusRegisters() {
  const results = {};
  const changes = [];

  for (const range of REGISTER_RANGES) {
    try {
      const data = await modbusClient.readHoldingRegisters(
        range.start,
        range.length
      );
      const rangeKey = `${range.start}-${range.start + range.length - 1}`;

      if (data && Array.isArray(data.data)) {
        results[rangeKey] = {
          name: range.name,
          values: data.data,
          startAddress: range.start,
        };

        const prevValues = previousValues[rangeKey]?.values;
        if (prevValues) {
          data.data.forEach((value, index) => {
            const prevValue = prevValues[index];
            if (value !== prevValue) {
              changes.push({
                register: range.start + index,
                groupName: range.name,
                oldValue: prevValue,
                newValue: value,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error reading ${range.name}:`, error.message);
      results[`${range.start}-${range.start + range.length - 1}`] = {
        name: range.name,
        values: null,
        startAddress: range.start,
        error: error.message,
      };
    }
  }

  // Store for comparison
  Object.entries(results).forEach(([key, data]) => {
    if (data && data.values) {
      if (!previousValues[key]) previousValues[key] = {};
      previousValues[key].values = [...data.values];
    }
  });

  return { results, changes };
}

// ================================
// Data Polling Loop
// ================================
function startDataPolling() {
  console.log(
    `\n🚀 Starting data polling in ${connectionMode.toUpperCase()} mode...`
  );
  console.log("Press Ctrl+C to exit\n");

  async function pollCycle() {
    if (!isRunning) return;

    try {
      let data;

      if (connectionMode === "demo") {
        data = demoGenerator.update();
      } else {
        if (!modbusClient.isOpen) {
          throw new Error("Modbus connection is closed");
        }
        const { results } = await readModbusRegisters();
        data = results;
      }

      // Emit data to all connected clients
      io.emit("modbusData", data);

      // Log periodically (every 10 seconds)
      if (
        Math.floor(Date.now() / 10000) !==
        Math.floor((Date.now() - CONFIG.polling.interval) / 10000)
      ) {
        console.log(
          `📊 [${new Date().toLocaleTimeString()}] Mode: ${connectionMode.toUpperCase()}, Clients: ${
            io.engine.clientsCount
          }`
        );
      }
    } catch (error) {
      console.error("❌ Error in poll cycle:", error.message);

      if (connectionMode === "modbus") {
        clearTimeout(modbusLoopTimeout);
        modbusLoopTimeout = null;
        previousValues = {};
        io.emit("modbusData", {});
        connectModbus();
        return;
      }
    }

    modbusLoopTimeout = setTimeout(pollCycle, CONFIG.polling.interval);
  }

  modbusLoopTimeout = setTimeout(pollCycle, CONFIG.polling.interval);
}

// ================================
// Mode Switching
// ================================
async function switchMode(newMode) {
  if (newMode === connectionMode) {
    console.log(`ℹ️ Already in ${newMode} mode`);
    return;
  }

  console.log(`🔄 Switching from ${connectionMode} to ${newMode} mode...`);

  // Stop current polling
  if (modbusLoopTimeout) {
    clearTimeout(modbusLoopTimeout);
    modbusLoopTimeout = null;
  }

  // Close Modbus if open
  if (modbusClient.isOpen) {
    await modbusClient.close();
  }

  previousValues = {};
  connectionMode = newMode;

  // Start in new mode
  if (newMode === "modbus") {
    await connectModbus();
  } else {
    demoGenerator.initializeState();
    startDataPolling();
  }

  // Notify clients
  io.emit("modeChange", { mode: connectionMode });
  console.log(`✅ Switched to ${connectionMode} mode`);
}

// ================================
// Socket.IO Event Handlers
// ================================
io.on("connection", (socket) => {
  console.log(`👤 Client connected: ${socket.id}`);

  // Send current mode on connection
  socket.emit("modeChange", { mode: connectionMode });

  // Handle mode switch request from client
  socket.on("switchMode", async (data) => {
    if (data.mode === "demo" || data.mode === "modbus") {
      await switchMode(data.mode);
    }
  });

  // Handle demo data manipulation (for testing)
  socket.on("setDemoState", (data) => {
    if (connectionMode === "demo" && data.stationId && data.key !== undefined) {
      const success = demoGenerator.setState(
        data.stationId,
        data.key,
        data.value
      );
      socket.emit("demoStateUpdated", { success, ...data });
    }
  });

  socket.on("disconnect", () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket.io error:", error);
  });
});

// ================================
// Cleanup & Shutdown
// ================================
async function cleanup() {
  console.log("\n🛑 Shutting down...");
  isRunning = false;

  if (modbusLoopTimeout) {
    clearTimeout(modbusLoopTimeout);
  }

  if (modbusClient.isOpen) {
    await modbusClient.close();
  }

  previousValues = {};
  server.close();
  process.exit(0);
}

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

// ================================
// Start Server
// ================================
server.listen(CONFIG.server.port, CONFIG.server.host, () => {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     BACnet/Modbus Server with Demo Mode Support            ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(
    `║  Server running on: http://${CONFIG.server.host}:${CONFIG.server.port}                 ║`
  );
  console.log(`║  Current mode: ${connectionMode.toUpperCase().padEnd(44)}║`);
  console.log("║                                                            ║");
  console.log("║  API Endpoints:                                            ║");
  console.log("║    GET  /api/status   - Server status                      ║");
  console.log("║    GET  /api/mode     - Current mode                       ║");
  console.log("║    POST /api/mode     - Switch mode                        ║");
  console.log("║    GET  /api/stations - Station definitions                ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
});

// Start based on initial mode
if (connectionMode === "modbus") {
  connectModbus();
} else {
  startDataPolling();
}

export default modbusClient;
