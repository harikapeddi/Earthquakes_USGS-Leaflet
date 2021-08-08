
// using all day more than 1 magnitude earthquakes data from usgs site
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson"

// d3.json(url).then(function(data){

//     console.log(data)

// });




// create variables for tilelayer - streetmap, satellitemap, 
// https://docs.mapbox.com/api/maps/styles/ - check this for different tilelayers

// Create the base layers.
const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// const greyMap = L.tileLayer.grayscale('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
//     attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
// });

// Create a baseMaps object.
const baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
    // "Greyscale Map": greyMap
};



// create variable for earthquakes and tectonic plates as a new layer group

const earthquakes = new L.LayerGroup();

const tectonic_plates = new L.LayerGroup();

//create a overlay map for earthquakes
const overlayMaps = {
    "Earthquakes": earthquakes,
    "Techtonic Plates": tectonic_plates, 

};

// define a map object

const myMap = L.map("map", {
    center: [
        15.6, -28.7
    ],
    zoom: 3,
    layers: [street, earthquakes, tectonic_plates]
});

// create a control layer 
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

d3.json(url).then(function (data) {

    // create circle markers for each earthquake
    // create a function to get the radius of the earthquake
    function getRadius(magnitude) {

        return Math.sqrt(magnitude) * 8 //5 is an arbitrary factor to make the circles look better

    }

    // create a function to get the circle color
    //using colors from colorbrewer2 website
    // #d73027
// #fc8d59
// #fee090
// #e0f3f8
// #91bfdb
// #4575b4
    function getColor(depth) {
        switch (true) {

            case depth > 90:
                return '#EA2C2C';
            case depth > 70:
                return '#EA822C';
            case depth > 50:
                return '#EE9C00';
            case depth > 30:
                return '#EECC00';
            case depth > 10:
                return '#D4EE00';
            default: 
                return '#98EE00'
        }
    }

    // create a function to get the style of the marker
    function getStyle(features) {
        return {
            fillColor: getColor(features.geometry.coordinates[2]),
            color: 'black',
            radius: getRadius(features.properties.mag),
            stroke: true,
            weight: 0.6,
            opacity: 0.8,
            fillOpacity: 0.7
        };
    }

    // add a geojson layer
    L.geoJSON(data, {
        pointToLayer: function (features, latlng) {
            return L.circleMarker(latlng);
        },
        // get style 
        style: getStyle,


        // create popup for each marker
        // function onEachFeature(feature, layer) {
        //     // does this feature have a property named popupContent?
        //     if (feature.properties && feature.properties.popupContent) {
        //         layer.bindPopup(feature.properties.popupContent);
        //     }
        // }

        onEachFeature: function (features, layer) {
            layer.bindPopup(
                'Location: '
                + features.properties.place
                + '<br> Time: '
                + Date(features.properties.time)
                + '<br> Magnitude: '
                + features.properties.mag
                + '<br> Depth: '
                + features.geometry.coordinates[2]
            );
        }
        // add to the map
    }).addTo(myMap);
}); //end of data

// go to https://github.com/fraxen/tectonicplates , then to Geojson folder, then to boundaries.json, then click raw on the github repo
// get tectonic plates from https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
    // use geojson method to make a layer
    L.geoJSON(plateData, {
        color: 'orange',
        weight: 1.5
    }).addTo(tectonic_plates);

});

// create a legend
// get this from leaflet tutorial chloropleth 
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');
    var grades = [90, 70, 50, 30, 10];
    var colors = [
        '#EA2C2C', 
        '#EA822C',
        '#EE9C00',
        '#EECC00',
        '#D4EE00',
        '#98EE00'
    ];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:'
            + colors[i] 
            + '"></i> ' 
            + grades[i] 
            + (grades[i + 1] ? '&ndash;' 
            + grades[i + 1] + '<br>' : '+');
    }

    return div;
};


legend.addTo(myMap);





