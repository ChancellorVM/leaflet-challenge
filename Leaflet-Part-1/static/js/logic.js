// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map.
let street = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [20, 0], // Center the map at a global view
  zoom: 2,
  layers: [basemap] // Default layer
});

// OPTIONAL: Step 2
// Create layer groups for earthquakes and tectonic plates.
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Create baseMaps and overlays for the layer control.
let baseMaps = {
  "Basemap": basemap,
  "Street Map": street
};

let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add the layer control to the map.
L.control.layers(baseMaps, overlays).addTo(map);

// Make a request that retrieves the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to return the style data for each earthquake
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 0.8,
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth determines color
      color: "#000000", // Black border
      radius: getRadius(feature.properties.mag), // Magnitude determines radius
      stroke: true,
      weight: 0.5
    };
  }

  // Function to determine the color based on the earthquake depth
  function getColor(depth) {
    return depth > 90 ? "#ff0000" :
           depth > 70 ? "#ff8000" :
           depth > 50 ? "#ffff00" :
           depth > 30 ? "#80ff00" :
           depth > 10 ? "#00ff00" :
                        "#00ffff";
  }

  // Function to determine the radius of the earthquake marker based on its magnitude
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add a GeoJSON layer to the map.
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
         <hr>
         <p>Magnitude: ${feature.properties.mag}</p>
         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
      );
    }
  }).addTo(earthquakes);

  // Add the earthquake layer to the map.
  earthquakes.addTo(map);

  // Create a legend control object.
  let legend = L.control({ position: "bottomright" });

  // Add the details for the legend.
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ['#00ffff', '#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff0000'];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML += `<i style="background: ${colors[i]}"></i> ${
        depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}` : '+'}<br>`;
    }
    return div;
  };

  // Add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get the tectonic plates GeoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Add the tectonic plates data to the tectonicPlates layer.
    L.geoJson(plate_data, {
      color: "#ff6500",
      weight: 2
    }).addTo(tectonicPlates);

    // Add the tectonic plates layer to the map.
    tectonicPlates.addTo(map);
  });
});
