# Mapbox 3D Water Management System

ระบบ SCADA สำหรับจัดการสถานีน้ำผ่าน Mapbox 3D Map พร้อมการรองรับ BACnet/Modbus และ Demo Mode

![System Preview](./assets/image/image.png)

## ✨ Features

- 🗺️ **3D Map Visualization** - แผนที่ 3 มิติพร้อม building extrusion ด้วย Mapbox GL JS
- 📡 **Real-time Monitoring** - การติดตามสถานะสถานีแบบ real-time ผ่าน WebSocket
- 🎮 **Demo Mode** - โหมดจำลองข้อมูลสำหรับทดสอบและ demo
- 🔌 **Modbus Integration** - รองรับการเชื่อมต่อ Modbus TCP/IP จริง
- 🎛️ **Control Panel** - UI สำหรับสลับโหมดและดูสถานะการเชื่อมต่อ
- 📊 **6 Station Types** - รองรับสถานีหลายประเภท (Pump, Valve, Flood Gate)

## 🏗️ Project Structure

```
Mapbox/
├── index.html              # หน้าหลักของแอพพลิเคชัน
├── assets/
│   ├── css/
│   │   └── style.css       # สไตล์หลัก
│   ├── image/              # รูปภาพพื้นหลัง popup
│   │   ├── image.png
│   │   ├── IMG_3893.png
│   │   ├── IMG_3894.png
│   │   └── IMG_3895.png
│   └── js/
│       ├── server.js       # Backend server (BACnet/Modbus + Demo)
│       ├── script.js       # Frontend client
│       ├── package.json
│       └── node_modules/
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0
- npm >= 9.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Mapbox

# Install dependencies
cd assets/js
npm install
```

### Running the Server

#### Demo Mode (Default)

```bash
# เริ่มต้นด้วย Demo Mode - ไม่ต้องเชื่อมต่ออุปกรณ์จริง
npm start

# หรือ
npm run demo
```

#### Modbus Mode

```bash
# เชื่อมต่อกับ Modbus Server จริง
npm run modbus

# หรือกำหนด host/port เอง
set MODBUS_HOST=192.168.1.100
set MODBUS_PORT=502
npm run modbus
```

### Viewing the Application

1. เปิด `index.html` ใน browser (แนะนำ Chrome หรือ Firefox)
2. หรือใช้ Live Server extension ใน VS Code

## 📡 API Endpoints

| Method | Endpoint        | Description                   |
| ------ | --------------- | ----------------------------- |
| GET    | `/api/status`   | สถานะ server และการเชื่อมต่อ  |
| GET    | `/api/mode`     | โหมดปัจจุบัน (demo/modbus)    |
| POST   | `/api/mode`     | สลับโหมด `{ "mode": "demo" }` |
| GET    | `/api/stations` | ข้อกำหนดของสถานีทั้งหมด       |

### ตัวอย่างการใช้งาน API

```bash
# ดูสถานะ server
curl http://localhost:3001/api/status

# สลับเป็น Demo Mode
curl -X POST http://localhost:3001/api/mode -H "Content-Type: application/json" -d '{"mode":"demo"}'

# สลับเป็น Modbus Mode
curl -X POST http://localhost:3001/api/mode -H "Content-Type: application/json" -d '{"mode":"modbus"}'
```

## 🔌 WebSocket Events

### Client → Server

| Event          | Data                           | Description   |
| -------------- | ------------------------------ | ------------- |
| `switchMode`   | `{ mode: "demo" \| "modbus" }` | สลับโหมด      |
| `setDemoState` | `{ stationId, key, value }`    | แก้ไขค่า Demo |

### Server → Client

| Event        | Data                                 | Description               |
| ------------ | ------------------------------------ | ------------------------- |
| `modbusData` | `{ [registerId]: { values, name } }` | ข้อมูล register ล่าสุด    |
| `modeChange` | `{ mode: string }`                   | แจ้งเตือนเมื่อโหมดเปลี่ยน |

## 🏭 Station Types

### 1. Pump Station (สถานีส่งน้ำ)

- Network Status
- 3 Pumps (Status, Auto/Manual, Overload)
- Water Level
- Door Level

### 2. Valve Station (จุดรับน้ำ)

- Network Status
- Valve Status (Open/Close)
- Valve Control (Remote/Local)
- Water Level

### 3. Double Valve Station (บ่อรับน้ำ)

- Network Status
- 2 Valves (Status + Control)
- Water Level

### 4. Flood Gate (ประตูระบายน้ำ)

- Network Status
- Status Power
- Control Valve
- Overload
- Door Level
- Water Level

## 🔧 Configuration

### Environment Variables

| Variable          | Default     | Description                         |
| ----------------- | ----------- | ----------------------------------- |
| `CONNECTION_MODE` | `demo`      | โหมดเริ่มต้น (`demo` หรือ `modbus`) |
| `MODBUS_HOST`     | `127.0.0.1` | Modbus server host                  |
| `MODBUS_PORT`     | `502`       | Modbus server port                  |
| `MODBUS_UNIT_ID`  | `1`         | Modbus unit ID                      |

### Register Mapping

ดู `STATION_REGISTERS` ใน `server.js` สำหรับ register mapping ทั้งหมด

## 🎨 Control Panel

Control Panel จะอยู่มุมขวาบนของหน้าจอ ประกอบด้วย:

- **Connection Status** - สถานะการเชื่อมต่อ WebSocket
- **Current Mode** - โหมดปัจจุบัน (DEMO/MODBUS)
- **Mode Switch Buttons** - ปุ่มสลับโหมด

## 🐛 Troubleshooting

### Server ไม่เริ่มทำงาน

```bash
# ตรวจสอบว่า port 3001 ว่างอยู่
netstat -ano | findstr :3001

# Kill process ที่ใช้ port
taskkill /PID <pid> /F
```

### Modbus Connection Failed

- ตรวจสอบว่า Modbus server กำลังทำงาน
- ตรวจสอบ IP address และ port
- Server จะสลับไป Demo mode อัตโนมัติหลังจาก retry 15 ครั้ง

### WebSocket Disconnected

- ตรวจสอบว่า server กำลังทำงานที่ port 3001
- ตรวจสอบ firewall settings
- ลอง refresh หน้าเว็บ

## 📝 License

ISC

## 👥 Contributors

- Development Team
