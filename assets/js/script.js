mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9hcnkiLCJhIjoiY203MzNyMnNpMGdxbDJrcHNyZnZtdnZoZCJ9.zn5h1zC-j47Tlh0aXMyp7g";

// สร้าง Map
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

// เมื่อโหลด Map เสร็จ
map.on("load", () => {
  // เพิ่มเลเยอร์ 3D Buildings
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

  map.addSource("grey-box-polygon", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [100.54290375367174, 13.733809366736663], // จุด A
            [100.54279530379839, 13.733344589070178], // จุด C
            [100.54341330036102, 13.733292005194475], // จุด D
            [100.54343585616672, 13.733795931066046], // จุด B
            [100.54290375367174, 13.733809366736663], // ปิด Polygon กลับ A
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
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#ff0000",
      "line-width": 5,
    },
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
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#ff0000",
      "line-width": 5,
    },
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
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#ff0000",
      "line-width": 5,
    },
  });

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
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#0000ff",
      "line-width": 5,
    },
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
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#0000ff",
      "line-width": 5,
    },
  });
});

/* ================================
   ตำแหน่งและ Register ID ของทั้ง 7 Station
   ================================ */
const locations = [
  {
    lng: 100.54430045867572,
    lat: 13.725756384536988,
    title: "Station No.1",
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
    networkStatusId: "12-12",
    value: [{ valveName: "Value No.1", activeId: "13-13", controlId: "14-14" }],
    waterLevelId: "15-15",
  },
  {
    lng: 100.5425720868777,
    lat: 13.735905306263433,
    title: "Station No.3",
    networkStatusId: "16-16",
    value: [{ valveName: "Value No.1", activeId: "17-17", controlId: "18-18" }],
    waterLevelId: "19-19",
  },
  {
    lng: 100.55198396041436,
    lat: 13.733804164187907,
    title: "Station No.4",
    networkStatusId: "20-20",
    valve: [{ valveName: "Valve No.1", activeId: "21-21", controlId: "22-22" }],
    waterLevelId: "23-23",
  },
  {
    lng: 100.55717437845794,
    lat: 13.733407078854386,
    title: "Station No.5",
    networkStatusId: "24-24",
    valve: [
      { valveName: "Valve No.1", activeId: "25-25", controlId: "26-26" },
      { valveName: "Valve No.2", activeId: "25-25", controlId: "28-28" },
    ],
    waterLevelId: "29-29",
  },
  {
    lng: 100.55986142328817,
    lat: 13.733882372348697,
    title: "Station No.6",
    networkStatusId: "30-30",
    // สำหรับสถานีนี้ เราจะใช้ฟิลด์ activeId, controlId, alertId, doorLevelId, waterLevelId
    activeId: "31-31",       // ใช้เป็น Status Flood
    controlId: "32-32",      // ใช้เป็น Control Status
    alertId: "33-33",        // ใช้เป็น Overload
    doorLevelId: "34-34",
    waterLevelId: "35-35",
  },
];

const markers = {};

// ตัวแปร global สำหรับเก็บสถานีที่เปิด popup อยู่
let currentPopupStation = null;

// =======================
// สร้าง Overlay และ Popup
// =======================
const overlay = document.createElement("div");
overlay.id = "overlay";
Object.assign(overlay.style, {
  display: "none",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
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
  borderRadius: "10px",
  padding: "20px",
  // ค่าเริ่มต้นสำหรับสถานีส่งน้ำคลองสาทร
  backgroundImage: "url('./assets/image/image.png')",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
});

const closeButton = document.createElement("button");
closeButton.id = "closeButton";
closeButton.innerText = "×";
Object.assign(closeButton.style, {
  position: "absolute",
  top: "10px",
  right: "20px",
  fontSize: "20px",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontWeight: "bold",
});

closeButton.addEventListener("click", () => {
  overlay.style.display = "none";
  currentPopupStation = null;
});

overlay.appendChild(popupContainer);
popupContainer.appendChild(closeButton);
document.body.appendChild(overlay);

