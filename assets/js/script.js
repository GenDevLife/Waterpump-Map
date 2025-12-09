/**
 * Mapbox 3D Map with Real-time BACnet/Modbus Data Visualization
 *
 * Features:
 * - 3D Map visualization with Mapbox GL JS
 * - Real-time station monitoring
 * - Demo/Modbus mode switching
 * - Interactive popup for each station
 */

// ================================
// Mapbox Initialization
// ================================
mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9hcnkiLCJhIjoiY203MzNyMnNpMGdxbDJrcHNyZnZtdnZoZCJ9.zn5h1zC-j47Tlh0aXMyp7g";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/navigation-day-v1",
  center: [100.55012, 13.7281],
  zoom: 15,
  pitch: 45,
  bearing: 0,
  antialias: true,
});

map.addControl(new mapboxgl.NavigationControl());

// ================================
// Map Layers
// ================================
map.on("load", () => {
  // 3D Buildings Layer
  map.addLayer({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 12,
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-opacity": 0.6,
    },
  });

  // Grey Box Polygon (Station Area)
  map.addSource("grey-box-polygon", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [100.54290375367174, 13.733809366736663],
            [100.54279530379839, 13.733344589070178],
            [100.54341330036102, 13.733292005194475],
            [100.54343585616672, 13.733795931066046],
            [100.54290375367174, 13.733809366736663],
          ],
        ],
      },
    },
  });

  map.addLayer({
    id: "grey-box-layer",
    type: "fill",
    source: "grey-box-polygon",
    layout: {},
    paint: {
      "fill-color": "#0f0f0f",
      "fill-opacity": 1,
      "fill-outline-color": "#333",
    },
  });

  // Pipeline Lines (Red - Input)
  map.addSource("red-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [100.54409226706245, 13.725632508317634],
          [100.54396888445906, 13.727060380498923],
        ],
      },
    },
  });

  map.addLayer({
    id: "red-line-layer",
    type: "line",
    source: "red-line",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff0000", "line-width": 5 },
  });

  map.addSource("red-no.2-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [100.54297122985409, 13.733655708506689],
          [100.54276141860541, 13.735222479878493],
          [100.54553805256906, 13.734713680576297],
          [100.55856701569985, 13.734096410197285],
          [100.55857321327716, 13.732735752149985],
        ],
      },
    },
  });

  map.addLayer({
    id: "red-no.2-line-layer",
    type: "line",
    source: "red-no.2-line",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff0000", "line-width": 5 },
  });

  map.addSource("red-no.3-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [100.54276141860541, 13.735222479878493],
          [100.5425720868777, 13.735905306263433],
        ],
      },
    },
  });

  map.addLayer({
    id: "red-no.3-line-layer",
    type: "line",
    source: "red-no.3-line",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff0000", "line-width": 5 },
  });

  // Pipeline Lines (Blue - Output)
  map.addSource("blue-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [100.54440045931781, 13.725755971558524],
          [100.54431114696455, 13.727193723057317],
          [100.54319226614247, 13.7335242500625],
          [100.54303271727197, 13.734694332156907],
          [100.55706833230877, 13.733849759279195],
          [100.55717437845794, 13.733407078854386],
        ],
      },
    },
  });

  map.addLayer({
    id: "blue-line-layer",
    type: "line",
    source: "blue-line",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#0000ff", "line-width": 5 },
  });

  map.addSource("blue-line-no.2", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [100.54303271727197, 13.734694332156907],
          [100.54281985541066, 13.735920512547244],
        ],
      },
    },
  });

  map.addLayer({
    id: "blue-line-no.2-layer",
    type: "line",
    source: "blue-line-no.2",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#0000ff", "line-width": 5 },
  });
});

