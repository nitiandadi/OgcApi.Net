const timeline = [
  {
    label: "08:00",
    peak: 72,
    growth: 8,
    coverage: 46,
    narrative:
      "早高峰的出行热力在核心商务区爆发，公共交通枢纽呈现耀眼的洋红色热度。",
    points: [
      { name: "国贸 CBD", coord: [116.467, 39.914], value: 72, type: "business" },
      { name: "中关村", coord: [116.325, 39.983], value: 64, type: "innovation" },
      { name: "西直门", coord: [116.355, 39.947], value: 58, type: "transit" },
      { name: "金融街", coord: [116.364, 39.922], value: 53, type: "finance" }
    ],
    routes: [
      {
        coordinates: [
          [116.321, 40.002],
          [116.352, 39.991],
          [116.38, 39.972],
          [116.418, 39.955]
        ],
        intensity: 0.7
      }
    ]
  },
  {
    label: "12:00",
    peak: 81,
    growth: 12,
    coverage: 53,
    narrative:
      "午间商业消费区热度陡增，时尚地带与文创街区形成双核心炫彩带。",
    points: [
      { name: "三里屯", coord: [116.459, 39.936], value: 81, type: "lifestyle" },
      { name: "后海", coord: [116.392, 39.941], value: 68, type: "culture" },
      { name: "蓝色港湾", coord: [116.479, 39.955], value: 63, type: "leisure" },
      { name: "大悦城", coord: [116.512, 39.921], value: 59, type: "retail" }
    ],
    routes: [
      {
        coordinates: [
          [116.449, 39.94],
          [116.456, 39.93],
          [116.48, 39.913],
          [116.5, 39.905]
        ],
        intensity: 0.8
      }
    ]
  },
  {
    label: "18:00",
    peak: 95,
    growth: 22,
    coverage: 66,
    narrative:
      "夜幕点亮交通与消费动线，热力场呈现璀璨霓虹，向城市副中心溢出。",
    points: [
      { name: "国贸 CBD", coord: [116.467, 39.914], value: 95, type: "business" },
      { name: "望京", coord: [116.482, 39.997], value: 87, type: "innovation" },
      { name: "首钢园", coord: [116.167, 39.907], value: 73, type: "culture" },
      { name: "通州运河", coord: [116.739, 39.908], value: 61, type: "smart-city" }
    ],
    routes: [
      {
        coordinates: [
          [116.289, 39.91],
          [116.37, 39.92],
          [116.451, 39.917],
          [116.559, 39.912]
        ],
        intensity: 0.95
      },
      {
        coordinates: [
          [116.467, 39.914],
          [116.523, 39.924],
          [116.608, 39.925],
          [116.706, 39.913]
        ],
        intensity: 0.82
      }
    ]
  }
];

const typeColors = {
  business: "#ff4bc2",
  innovation: "#7d6dff",
  transit: "#4ad7ff",
  finance: "#a5ff7b",
  lifestyle: "#ffb347",
  culture: "#9d8cff",
  leisure: "#3fe0c5",
  retail: "#ff8fab",
  "smart-city": "#57f1ff"
};

const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [116.4074, 39.9042],
  zoom: 10.5,
  pitch: 55,
  bearing: -20,
  antialias: true
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
map.addControl(new maplibregl.FullscreenControl());

const slider = document.getElementById("time-slider");
const timeLabel = document.getElementById("time-label");
const topList = document.getElementById("top-list");
const peakValue = document.getElementById("peak-value");
const growthRate = document.getElementById("growth-rate");
const coverage = document.getElementById("coverage");
const storyText = document.getElementById("story-text");

slider.max = timeline.length - 1;
let activeIndex = 0;
let markers = [];

function buildGeoJson(timeIndex) {
  const features = timeline[timeIndex].points.map((point) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: point.coord
    },
    properties: {
      name: point.name,
      value: point.value,
      type: point.type
    }
  }));

  return {
    type: "FeatureCollection",
    features
  };
}

function buildRoutes(timeIndex) {
  return {
    type: "FeatureCollection",
    features: timeline[timeIndex].routes.map((route) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route.coordinates
      },
      properties: {
        intensity: route.intensity
      }
    }))
  };
}

function renderMarkers(data) {
  markers.forEach((marker) => marker.remove());
  markers = data.features.map((feature) => {
    const el = document.createElement("div");
    el.className = "marker-pulse";
    el.style.background = typeColors[feature.properties.type] || "#ff4bc2";
    const marker = new maplibregl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
        new maplibregl.Popup({ offset: 18 }).setHTML(`
          <strong>${feature.properties.name}</strong><br />
          指数值：<span style="color:${typeColors[feature.properties.type] || "#ff4bc2"}">
            ${feature.properties.value}
          </span>
        `)
      )
      .addTo(map);
    return marker;
  });
}

