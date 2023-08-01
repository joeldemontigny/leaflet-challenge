// Set variables for earthquake locations
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
  });

// Function is used to determine the size of the marker based on the magnitude.
function markerSize(magnitude) {
return magnitude * 4;
}

// set color based on mag value.
function markerColor(depth) {
    if (depth >= 90) {
        return "red";
    } else if (depth < 90 && depth >= 70) {
        return "orangered";
    } else if (depth < 70 && depth > 50) {
        return "darkorange";
    } else if (depth < 50 && depth > 30) {
        return "orange";
    } else if (depth < 30 && depth > 10) {
        return "yellow";
    } else {
        return "limegreen";
    }
};

function createFeatures(earthquakeData) {

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h1>Location: ${feature.properties.place}</h1><hr><h3>Magnitude: ${feature.properties.mag}</h3><br><h3>Depth: ${feature.geometry.coordinates[2]}</h3>`)
    } 
     
    
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
            });
        },
        onEachFeature: onEachFeature
      });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }

  function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    
    });
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    
  });
  
  
    // Define a baseMaps
    let baseMaps = {
      "Street": street,
      "Topography": topo,
  
    };
  
    // Create overlay objects for layers
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map with layers
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control to the map
    
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [-10, 10, 30, 50, 70, 90];
        const labels = [];
        const legendInfo = "<strong>Magnitude</strong>";
        div.innerHTML = legendInfo;
  
  // Loop through the magnitudes array and generate the legend HTML
  for (let i = 0; i < magnitudes.length; i++) {
    const from = magnitudes[i];
    const to = magnitudes[i + 1];
    labels.push(
      '<li style="background-color:' +
      markerColor(from + 1) +
      '"> <span>' +
      from +
      (to ? '&ndash;' + to : '+') +
      '</span></li>'
    );
  }
  
  // Add label items to the div under the <ul> tag
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Add legend to the map
legend.addTo(myMap);
};