// Store API endpoints as queryUrl and techtonicURL.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
let techtonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
  });

// Function is used to determine the size of a marker based on the magnitude value.
function markerSize(magnitude) {
return magnitude * 3;
}

// markerColor() function takes a magnitude parameter and determines the corresponding colour code based on the magnitude value
function markerColor(depth) {
    if (depth >= 90) {
        return "#ff0000";
    } else if (depth < 90 && depth >= 70) {
        return "#ff8000";
    } else if (depth < 70 && depth > 50) {
        return "##ffbf00";
    } else if (depth < 50 && depth > 30) {
        return "#ffff00";
    } else if (depth < 30 && depth > 10) {
        return "#bfff00";
    } else {
        return "#00ff00";
    }
};

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the title and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><p><b>Magnitude</b>: ${feature.properties.mag}</p><p><b>Depth:</b> ${feature.geometry.coordinates[2]}</p>`);
    } 
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
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
  
  
    // Define a baseMaps object to hold our base layers
    let baseMaps = {
       "Street": street,
       "Topography": topo,
    
    };
    
    // Create overlay object to hold our overlay layer
    let overlayMaps = {
       Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 4,
      layers: [street, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [-10, 10, 30, 50, 70, 90];
        const labels = [];
        const legendInfo = "<strong>Depth</strong>";
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