// ================================
// Station Definitions
// ================================
const locations = [
  {
    lng: 100.54430045867572,
    lat: 13.725756384536988,
    title: "Station No.1",
    displayName: "สถานีส่งน้ำคลองสาทร",
    networkStatusId: "0-0",
    pumps: [
      { pumpName: "Pump No.1", activeId: "1-1", alertId: "3-3", anmId: "2-2" },
      { pumpName: "Pump No.2", activeId: "4-4", alertId: "6-6", anmId: "5-5" },
      { pumpName: "Pump No.3", activeId: "7-7", alertId: "9-9", anmId: "8-8" },
    ],
    waterLevelId: "10-10",
    doorLevelId: "11-11",
  },
  {
    lng: 100.5439199057136,
    lat: 13.726865412769403,
    title: "Station No.2",
    displayName: "จุดรับน้ำ สวนลุมฯ ประตู 2",
    networkStatusId: "12-12",
    value: [{ valveName: "Valve No.1", activeId: "13-13", controlId: "14-14" }],
    waterLevelId: "15-15",
  },
  {
    lng: 100.5425720868777,
    lat: 13.735905306263433,
    title: "Station No.3",
    displayName: "จุดรับน้ำคลองต้นสน",
    networkStatusId: "16-16",
    value: [{ valveName: "Valve No.1", activeId: "17-17", controlId: "18-18" }],
    waterLevelId: "19-19",
  },
  {
    lng: 100.55198396041436,
    lat: 13.733804164187907,
    title: "Station No.4",
    displayName: "จุดรับน้ำต้นคลองไผ่สิงห์โต",
    networkStatusId: "20-20",
    valve: [{ valveName: "Valve No.1", activeId: "21-21", controlId: "22-22" }],
    waterLevelId: "23-23",
  },
  {
    lng: 100.55717437845794,
    lat: 13.733407078854386,
    title: "Station No.5",
    displayName: "บ่อรับน้ำเดิมคลองไผ่สิงห์โต",
    networkStatusId: "24-24",
    valve: [
      { valveName: "Valve No.1", activeId: "25-25", controlId: "26-26" },
      { valveName: "Valve No.2", activeId: "27-27", controlId: "28-28" },
    ],
    waterLevelId: "29-29",
  },
  {
    lng: 100.55986142328817,
    lat: 13.733882372348697,
    title: "Station No.6",
    displayName: "ประตูระบายน้ำคลองไผ่สิงห์โต",
    networkStatusId: "30-30",
    activeId: "31-31",
    controlId: "32-32",
    alertId: "33-33",
    doorLevelId: "34-34",
    waterLevelId: "35-35",
  },
];

// Global state
const markers = {};
let currentPopupStation = null;
let lastData = {};
let currentMode = "demo";
let isConnected = false;