/**
 * ฟังก์ชัน renderStationUI:
 * แยกกรณีสถานีที่มี pumps (เช่น สถานีส่งน้ำคลองสาทร)
 * สถานีที่มี valve/value (จุดรับน้ำ/บ่อรับน้ำ) และ
 * สถานี "ประตูระบายน้ำคลองไผ่สิงห์โต" (มีการเพิ่ม Status Flood, Control Status, Overload, Door Level)
 */
function renderStationUI(station, data) {
  data = data || {};

  // เฉพาะสถานี "ประตูระบายน้ำคลองไผ่สิงห์โต" ใช้ UI แบบใหม่
  if (station.title === "ประตูระบายน้ำคลองไผ่สิงห์โต") {
    const floodData = data[station.activeId];
    const isFloodOpen = floodData && Array.isArray(floodData.values) && floodData.values[0] === 1;
    const floodBg = isFloodOpen ? "green" : "red";
    const floodText = isFloodOpen ? "Open" : "Close";
    const floodTextColor = isFloodOpen ? "blue" : "white";

    const controlData = data[station.controlId];
    const isRemote = controlData && Array.isArray(controlData.values) && controlData.values[0] === 1;
    const controlBg = isRemote ? "blue" : "red";
    const controlText = isRemote ? "Remote" : "Not Remote";

    const overloadData = data[station.alertId];
    const isOverload = overloadData && Array.isArray(overloadData.values) && overloadData.values[0] === 1;
    const overloadBg = isOverload ? "yellow" : "#696200";
    const overloadText = "OL";

    const waterLevel = data[station.waterLevelId]?.values?.[0] || 0;
    const doorLevel = data[station.doorLevelId]?.values?.[0] || 0;

    return `
      <button id="closePopupBtn" style="
        position:absolute;
        top:5px;
        right:10px;
        font-size:30px;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        color: white;
        border:none;
        background:none;
        cursor:pointer;
        font-weight:bold;">
        ×
      </button>
      <h2 style="
        margin-top: 55px;
        margin-left: 60px;
        color: white;
        font-size: 15px;
        font-weight: bold;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
        ${station.title}
      </h2>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin-top: 56px;">
        <div style="font-weight:bold; color:white;">Flood</div>
        <div style="
          width: 120px;
          height: 40px;
          border-radius: 5px;
          background-color: ${floodBg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: ${floodTextColor};
        ">
          ${floodText}
        </div>
        <div style="
          width: 120px;
          height: 40px;
          border-radius: 5px;
          background-color: ${controlBg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        ">
          ${controlText}
        </div>
        <div style="
          width: 80px;
          height: 40px;
          border-radius: 5px;
          background-color: ${overloadBg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
        ">
          ${overloadText}
        </div>
        <div style="display: flex; gap: 150px; margin-top: 50px;">
          <div style="text-align: center;">
            <div style="font-weight: bold; margin-bottom: 5px; color: white;">Water Level</div>
            <div style="font-size: 28px; color: white;">${waterLevel} m</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: bold; margin-bottom: 5px; color: white;">Door Level</div>
            <div style="font-size: 28px; color: white;">${doorLevel} m</div>
          </div>
        </div>
      </div>
    `;
  }

  // -----------------------------
  // 1) สถานีที่มี pumps (เช่น สถานีส่งน้ำคลองสาทร)
  // -----------------------------
  if (station.pumps) {
    const w = data[station.waterLevelId]?.values?.[0] || 0;
    const d = data[station.doorLevelId]?.values?.[0] || 0;
    let pumpsHTML = "";
    station.pumps.forEach((p) => {
      const pumpActive = data[p.activeId];
      const pumpAlert = data[p.alertId];
      const isActive =
        pumpActive && Array.isArray(pumpActive.values) && pumpActive.values[0] === 1;
      const isAlert =
        pumpAlert && Array.isArray(pumpAlert.values) && pumpAlert.values[0] === 1;
      const topColor = isActive ? "green" : "red";
      const bottomColor = isAlert ? "yellow" : "#696200";
      const topText = isActive ? "START" : "STOP";
      const bottomText = isAlert ? "OL" : "OL";
      
      // A/M Pump
      let anmHTML = "";
      if (p.anmId) {
        const pumpAnm = data[p.anmId];
        const isAuto =
          pumpAnm && Array.isArray(pumpAnm.values) && pumpAnm.values[0] === 1;
        const anmColor = isAuto ? "blue" : "red";
        const anmText = isAuto ? "Auto" : "Manual";
        anmHTML = `
          <div style="
            width:80px;
            height:40px;
            margin:5px auto 0;
            border-radius:5px;
            background-color:${anmColor};
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            font-weight:bold;
          ">
            ${anmText}
          </div>
        `;
      }
      
      pumpsHTML += `
        <div style="
          padding: 10px;
          width: 120px;
        ">
          <div style="
            text-align:center;
            font-weight:bold;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            margin-bottom:8px;
            color:#fff;
            border-radius:5px;
            padding:5px;
          ">
            ${p.pumpName.toUpperCase()}
          </div>
          <div style="
            width:80px;
            height:40px;
            margin:0 auto 5px;
            border-radius:5px;
            background-color:${topColor};
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            font-weight:bold;
          ">
            ${topText}
          </div>
          <div style="
            width:80px;
            height:40px;
            margin:0 auto;
            border-radius:5px;
            background-color:${bottomColor};
            display:flex;
            align-items:center;
            justify-content:center;
            color:#000;
            font-weight:bold;
          ">
            ${bottomText}
          </div>
          ${anmHTML}
        </div>
      `;
    });
    
    return `
      <button id="closePopupBtn" style="
        position:absolute;
        top:5px;
        right:10px;
        font-size:30px;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        color: white;
        border:none;
        background:none;
        cursor:pointer;
        font-weight:bold;">
        ×
      </button>
      <h2 style="
        margin-top: 55px;
        margin-left: 60px;
        color: white;
        font-size: 15px;
        font-weight: bold;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
        ${station.title}
      </h2>
      <div style="
        display:flex;
        justify-content:center;
        gap:10px;
        margin-top: 37px;
        margin-left: 10px;
        margin-bottom: 40px">
        ${pumpsHTML}
      </div>
      <div style="
        display:flex;
        gap:30px;">
        <div style="
          width:120px;
          margin-left: 50px;">
          <div style="
            text-align:center;
            font-weight:bold;
            color: white;
            margin-bottom: 5px;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
            Water Level
          </div>
          <div style="
            text-align:center;
            font-size:28px;
            color: white;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
            ${w} m
          </div>
        </div>
        <div style="
          width:120px;
          margin-left: 100px;">
          <div style="
            text-align:center;
            font-weight:bold;
            color: white;
            margin-bottom: 5px;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
            Door Level
          </div>
          <div style="
            text-align:center;
            font-size:28px;
            color: white;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
            ${d} m
          </div>
        </div>
      </div>
    `;
  }
  
  // -----------------------------
  // 2) สถานีที่มี valve / value
  // -----------------------------
  const valves = station.value || station.valve || [];
  let valvesHTML = "";
  valves.forEach((v) => {
    const valveStatus = data[v.activeId];
    const isOpen =
      valveStatus && Array.isArray(valveStatus.values) && valveStatus.values[0] === 1;
    const valveControl = data[v.controlId];
    const isRemote =
      valveControl && Array.isArray(valveControl.values) && valveControl.values[0] === 1;
    
    const statusBgColor = isOpen ? "green" : "red";
    const statusTextColor = isOpen ? "blue" : "white";
    const statusText = isOpen ? "Open" : "Close";
    
    const controlBgColor = isRemote ? "blue" : "red";
    const controlText = isRemote ? "Remote" : "Not Remote";
    
    valvesHTML += `
      <div style="
        padding: 10px;
        width: 120px;
      ">
        <div style="
          text-align:center;
          font-weight:bold;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
          margin-bottom:28px;
          color:#fff;
          border-radius:5px;
          padding:5px;
        ">
          ${v.valveName || "Valve"}
        </div>
        <div style="
          width:80px;
          height:40px;
          margin-left:15px;
          margin-bottom:5px;
          border-radius:5px;
          background-color:${statusBgColor};
          display:flex;
          align-items:center;
          justify-content:center;
          color:${statusTextColor};
          font-weight:bold;
        ">
          ${statusText}
        </div>
        <div style="
          width:100px;
          height:40px;
          margin-left:5px;
          border-radius:5px;
          background-color:${controlBgColor};
          display:flex;
          align-items:center;
          justify-content:center;
          color:#fff;
          font-weight:bold;
        ">
          ${controlText}
        </div>
      </div>
    `;
  });
  
  const waterLevel = data[station.waterLevelId]?.values?.[0] || 0;
  
  return `
    <button id="closePopupBtn" style="
      position:absolute;
      top:5px;
      right:10px;
      font-size:30px;
      font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
      color: white;
      border:none;
      background:none;
      cursor:pointer;
      font-weight:bold;">
      ×
    </button>
    <h2 style="
      margin-top: 55px;
      margin-left: 60px;
      color: white;
      font-size: 15px;
      font-weight: bold;
      font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
      ${station.title}
    </h2>
    <div style="
      display:flex;
      justify-content:center;
      gap:10px;
      margin-top: 37px;
      margin-left: 10px;
      margin-bottom: 67px">
      ${valvesHTML}
    </div>
    <div style="
      display:flex;
      justify-content:center;
      gap:30px;">
      <div style="
        width:120px;
        margin-left: 10px;">
        <div style="
          text-align:center;
          font-weight:bold;
          color: white;
          margin-bottom: 5px;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
          Water Level
        </div>
        <div style="
          text-align:center;
          font-size:28px;
          color: white;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
          ${waterLevel} m
        </div>
      </div>
    </div>
  `;
}

