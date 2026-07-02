/**
 * DAWASA admin complaint map: Mapbox GL with clusters, color pins, fly-to.
 */
(function () {
  const PIN_ZOOM_THRESHOLD = 13;
  const pinMarkers = new Map();
  let activePopup = null;
  let selectedId = null;
  let map = null;
  let layersReady = false;

  function esc(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function popupHtml(props) {
    const coords = props.lat && props.lng
      ? "<div><strong>Coordinates:</strong> Lat " + esc(props.lat) + ", Lng " + esc(props.lng) + "</div>"
      : "";
    return (
      '<div class="dawasa-popup-title">' + esc(props.label) + "</div>" +
      '<span class="dawasa-popup-badge" style="background:' + esc(props.color) + "22;color:" + esc(props.color) + ';">' +
        esc(props.statusLabel) +
      "</span>" +
      '<div class="dawasa-popup-meta">' +
        "<div><strong>Phone:</strong> " + esc(props.phone) + "</div>" +
        "<div><strong>Assigned:</strong> " + esc(props.assigned) + "</div>" +
        "<div><strong>Submitted:</strong> " + esc(props.submitted) + "</div>" +
        coords +
        (props.note ? '<div style="margin-top:6px;">' + esc(props.note) + "</div>" : "") +
      "</div>" +
      '<a class="dawasa-popup-link" href="' + esc(props.url) + '">View complaint</a>'
    );
  }

  function createPinElement(props, highlighted) {
    const el = document.createElement("div");
    el.className = "dawasa-map-pin" + (highlighted ? " dawasa-map-pin-active" : "");
    el.style.setProperty("--pin-color", props.color || "#007AFF");
    el.title = props.label || "Complaint";
    el.innerHTML =
      '<svg width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">' +
        '<path d="M14 0C6.82 0 1 5.82 1 13c0 9.75 13 23 13 23s13-13.25 13-23C27 5.82 21.18 0 14 0z"' +
          ' fill="var(--pin-color)" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="14" cy="13" r="5" fill="#fff"/>' +
      "</svg>";
    return el;
  }

  function clearPins() {
    pinMarkers.forEach(function (entry) { entry.marker.remove(); });
    pinMarkers.clear();
  }

  function openPopup(feature) {
    const coords = feature.geometry.coordinates;
    const props = feature.properties;
    if (activePopup) activePopup.remove();
    activePopup = new mapboxgl.Popup({ offset: 22, closeButton: true, maxWidth: "280px" })
      .setLngLat(coords)
      .setHTML(popupHtml(props))
      .addTo(map);
  }

  function highlightListItem(id) {
    document.querySelectorAll(".dawasa-map-list-item").forEach(function (el) {
      el.classList.toggle("active", el.dataset.id === id);
    });
    selectedId = id;
    pinMarkers.forEach(function (entry, pinId) {
      entry.el.classList.toggle("dawasa-map-pin-active", pinId === id);
    });
  }

  function flyToComplaint(feature) {
    const coords = feature.geometry.coordinates;
    highlightListItem(feature.properties.id);
    map.flyTo({
      center: coords,
      zoom: Math.max(map.getZoom(), 16),
      duration: 1200,
      essential: true,
    });
    map.once("moveend", function () {
      ensureMapSize();
      refreshPins();
      openPopup(feature);
    });
  }

  function refreshPins() {
    clearPins();
    if (!map || !map.getSource("complaints")) return;
    if (map.getZoom() < PIN_ZOOM_THRESHOLD) return;

    const data = window.dawasaMapFilteredGeojson();
    data.features.forEach(function (feature) {
      const props = feature.properties;
      const el = createPinElement(props, props.id === selectedId);
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        flyToComplaint(feature);
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
      pinMarkers.set(props.id, { marker: marker, el: el, feature: feature });
    });
  }

  function ensureMapSize() {
    if (map) map.resize();
  }

  function bindClusterHandlers() {
    map.on("click", "clusters", function (e) {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      map.getSource("complaints").getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;
        map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom + 0.5 });
      });
    });

    map.on("click", "unclustered-point", function (e) {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0];
      flyToComplaint({
        geometry: feature.geometry,
        properties: feature.properties,
      });
    });

    map.on("mouseenter", "clusters", function () { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "clusters", function () { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", "unclustered-point", function () { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "unclustered-point", function () { map.getCanvas().style.cursor = ""; });
  }

  function addPointLayers() {
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "complaints",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#93c5fd",
          5,
          "#4FACFE",
          10,
          "#007AFF",
        ],
        "circle-radius": ["step", ["get", "point_count"], 22, 5, 28, 10, 34],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "complaints",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 13,
      },
      paint: { "text-color": "#ffffff" },
    });

    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "complaints",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ["get", "color"],
        "circle-radius": 9,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }

  function addLayers() {
    if (!map || typeof window.dawasaMapFilteredGeojson !== "function") return;

    const data = window.dawasaMapFilteredGeojson();
    if (window.dawasaMapUpdateVisibleCount) {
      window.dawasaMapUpdateVisibleCount(data.features.length);
    }

    if (map.getSource("complaints")) {
      map.getSource("complaints").setData(data);
      fitToData(data);
      refreshPins();
      if (window.dawasaMapSyncListVisibility) window.dawasaMapSyncListVisibility();
      return;
    }

    map.addSource("complaints", {
      type: "geojson",
      data: data,
      cluster: true,
      clusterMaxZoom: PIN_ZOOM_THRESHOLD - 1,
      clusterRadius: 50,
    });

    addPointLayers();
    if (!layersReady) {
      bindClusterHandlers();
      layersReady = true;
    }

    fitToData(data);
    refreshPins();
    if (window.dawasaMapSyncListVisibility) window.dawasaMapSyncListVisibility();
  }

  function fitToData(data) {
    if (!data.features.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    data.features.forEach(function (f) { bounds.extend(f.geometry.coordinates); });
    map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
  }

  window.initDawasaComplaintMap = function (config) {
    if (typeof mapboxgl === "undefined") {
      console.error("DAWASA map: Mapbox GL JS not loaded.");
      return;
    }

    const container = document.getElementById("map");
    if (!container) {
      console.error("DAWASA map: #map element not found.");
      return;
    }

    mapboxgl.accessToken = config.token;

    map = new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [39.2083, -6.7924],
      zoom: 11,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.on("error", function (e) {
      const err = e && e.error ? e.error : e;
      console.error("DAWASA map error:", err);
      const message =
        err && (err.status === 401 || err.status === 403)
          ? "Mapbox token rejected. Set the full MAP_BOX_TOKEN on the server and allow this admin URL in Mapbox token restrictions."
          : "Map failed to load tiles. Check MAP_BOX_TOKEN and network access to api.mapbox.com.";
      container.innerHTML =
        '<p style="padding:16px;color:#b91c1c;line-height:1.5;">' + message + "</p>";
    });

    map.on("load", function () {
      ensureMapSize();
      addLayers();
      requestAnimationFrame(ensureMapSize);
      setTimeout(ensureMapSize, 100);
      setTimeout(ensureMapSize, 400);
    });

    map.on("zoomend", refreshPins);
    map.on("moveend", ensureMapSize);

    window.addEventListener("resize", ensureMapSize);

    const resizeTarget = container.closest(".dawasa-map-container") || container;
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () {
        ensureMapSize();
      }).observe(resizeTarget);
    }

    window.dawasaMapFlyTo = flyToComplaint;
    window.dawasaMapEnsureSize = ensureMapSize;
    window.dawasaMapRefresh = function () {
      if (map && map.isStyleLoaded()) {
        addLayers();
        ensureMapSize();
      }
    };
  };
})();
