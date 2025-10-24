import ModbusRTU from 'modbus-serial';
import { Server } from 'socket.io';
import http from 'http';

// Configuration
const MODBUS_HOST = '127.0.0.1';
const MODBUS_PORT = 502;
const MODBUS_ID = 1;

const REGISTER_RANGES = [
  // Station No.1 คลองสาธร
  { start: 0, length: 1, name: 'Network Status Status at Station No.1' },
  { start: 1, length: 1, name: 'Status Pump No.1 at Station No.1' },
  { start: 2, length: 1, name: 'A/M Pump No.1 at Station No.1' },
  { start: 3, length: 1, name: 'Overload Pump No.1 at Station No.1' },
  { start: 4, length: 1, name: 'Status Pump No.2 at Station No.1' },
  { start: 5, length: 1, name: 'A/M Pump No.2 at Station No.1' },
  { start: 6, length: 1, name: 'Overload Pump No.2 at Station No.1' },
  { start: 7, length: 1, name: 'Status Pump No.3 at Station No.1' },
  { start: 8, length: 1, name: 'A/M Pump No.3 at Station No.1' },
  { start: 9, length: 1, name: 'Overload Pump No.3 at Station No.1' },
  { start: 10, length: 1, name: 'Water Level at Station No.1' },
  { start: 11, length: 1, name: 'Door Level at Station No.1' },
  // Station No.2 สวนลุม
  { start: 12, length: 1, name: 'Network Status at Station No.2' },
  { start: 13, length: 1, name: 'Status Valve at Station No.2' },
  { start: 14, length: 1, name: 'Control Valve at Station No.2' },
  { start: 15, length: 1, name: 'Water Level at Station No.2' },
  // Station No.3 คูต้นสน
  { start: 16, length: 1, name: 'Network Status at Station No.3' },
  { start: 17, length: 1, name: 'Status Valve at Station No.3' },
  { start: 18, length: 1, name: 'Control Valve at Station No.3' },
  { start: 19, length: 1, name: 'Water Level at Station No.3' },
  // Station No.4 หลังคลองไผ่สิงห์โต
  { start: 20, length: 1, name: 'Networl at Station No.4' },
  { start: 21, length: 1, name: 'Status Valve at Station No.4' },
  { start: 22, length: 1, name: 'Control Valve at Station No.4' },
  { start: 23, length: 1, name: 'Water Level at Station No.4' },
  // Station No.5 บ่อรับน้ำเดิม
  { start: 24, length: 1, name: 'Network Status at Station No.5' },
  { start: 25, length: 1, name: 'Status Valve No.1 at Station No.5' },
  { start: 26, length: 1, name: 'Control Valve No.1 at Station No.5' },
  { start: 27, length: 1, name: 'Status Valve No.2 at Station No.5' },
  { start: 28, length: 1, name: 'Control Valve No.2 at Station No.5' },
  { start: 29, length: 1, name: 'Water Level at Station No.5' },
  // Station No.6 คลองไผ่สิงห์โต
  { start: 30, length: 1, name: 'Network Status at Station No.6' },
  { start: 31, length: 1, name: 'Status Power at Station No.6' },
  { start: 32, length: 1, name: 'Control Valve at Station No.6' },
  { start: 33, length: 1, name: 'Overload Pump No.1 at Station No.6' },
  { start: 34, length: 1, name: 'Door Level at Station No.6' },
  { start: 35, length: 1, name: 'Water Level at Station No.6' }
];

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let previousValues = {};

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('error', (error) => console.error('Socket.io error:', error));
});

// Modbus Connection
const client = new ModbusRTU();
let retryCount = 0;
const maxRetries = 15;
const retryInterval = 15000;
let modbusLoopTimeout;