function updateOverlay(timeIndex) {
  const state = timeline[timeIndex];
  timeLabel.textContent = state.label;
  peakValue.textContent = state.peak;
  growthRate.textContent = `+${state.growth}%`;
  coverage.textContent = `${state.coverage}%`;
  storyText.textContent = state.narrative;

  topList.innerHTML = "";
  state.points
    .slice()
    .sort((a, b) => b.value - a.value)
    .forEach((point, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${idx + 1}. ${point.name}</span><span>${point.value}</span>`;
      topList.appendChild(li);
    });
}

function updateCharts() {
  const trendCtx = document.getElementById("trend-chart");
  const radarCtx = document.getElementById("radar-chart");

  const labels = timeline.map((item) => item.label);
  const trendData = timeline.map((item) => item.peak);
  const coverageData = timeline.map((item) => item.coverage);

  new Chart(trendCtx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "峰值指数",
          data: trendData,
          fill: true,
          borderColor: "#ff4bc2",
          backgroundColor: "rgba(255, 75, 194, 0.25)",
          tension: 0.45,
          pointRadius: 0
        },
        {
          label: "空间覆盖率",
          data: coverageData,
          borderColor: "#7a6dff",
          backgroundColor: "rgba(122, 109, 255, 0.2)",
          tension: 0.45,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          grid: { color: "rgba(255,255,255,0.08)" },
          ticks: {
            callback: (value) => `${value}`
          }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#f6f8ff" }
        }
      }
    }
  });

  const radarLabels = ["商业活跃度", "创新动能", "交通通量", "文化吸引力", "夜间经济"];
  new Chart(radarCtx, {
    type: "radar",
    data: {
      labels: radarLabels,
      datasets: timeline.map((item, idx) => ({
        label: item.label,
        data: [
          item.peak,
          item.points[1]?.value || item.peak * 0.7,
          item.points[2]?.value || item.peak * 0.6,
          item.points[3]?.value || item.peak * 0.5,
          item.peak * (0.6 + idx * 0.08)
        ],
        borderColor: `hsla(${idx * 110}, 85%, 65%, 0.9)`,
        backgroundColor: `hsla(${idx * 110}, 85%, 65%, 0.2)`
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: "rgba(255,255,255,0.1)" },
          grid: { color: "rgba(255,255,255,0.1)" },
          pointLabels: { color: "rgba(255,255,255,0.65)" },
          ticks: {
            backdropColor: "transparent",
            color: "rgba(255,255,255,0.45)",
            showLabelBackdrop: false
          }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#f6f8ff" }
        }
      }
    }
  });
}

map.on("load", () => {
  map.setFog({
    color: "#09102a",
    highColor: "#6c7bff",
    spaceColor: "#000000",
    horizonBlend: 0.2,
    starIntensity: 0.2
  });

  map.setLight({
    color: "#a5b6ff",
    intensity: 0.6,
    position: [1.15, 90, 80]
  });

  map.addSource("hotspots", {
    type: "geojson",
    data: buildGeoJson(activeIndex)
  });

  map.addLayer({
    id: "heatmap-layer",
    type: "heatmap",
    source: "hotspots",
    paint: {
      "heatmap-weight": ["interpolate", ["linear"], ["get", "value"], 0, 0, 100, 1],
      "heatmap-intensity": 1.8,
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 9, 18, 14, 42],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 0, 0, 0)",
        0.3,
        "rgba(88, 171, 255, 0.45)",
        0.6,
        "rgba(122, 109, 255, 0.75)",
        0.8,
        "rgba(255, 75, 194, 0.8)",
        1,
        "rgba(255, 120, 86, 0.85)"
      ],
      "heatmap-opacity": 0.85
    }
  });

  map.addLayer({
    id: "hotspot-glow",
    type: "circle",
    source: "hotspots",
    paint: {
      "circle-radius": 16,
      "circle-color": ["get", "typeColor"],
      "circle-opacity": 0,
      "circle-blur": 1.2
    }
  });

  map.addSource("routes", {
    type: "geojson",
    data: buildRoutes(activeIndex)
  });

  map.addLayer({
    id: "route-layer",
    type: "line",
    source: "routes",
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9,
        3,
        14,
        12
      ],
      "line-color": [
        "interpolate",
        ["linear"],
        ["get", "intensity"],
        0.6,
        "rgba(74, 215, 255, 0.5)",
        1,
        "rgba(255, 75, 194, 0.85)"
      ],
      "line-blur": 1.4,
      "line-opacity": 0.85
    }
  });

  updateView(activeIndex);
  updateCharts();
});

function updateView(index) {
  activeIndex = index;
  slider.value = String(index);

  const geoJson = buildGeoJson(index);
  geoJson.features.forEach((feature) => {
    feature.properties.typeColor = typeColors[feature.properties.type] || "#ff4bc2";
  });

  const heatSource = map.getSource("hotspots");
  if (heatSource) {
    heatSource.setData(geoJson);
  }

  const routeSource = map.getSource("routes");
  if (routeSource) {
    routeSource.setData(buildRoutes(index));
  }

  renderMarkers(geoJson);
  updateOverlay(index);
}

slider.addEventListener("input", (event) => {
  const index = Number(event.target.value);
  updateView(index);
});

const toggles = {
  heat: document.getElementById("heat-toggle"),
  pulse: document.getElementById("pulse-toggle"),
  route: document.getElementById("route-toggle")
};

toggles.heat.addEventListener("change", (event) => {
  map.setLayoutProperty(
    "heatmap-layer",
    "visibility",
    event.target.checked ? "visible" : "none"
  );
});

toggles.pulse.addEventListener("change", (event) => {
  const visibility = event.target.checked;
  markers.forEach((marker) => (visibility ? marker.addTo(map) : marker.remove()));
});

toggles.route.addEventListener("change", (event) => {
  map.setLayoutProperty(
    "route-layer",
    "visibility",
    event.target.checked ? "visible" : "none"
  );
});

let autoPlay = setInterval(() => {
  const nextIndex = (activeIndex + 1) % timeline.length;
  updateView(nextIndex);
}, 6000);

[slider, toggles.heat, toggles.pulse, toggles.route].forEach((element) => {
  element.addEventListener("input", () => {
    clearInterval(autoPlay);
    autoPlay = setInterval(() => {
      const nextIndex = (activeIndex + 1) % timeline.length;
      updateView(nextIndex);
    }, 6000);
  });
});

updateOverlay(activeIndex);