// ================================
// Control Panel UI
// ================================
function createControlPanel() {
  const panel = document.createElement("div");
  panel.id = "controlPanel";
  panel.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">🎛️ Control Panel</span>
      <button id="togglePanel" class="toggle-btn">−</button>
    </div>
    <div class="panel-content">
      <div class="status-section">
        <div class="status-row">
          <span class="label">Connection:</span>
          <span id="connectionStatus" class="status disconnected">Disconnected</span>
        </div>
        <div class="status-row">
          <span class="label">Mode:</span>
          <span id="currentMode" class="mode-badge demo">DEMO</span>
        </div>
      </div>
      <div class="mode-switch">
        <button id="demoModeBtn" class="mode-btn active">🎮 Demo</button>
        <button id="modbusModeBtn" class="mode-btn">📡 Modbus</button>
      </div>
      <div class="server-info">
        <small>Server: localhost:3001</small>
      </div>
    </div>
  `;

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    #controlPanel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      z-index: 10000;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    #controlPanel:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.15);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: linear-gradient(90deg, rgba(100, 120, 255, 0.15) 0%, rgba(80, 100, 200, 0.1) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .panel-title {
      font-weight: 600;
      color: #fff;
      font-size: 15px;
      letter-spacing: 0.3px;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #aaa;
      font-size: 18px;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .panel-content {
      padding: 16px 18px;
    }

    .panel-content.collapsed {
      display: none;
    }

    .status-section {
      margin-bottom: 16px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .label {
      color: #8a8f9d;
      font-size: 13px;
    }

    .status {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status.connected {
      background: linear-gradient(135deg, rgba(40, 200, 120, 0.2) 0%, rgba(30, 180, 100, 0.3) 100%);
      color: #3ddb85;
      text-shadow: 0 0 10px rgba(61, 219, 133, 0.5);
    }

    .status.disconnected {
      background: linear-gradient(135deg, rgba(255, 80, 80, 0.2) 0%, rgba(200, 60, 60, 0.3) 100%);
      color: #ff6666;
      text-shadow: 0 0 10px rgba(255, 102, 102, 0.5);
    }

    .mode-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .mode-badge.demo {
      background: linear-gradient(135deg, rgba(255, 180, 0, 0.25) 0%, rgba(255, 140, 0, 0.35) 100%);
      color: #ffb347;
      text-shadow: 0 0 10px rgba(255, 179, 71, 0.5);
    }

    .mode-badge.modbus {
      background: linear-gradient(135deg, rgba(100, 150, 255, 0.25) 0%, rgba(80, 120, 255, 0.35) 100%);
      color: #7cb3ff;
      text-shadow: 0 0 10px rgba(124, 179, 255, 0.5);
    }

    .mode-switch {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }

    .mode-btn {
      flex: 1;
      padding: 12px 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #888;
      font-size: 13px;
      font-weight: 500;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .mode-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ccc;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .mode-btn.active {
      background: linear-gradient(135deg, rgba(100, 140, 255, 0.3) 0%, rgba(80, 100, 200, 0.4) 100%);
      color: #fff;
      border-color: rgba(100, 140, 255, 0.4);
      box-shadow: 0 4px 12px rgba(100, 140, 255, 0.2);
    }

    .server-info {
      text-align: center;
      color: #555;
      font-size: 11px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(panel);

  // Event listeners
  document.getElementById("togglePanel").addEventListener("click", () => {
    const content = document.querySelector(".panel-content");
    const btn = document.getElementById("togglePanel");
    content.classList.toggle("collapsed");
    btn.textContent = content.classList.contains("collapsed") ? "+" : "−";
  });

  document
    .getElementById("demoModeBtn")
    .addEventListener("click", () => switchMode("demo"));
  document
    .getElementById("modbusModeBtn")
    .addEventListener("click", () => switchMode("modbus"));
}

function updateControlPanel(mode, connected) {
  const connectionStatus = document.getElementById("connectionStatus");
  const currentModeEl = document.getElementById("currentMode");
  const demoBtn = document.getElementById("demoModeBtn");
  const modbusBtn = document.getElementById("modbusModeBtn");

  if (connectionStatus) {
    connectionStatus.textContent = connected ? "Connected" : "Disconnected";
    connectionStatus.classList.toggle("connected", connected);
    connectionStatus.classList.toggle("disconnected", !connected);
  }

  if (currentModeEl) {
    currentModeEl.textContent = mode.toUpperCase();
    currentModeEl.classList.toggle("demo", mode === "demo");
    currentModeEl.classList.toggle("modbus", mode === "modbus");
  }

  if (demoBtn && modbusBtn) {
    demoBtn.classList.toggle("active", mode === "demo");
    modbusBtn.classList.toggle("active", mode === "modbus");
  }
}

function switchMode(mode) {
  if (socket && socket.connected) {
    socket.emit("switchMode", { mode });
  }
}

// ================================
// Overlay & Popup System
// ================================
const overlay = document.createElement("div");
overlay.id = "overlay";
Object.assign(overlay.style, {
  display: "none",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  zIndex: 9999,
  alignItems: "center",
  justifyContent: "center",
});

const popupContainer = document.createElement("div");
popupContainer.id = "popupContainer";
Object.assign(popupContainer.style, {
  position: "relative",
  width: "480px",
  height: "480px",
  borderRadius: "16px",
  padding: "20px",
  backgroundImage: "url('./assets/image/image.png')",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
});

overlay.appendChild(popupContainer);
document.body.appendChild(overlay);

// Close on overlay click
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.style.display = "none";
    currentPopupStation = null;
  }
});

// ================================
// Station UI Rendering
// ================================
function renderStationUI(station, data) {
  data = data || {};
  const displayName = station.displayName || station.title;

  // Station No.6 - Flood Gate UI
  if (station.title === "Station No.6") {
    const floodData = data[station.activeId];
    const isFloodOpen = floodData?.values?.[0] === 1;
    const floodBg = isFloodOpen ? "#22c55e" : "#ef4444";
    const floodText = isFloodOpen ? "Open" : "Close";

    const controlData = data[station.controlId];
    const isRemote = controlData?.values?.[0] === 1;
    const controlBg = isRemote ? "#3b82f6" : "#ef4444";
    const controlText = isRemote ? "Remote" : "Local";

    const overloadData = data[station.alertId];
    const isOverload = overloadData?.values?.[0] === 1;
    const overloadBg = isOverload ? "#eab308" : "#4b4500";

    const waterLevel = data[station.waterLevelId]?.values?.[0] || 0;
    const doorLevel = data[station.doorLevelId]?.values?.[0] || 0;

    return `
      <button id="closePopupBtn" class="popup-close-btn">×</button>
      <h2 class="popup-title">${displayName}</h2>
      <div class="popup-content flood-gate">
        <div class="control-group">
          <label>Flood Gate</label>
          <div class="status-box" style="background:${floodBg}">${floodText}</div>
        </div>
        <div class="control-group">
          <label>Control Mode</label>
          <div class="status-box" style="background:${controlBg}">${controlText}</div>
        </div>
        <div class="control-group">
          <label>Overload</label>
          <div class="status-box small" style="background:${overloadBg}">OL</div>
        </div>
        <div class="level-display">
          <div class="level-item">
            <span class="level-label">Water Level</span>
            <span class="level-value">${waterLevel.toFixed(2)} m</span>
          </div>
          <div class="level-item">
            <span class="level-label">Door Level</span>
            <span class="level-value">${doorLevel}%</span>
          </div>
        </div>
      </div>
    `;
  }

  // Pump Station UI
  if (station.pumps) {
    const waterLevel = data[station.waterLevelId]?.values?.[0] || 0;
    const doorLevel = data[station.doorLevelId]?.values?.[0] || 0;

    let pumpsHTML = station.pumps
      .map((p) => {
        const isActive = data[p.activeId]?.values?.[0] === 1;
        const isOverload = data[p.alertId]?.values?.[0] === 1;
        const isAuto = data[p.anmId]?.values?.[0] === 1;

        return `
        <div class="pump-card">
          <div class="pump-name">${p.pumpName}</div>
          <div class="status-box ${isActive ? "active" : "inactive"}">${
          isActive ? "START" : "STOP"
        }</div>
          <div class="status-box small ${
            isOverload ? "warning" : "off"
          }">OL</div>
          <div class="status-box small ${isAuto ? "auto" : "manual"}">${
          isAuto ? "Auto" : "Manual"
        }</div>
        </div>
      `;
      })
      .join("");

    return `
      <button id="closePopupBtn" class="popup-close-btn">×</button>
      <h2 class="popup-title">${displayName}</h2>
      <div class="popup-content pump-station">
        <div class="pumps-container">${pumpsHTML}</div>
        <div class="level-display">
          <div class="level-item">
            <span class="level-label">Water Level</span>
            <span class="level-value">${waterLevel.toFixed(2)} m</span>
          </div>
          <div class="level-item">
            <span class="level-label">Door Level</span>
            <span class="level-value">${doorLevel}%</span>
          </div>
        </div>
      </div>
    `;
  }

  // Valve Station UI
  const valves = station.value || station.valve || [];
  const waterLevel = data[station.waterLevelId]?.values?.[0] || 0;

  let valvesHTML = valves
    .map((v) => {
      const isOpen = data[v.activeId]?.values?.[0] === 1;
      const isRemote = data[v.controlId]?.values?.[0] === 1;

      return `
      <div class="valve-card">
        <div class="valve-name">${v.valveName || "Valve"}</div>
        <div class="status-box ${isOpen ? "open" : "closed"}">${
        isOpen ? "Open" : "Close"
      }</div>
        <div class="status-box small ${isRemote ? "remote" : "local"}">${
        isRemote ? "Remote" : "Local"
      }</div>
      </div>
    `;
    })
    .join("");

  return `
    <button id="closePopupBtn" class="popup-close-btn">×</button>
    <h2 class="popup-title">${displayName}</h2>
    <div class="popup-content valve-station">
      <div class="valves-container">${valvesHTML}</div>
      <div class="level-display single">
        <div class="level-item">
          <span class="level-label">Water Level</span>
          <span class="level-value">${waterLevel.toFixed(2)} m</span>
        </div>
      </div>
    </div>
  `;
}

// Popup Styles
const popupStyles = document.createElement("style");
popupStyles.textContent = `
  .popup-close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 28px;
    color: white;
    border: none;
    background: rgba(0,0,0,0.3);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .popup-close-btn:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
  }

  .popup-title {
    margin-top: 50px;
    margin-left: 20px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .pumps-container, .valves-container {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
  }

  .pump-card, .valve-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 15px;
    background: rgba(0,0,0,0.3);
    border-radius: 12px;
    backdrop-filter: blur(4px);
  }

  .pump-name, .valve-name {
    color: white;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 5px;
  }

  .status-box {
    width: 80px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 13px;
    text-transform: uppercase;
  }

  .status-box.small {
    width: 70px;
    height: 30px;
    font-size: 11px;
  }

  .status-box.active { background: #22c55e; }
  .status-box.inactive { background: #ef4444; }
  .status-box.warning { background: #eab308; color: #000; }
  .status-box.off { background: #4b4500; color: #888; }
  .status-box.auto { background: #3b82f6; }
  .status-box.manual { background: #ef4444; }
  .status-box.open { background: #22c55e; }
  .status-box.closed { background: #ef4444; }
  .status-box.remote { background: #3b82f6; }
  .status-box.local { background: #ef4444; }

  .level-display {
    display: flex;
    gap: 60px;
    margin-top: 20px;
  }

  .level-display.single {
    justify-content: center;
  }

  .level-item {
    text-align: center;
  }

  .level-label {
    display: block;
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    margin-bottom: 5px;
  }

  .level-value {
    display: block;
    color: white;
    font-size: 28px;
    font-weight: bold;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  .control-group {
    margin-bottom: 15px;
    text-align: center;
  }

  .control-group label {
    display: block;
    color: rgba(255,255,255,0.8);
    font-size: 13px;
    margin-bottom: 8px;
  }
`;
document.head.appendChild(popupStyles);

// Background image mapping
const stationBackgrounds = {
  "Station No.1": "./assets/image/image.png",
  "Station No.2": "./assets/image/IMG_3893.png",
  "Station No.3": "./assets/image/IMG_3893.png",
  "Station No.4": "./assets/image/IMG_3893.png",
  "Station No.5": "./assets/image/IMG_3894.png",
  "Station No.6": "./assets/image/IMG_3895.png",
};

function openPopup(station, data) {
  currentPopupStation = station;

  const bgImage =
    stationBackgrounds[station.title] || "./assets/image/image.png";
  popupContainer.style.backgroundImage = `url('${bgImage}')`;

  popupContainer.innerHTML = renderStationUI(station, data);

  const closeBtn = document.getElementById("closePopupBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      currentPopupStation = null;
    });
  }

  overlay.style.display = "flex";
}

// ================================
// Marker Creation
// ================================
locations.forEach((station) => {
  const customMarker = document.createElement("div");
  Object.assign(customMarker.style, {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });

  const label = document.createElement("div");
  Object.assign(label.style, {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 40, 0.85)",
    padding: "6px 12px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    fontSize: "12px",
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    transform: "translate(50%, -120%)",
    position: "absolute",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.1)",
  });

  let statusCircle = null;
  if (station.networkStatusId) {
    statusCircle = document.createElement("div");
    Object.assign(statusCircle.style, {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      marginRight: "6px",
      backgroundColor: "red",
      boxShadow: "0 0 6px rgba(255, 0, 0, 0.5)",
    });
    label.appendChild(statusCircle);
  }

  const titleText = document.createElement("span");
  titleText.innerText = station.title;
  label.appendChild(titleText);

  const markerDot = document.createElement("div");
  Object.assign(markerDot.style, {
    width: "18px",
    height: "18px",
    backgroundColor: "red",
    borderRadius: "50%",
    position: "absolute",
    bottom: "0px",
    border: "3px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  });

  customMarker.appendChild(label);
  customMarker.appendChild(markerDot);

  const marker = new mapboxgl.Marker({ element: customMarker })
    .setLngLat([station.lng, station.lat])
    .addTo(map);

  markers[station.title] = {
    marker,
    markerDot,
    statusCircle,
    station,
    blinkingInterval: null,
    isActive: false,
  };

  customMarker.addEventListener("click", () => {
    openPopup(station, lastData);
  });
});

// ================================
// Marker Update
// ================================
function updateMarkers(data) {
  if (!data) return;

  locations.forEach((station) => {
    const markerInfo = markers[station.title];
    if (!markerInfo) return;

    const { markerDot, statusCircle } = markerInfo;

    // Update network status indicator
    if (statusCircle && station.networkStatusId) {
      const statusValue = data[station.networkStatusId]?.values?.[0] || 0;
      const isOnline = statusValue === 1;
      statusCircle.style.backgroundColor = isOnline ? "#22c55e" : "#ef4444";
      statusCircle.style.boxShadow = isOnline
        ? "0 0 8px rgba(34, 197, 94, 0.6)"
        : "0 0 8px rgba(239, 68, 68, 0.6)";
    }

    // Check pump activity and overload
    const isActive =
      station.pumps?.some((p) => data[p.activeId]?.values?.[0] === 1) || false;
    const isOverload =
      station.pumps?.some((p) => data[p.alertId]?.values?.[0] === 1) || false;

    // Handle blinking for overload
    if (markerInfo.blinkingInterval && !isOverload) {
      clearInterval(markerInfo.blinkingInterval);
      markerInfo.blinkingInterval = null;
    }

    if (!isOverload) {
      markerDot.style.backgroundColor = isActive ? "#22c55e" : "#ef4444";
    }

    if (isOverload && !markerInfo.blinkingInterval) {
      let toggle = true;
      markerInfo.blinkingInterval = setInterval(() => {
        markerDot.style.backgroundColor = toggle ? "#eab308" : "#666";
        toggle = !toggle;
      }, 500);
    }
  });
}

// ================================
// Socket.IO Connection
// ================================
const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket");
  isConnected = true;
  updateControlPanel(currentMode, true);
});

socket.on("modeChange", (data) => {
  console.log("🔄 Mode changed:", data.mode);
  currentMode = data.mode;
  updateControlPanel(currentMode, isConnected);
});

socket.on("modbusData", (data) => {
  lastData = data;
  updateMarkers(data);

  // Update popup if open
  if (overlay.style.display === "flex" && currentPopupStation) {
    popupContainer.innerHTML = renderStationUI(currentPopupStation, lastData);

    const closeBtn = document.getElementById("closePopupBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        currentPopupStation = null;
      });
    }
  }
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from WebSocket");
  isConnected = false;
  lastData = {};
  updateControlPanel(currentMode, false);

  // Reset all markers
  Object.values(markers).forEach((markerInfo) => {
    if (markerInfo.blinkingInterval) {
      clearInterval(markerInfo.blinkingInterval);
      markerInfo.blinkingInterval = null;
    }
    markerInfo.markerDot.style.backgroundColor = "#ef4444";
    if (markerInfo.statusCircle) {
      markerInfo.statusCircle.style.backgroundColor = "#ef4444";
    }
  });
});

// Initialize control panel when DOM is ready
document.addEventListener("DOMContentLoaded", createControlPanel);

// If DOM is already loaded
if (document.readyState !== "loading") {
  createControlPanel();
}