async function connectModbus() {
  try {
    if (modbusLoopTimeout) {
      clearTimeout(modbusLoopTimeout);
      modbusLoopTimeout = null;
    }
    
    if (client.isOpen) {
      await client.close();
    }

    await client.connectTCP(MODBUS_HOST, { port: MODBUS_PORT });
    console.log(`Connected to Modbus server at ${MODBUS_HOST}:${MODBUS_PORT}`);
    client.setID(MODBUS_ID);
    client.setTimeout(5000);
    retryCount = 0;
    startModbusLoop();
  } catch (err) {
    console.error('Connection failed:', err);
    retryCount++;
    if (retryCount <= maxRetries) {
      console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
      setTimeout(connectModbus, retryInterval);
    } else {
      console.error('Maximum retries reached. Could not connect to Modbus server.');
    }
  }
}

function hasValueChanged(newValue, oldValue) {
  if (!oldValue) return true;
  return JSON.stringify(newValue) !== JSON.stringify(oldValue);
}

function formatValue(value) {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  return `${value} (0x${value.toString(16).padStart(4, '0')})`;
}

async function readModbusRegisters() {
  const results = {};
  const changes = [];
  
  for (const range of REGISTER_RANGES) {
    try {
      const data = await client.readHoldingRegisters(range.start, range.length);
      const rangeKey = `${range.start}-${range.start + range.length - 1}`;
      
      if (data && Array.isArray(data.data)) {
        results[rangeKey] = {
          name: range.name,
          values: data.data,
          startAddress: range.start
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
                newValue: value
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error reading ${range.name}:`, error.message);
      results[`${range.start}-${range.start + range.length - 1}`] = {
        name: range.name,
        values: null,
        startAddress: range.start,
        error: error.message
      };
    }
  }

  // เก็บข้อมูลสำหรับเปรียบเทียบในรอบถัดไป
  Object.entries(results).forEach(([key, data]) => {
    if (data && data.values) {
      if (!previousValues[key]) previousValues[key] = {};
      previousValues[key].values = [...data.values];
    }
  });
  
  return { results, changes };
}

async function startModbusLoop() {
  console.log('\nStarting Modbus monitoring...');
  console.log('Press Ctrl+C to exit\n');

  async function modbusCycle() {
    try {
      if (!client.isOpen) {
        throw new Error('Modbus connection is closed');
      }

      const { results, changes } = await readModbusRegisters();
      
      if (changes && changes.length > 0) {
        console.log('\nRegister value changes detected:');
        changes.forEach(change => {
          if (change.oldValue !== undefined && change.newValue !== undefined) {
            console.log(
              `[${change.groupName}] Register ${change.register}: ${formatValue(change.oldValue)} -> ${formatValue(change.newValue)}`
            );
          }
        });
      }

      console.log('\nCurrent Register Values:');
      Object.entries(results).forEach(([range, data]) => {
        if (data) {
          console.log(`\n${data.name} (${range}):`);
          if (data.values) {
            data.values.forEach((value, index) => {
              console.log(`  Register ${data.startAddress + index}: ${formatValue(value)}`);
            });
          } else {
            console.log(`  Error: ${data.error || 'Unable to read values'}`);
          }
        }
      });
      
      io.emit('modbusData', results);
    } catch (error) {
      console.error('Error reading Modbus:', error);
      clearTimeout(modbusLoopTimeout);
      modbusLoopTimeout = null;
      // ล้าง cache เมื่อเกิด error
      previousValues = {};
      // ส่งข้อมูลว่างให้ client รับรู้ว่าไม่มีข้อมูล realtime
      io.emit('modbusData', {});
      connectModbus();
      return;
    }
    modbusLoopTimeout = setTimeout(modbusCycle, 1000);
  }
  
  modbusLoopTimeout = setTimeout(modbusCycle, 1000);
}

// Cleanup function เมื่อได้รับ SIGTERM/SIGINT
async function cleanup() {
  console.log('\nCleaning up...');
  if (modbusLoopTimeout) {
    clearTimeout(modbusLoopTimeout);
  }
  if (client.isOpen) {
    await client.close();
  }
  // ล้าง cache ก่อนปิด process
  previousValues = {};
  server.close();
  process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Start Server
server.listen(3001, '0.0.0.0', () => {
  console.log('Server is running on port 3001');
});

connectModbus();

export default client;