/**
 * ฟังก์ชัน openPopup:
 * เมื่อคลิก marker จะทำการแสดง popup โดยกำหนด background-image ของ popupContainer
 * โดยใช้เงื่อนไขดังนี้:
 * - สถานีส่งน้ำคลองสาทร => image.png
 * - จุดรับน้ำ สวนลุมฯ ประตู 2, จุดรับน้ำคลองต้นสน, จุดรับน้ำต้นคลองไผ่สิงห์โต
 *    => IMG_3893.png
 * - บ่อรับน้ำเดิมคลองไผ่สิงห์โต => IMG_3894.png
 * - ประตูระบายน้ำคลองไผ่สิงห์โต => IMG_3895.png
 */
function openPopup(station, data) {
  currentPopupStation = station;
  
  if (station.title === "สถานีส่งน้ำคลองสาทร") {
    popupContainer.style.backgroundImage = "url('./assets/image/image.png')";
  } else if (
    station.title === "จุดรับน้ำ สวนลุมฯ ประตู 2" ||
    station.title === "จุดรับน้ำคลองต้นสน" ||
    station.title === "จุดรับน้ำต้นคลองไผ่สิงห์โต"
  ) {
    popupContainer.style.backgroundImage = "url('./assets/image/IMG_3893.png')";
  } else if (station.title === "บ่อรับน้ำเดิมคลองไผ่สิงห์โต") {
    popupContainer.style.backgroundImage = "url('./assets/image/IMG_3894.png')";
  } else if (station.title === "ประตูระบายน้ำคลองไผ่สิงห์โต") {
    popupContainer.style.backgroundImage = "url('./assets/image/IMG_3895.png')";
  } else {
    popupContainer.style.backgroundImage = "url('./assets/image/image.png')";
  }
  
  popupContainer.innerHTML = renderStationUI(station, data);
  const closePopupBtn = document.getElementById("closePopupBtn");
  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      currentPopupStation = null;
    });
  }
  overlay.style.display = "flex";
}

