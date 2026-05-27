// scripts/charts/startermap.js
const svg = d3.select("#f1-map");
const width = +svg.attr("width");
const height = +svg.attr("height");

// load in world map
const projection = d3.geoEqualEarth()
    .scale(140)
    .translate([width / 2, height / 2 + 20]);
const worldMap = d3.geoPath().projection(projection);

// hold json file
let testJSON = null;

//create starter map
export function testMap() {
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(topology => {
            const countries = topojson.feature(topology, topology.objects.countries).features;
            
            // Draw world geography map
            svg.append("g")
                .attr("class", "countries-layer")
                .selectAll("path")
                .data(countries)
                .enter().append("path")
                .attr("d", worldMap)
                .attr("fill", "#e1e5ea")
                .attr("stroke", "#050404")
                .attr("stroke-width", 0.5);

            // canvas node to point marks
            svg.append("g").attr("class", "markers-layer");

            // load json file
            return d3.json("data/f1_processed.json");
        })
        .then(jsonData => {
            testJSON = jsonData;
            
            // initialize first year
            updateMap(1950);
        })
        .catch(err => console.error("Error drawing spatial-temporal baseline layers:", err));
}

export function updateMap(selectedYear) {
    if (!testJSON) return;

    // find race locations
    const raceLocation = testJSON[selectedYear] || [];

    // bind lang/long to circles
    const markers = svg.select(".markers-layer")
        .selectAll("circle")
        .data(raceLocation, d => d.name_race);

    //remove once leaving section
    markers.exit().remove();
    // append coordinates
    markers.enter()
        .append("circle")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1])
        .attr("r", 3)
        .attr("fill", "#e63946")
        //.attr("opacity", 0.85)
        //.attr("stroke", "#050404")
        //.attr("stroke-width", 0.75);
}