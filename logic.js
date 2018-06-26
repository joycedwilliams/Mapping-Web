// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	accessToken: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson',
	id: 'mapbox.streets',
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
});

// Initialize all of the LayerGroups we'll be using
var layers = {
  Magnitude: new L.LayerGroup(),
  Latitude: new L.LayerGroup(),
  Longitude: new L.LayerGroup(),
  Place: new L.LayerGroup()
};

// Create the map with our layers
var map = L.map("map-id", {
  center: [0, 360],
  zoom: 12,
  layers: [
    layers.Magnitude,
    layers.Latitude,   
    layers.Longitude,
    layers.Place
  ]
});

// Add our 'lightmap' tile layer to the map
lightmap.addTo(map);

// Create an overlays object to add to the layer control
var overlays = {
  "Magnitude": layers.Magnitude,
  "Latitude": layers.EMPTY,
  "Longitude": layers.Longitude,
  "Place": layers.Place
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map
var info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map
info.addTo(map);

// Initialize an object containing icons for each layer group
var icons = {
  Magnitude: L.ExtraMarkers.icon({
    icon: "ion-settings",
    iconColor: "white",
    markerColor: "yelLongitude",
    shape: "star"
  }),
  Latitude: L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "red",
    shape: "circle"
  }),
  Longitude: L.ExtraMarkers.icon({
    icon: "ion-minus-circled",
    iconColor: "white",
    markerColor: "blue-dark",
    shape: "penta"
  }),
  Place: L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "orange",
    shape: "circle"
  }),
  Place: L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "green",
    shape: "circle"
  })
};

// Perform an API call to the earthquakes GEOJSON
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson", function(infoRes) {

  // When the first API call is complete, perform another call to the earthquakes GEOJSON
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson", function(statusRes) {
    var updatedAt = infoRes.last_updated;
    var earthquakeStatus = statusRes.data.earthquake;
    var earthquakeInfo = infoRes.data.earthquake;

    // Create an object to keep of the number of markers in each layer
    var earthquakeCount = {
      Magnitude: 0,
      Latitude: 0,
      Longitude: 0,
      Place: 0
    };

    // Initialize a earthquakeStatusCode, which will be used as a key to access the appropriate layers, icons, and earthquake count for layer group
    var earthquakeStatusCode;

    // Loop through the earthquakes (they're the same size and have partially matching data)
    for (var i = 0; i < earthquakeInfo.length; i++) {

      // Create a new earthquake object with properties of both earthquake objects
      var earthquake = Object.assign({}, earthquakeInfo[i], earthquakeStatus[i]);

      // If a earthquake > 5 bikes, it's status is Longitude
      if (earthquake.magnitude_earthquakes_available > 6) {
        earthquakeStatusCode = "Major";
      }
      else if (earthquake.magnitude_earthquakes_available < 6) {
        earthquakeStatusCode = "Minor";
      }
      // Otherwise the earthquake is Place
      else {
        earthquakeStatusCode = "Not Significant";
      }

      // Update the earthquake count
      earthquakeCount[earthquakeStatusCode]++;
      // Create a new marker with the appropriate icon and coordinates
      var newMarker = L.marker([earthquake.lat, earthquake.lon], {
        icon: icons[earthquakeStatusCode]
      });

      // Add the new marker to the appropriate layer
      newMarker.addTo(layers[earthquakeStatusCode]);

      // Bind a popup to the marker that will  display on click. This will be rendered as HTML
      newMarker.bindPopup(earthquake.name + "<br> Capacity: " + earthquake.capacity + "<br>" + earthquake.num_bikes_available + " Bikes Available");
    }

    // Call the updateLegend function, which will... update the legend!
    updateLegend(updatedAt, earthquakeCount);
  });
});

// Update the legend's innerHTML with the last updated time and earthquake count
function updateLegend(time, earthquakeCount) {
  document.querySelector(".legend").innerHTML = [
    "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
    "<p class='out-of-order'>Out of Order earthquakes: " + earthquakeCount.OUT_OF_ORDER + "</p>",
    "<p class='coming-soon'>earthquakes Coming Soon: " + earthquakeCount.COMING_SOON + "</p>",
    "<p class='empty'>Empty earthquakes: " + earthquakeCount.EMPTY + "</p>",
    "<p class='Longitude'>Longitude earthquakes: " + earthquakeCount.Longitude + "</p>",
    "<p class='healthy'>Healthy earthquakes: " + earthquakeCount.Place + "</p>"
  ].join("");
}