/* ================================
   สร้าง Marker สำหรับแต่ละ Station
   ================================ */
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
    backgroundColor: "rgba(55, 55, 55, 0.66)",
    padding: "5px 10px",
    borderRadius: "5px",
    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
    fontSize: "12px",
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    transform: "translate(50%, -120%)",
    position: "absolute",
  });

  let statusCircle = null;
  if (station.networkStatusId) {
    statusCircle = document.createElement("div");
    Object.assign(statusCircle.style, {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      marginRight: "5px",
      backgroundColor: "red",
    });
    label.appendChild(statusCircle);
  }

  const titleText = document.createElement("span");
  titleText.innerText = station.title;
  label.appendChild(titleText);

  const markerDot = document.createElement("div");
  Object.assign(markerDot.style, {
    width: "20px",
    height: "20px",
    backgroundColor: "red",
    borderRadius: "50%",
    position: "absolute",
    bottom: "0px",
  });

  customMarker.appendChild(label);
  customMarker.appendChild(markerDot);

  const marker = new mapboxgl.Marker({ element: customMarker })
    .setLngLat([station.lng, station.lat])
    .addTo(map);

  markers[station.title] = {
    marker,
    markerDot,
    statusCircle, // เก็บ reference ของ statusCircle
    station,
    blinkingInterval: null,
    isActive: false,
  };

  customMarker.addEventListener("click", () => {
    openPopup(station, lastData);
  });
});

/**
 * updateMarkers:
 * อัปเดตสีของ markerDot และ statusCircle ตามข้อมูลที่ได้รับจาก Socket.io
 */
function updateMarkers(data) {
  if (!data) return;
  locations.forEach((station) => {
    const markerInfo = markers[station.title];
    if (!markerInfo) return;
    const { markerDot, statusCircle } = markerInfo;
    if (statusCircle && station.networkStatusId) {
      const statusData = data[station.networkStatusId];
      const statusValue = statusData?.values?.[0] || 0;
      statusCircle.style.backgroundColor =
        statusValue === 1 ? "#42ff00" : "red";
    }
    const isActive =
      station.pumps &&
      station.pumps.some((p) => {
        const pumpData = data[p.activeId];
        return (
          pumpData && Array.isArray(pumpData.values) && pumpData.values[0] === 1
        );
      });
    const isOverload =
      station.pumps &&
      station.pumps.some((p) => {
        const pumpData = data[p.alertId];
        return (
          pumpData && Array.isArray(pumpData.values) && pumpData.values[0] === 1
        );
      });
    if (markerInfo.blinkingInterval && !isOverload) {
      clearInterval(markerInfo.blinkingInterval);
      markerInfo.blinkingInterval = null;
    }
    if (!isOverload) {
      markerDot.style.backgroundColor = isActive ? "#42ff00" : "red";
    }
    if (isOverload && !markerInfo.blinkingInterval) {
      let blinking = true;
      markerInfo.blinkingInterval = setInterval(() => {
        markerDot.style.backgroundColor = blinking ? "yellow" : "gray";
        blinking = !blinking;
      }, 500);
    }
  });
}

// ==============================
// Socket.IO สำหรับรับข้อมูล Realtime
// ==============================
const socket = io("http://localhost:3001");
let lastData = {};
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket");
});
socket.on("modbusData", (data) => {
  console.log("📩 Received Data:", data);
  lastData = data;
  updateMarkers(data);
  if (overlay.style.display === "flex" && currentPopupStation) {
    popupContainer.innerHTML = renderStationUI(currentPopupStation, lastData);
    const closePopupBtn = document.getElementById("closePopupBtn");
    if (closePopupBtn) {
      closePopupBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        currentPopupStation = null;
      });
    }
  }
});
socket.on("disconnect", () => {
  console.log("❌ Disconnected");
  lastData = {};
  Object.values(markers).forEach((markerInfo) => {
    if (markerInfo.blinkingInterval) {
      clearInterval(markerInfo.blinkingInterval);
      markerInfo.blinkingInterval = null;
    }
    markerInfo.markerDot.style.backgroundColor = "red";
  });
});
