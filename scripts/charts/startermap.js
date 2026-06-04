//import { show_circuit_detail } from "./driverDrilldown.js";
// scripts/charts/startermap.js
const svg = d3.select("#f1-map");
const width = +svg.attr("width");
const height = +svg.attr("height");

svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

const projection = d3.geoEqualEarth();
const worldMap = d3.geoPath().projection(projection);

let raceRows = [];
let firstCircuitRows = [];
let firstYearByCircuit = new Map();
let pendingYear = 1950;

function circuitKey(race) {
    return `${race.location}-${race.country}-${race.lat}-${race.lng}`.toLowerCase();
}

function cleanRaceRows(rawCalendar) {
    return Object.entries(rawCalendar)
        .flatMap(([year, races]) => races.map(race => ({
            ...race,
            year: +year,
            circuitKey: circuitKey(race)
        })))
        .filter(race => Number.isFinite(race.lat) && Number.isFinite(race.lng))
        .sort((a, b) => d3.ascending(a.year, b.year));
}

function findFirstCircuitRows(rows) {
    const firstSeen = new Map();

    for (const row of rows) {
        if (!firstSeen.has(row.circuitKey)) {
            firstSeen.set(row.circuitKey, {
                ...row,
                firstYear: row.year
            });
        }
    }

    return Array.from(firstSeen.values());
}

function projectedPoint(race) {
    return projection([race.lng, race.lat]);
}

function drawCountries(countries) {
    projection.fitExtent([[36, 56], [width - 36, height - 76]], { type: "Sphere" });

    svg.append("g")
        .attr("class", "countries-layer")
        .selectAll("path")
        .data(countries)
        .join("path")
        .attr("d", worldMap)
        .attr("fill", "#e7edf2")
        .attr("stroke", "#6f7d89")
        .attr("stroke-width", 0.52);

    svg.append("g").attr("class", "context-circuit-layer");
    svg.append("g").attr("class", "current-race-layer");
}

export function testMap() {
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(topology => {
            const countries = topojson.feature(topology, topology.objects.countries).features;

            drawCountries(countries);

            return d3.json("data/f1_processed.json");
        })
        .then(jsonData => {
            raceRows = cleanRaceRows(jsonData);
            firstCircuitRows = findFirstCircuitRows(raceRows);
            firstYearByCircuit = new Map(firstCircuitRows.map(race => [race.circuitKey, race.firstYear]));

            updateMap(pendingYear);
        })
        .catch(err => console.error("Error drawing spatial-temporal map layers:", err));
}

export function updateMap(selectedYear, options = {}) {
    pendingYear = Math.max(1950, Math.min(2024, Math.round(selectedYear)));

    if (!raceRows.length) return;

    const shouldAnimate = options.animate === true;
    const currentSeason = raceRows.filter(race => race.year === pendingYear);
    const currentKeys = new Set(currentSeason.map(race => race.circuitKey));
    const earlierCircuits = firstCircuitRows
        .filter(race => race.firstYear <= pendingYear && !currentKeys.has(race.circuitKey));

    d3.select(".map-title").text(`Circuit Expansion Map | ${pendingYear}`);

    const contextMarks = svg.select(".context-circuit-layer")
        .selectAll("circle")
        .data(earlierCircuits, race => race.circuitKey);

    const contextExit = contextMarks.exit().interrupt();

    if (shouldAnimate) {
        contextExit.transition()
            .duration(220)
            .ease(d3.easeCubicOut)
            .attr("r", 0)
            .attr("opacity", 0)
            .remove();
    } else {
        contextExit.remove();
    }

    const contextUpdate = contextMarks.enter()
        .append("circle")
        .attr("class", "context-circuit")
        .attr("cx", race => projectedPoint(race)[0])
        .attr("cy", race => projectedPoint(race)[1])
        .attr("r", 0)
        .attr("opacity", 0)
        .merge(contextMarks)
        .interrupt()
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .interrupt()
                .attr("r", 5.2)
                .attr("opacity", 0.72);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .interrupt()
                .attr("r", 2.6)
                .attr("opacity", 0.32);
        })
        .on("click", function(event, d) {
            show_circuit_detail(d);
        });

    const contextTarget = shouldAnimate
        ? contextUpdate.transition().duration(360).ease(d3.easeCubicOut)
        : contextUpdate;

    contextTarget
        .attr("cx", race => projectedPoint(race)[0])
        .attr("cy", race => projectedPoint(race)[1])
        .attr("r", 2.6)
        .attr("opacity", 0.32);

    const currentMarks = svg.select(".current-race-layer")
        .selectAll("circle")
        .data(currentSeason, race => `${race.circuitKey}-${race.name_race}`);

    const currentExit = currentMarks.exit().interrupt();

    if (shouldAnimate) {
        currentExit.transition()
            .duration(220)
            .ease(d3.easeCubicOut)
            .attr("r", 0)
            .attr("opacity", 0)
            .remove();
    } else {
        currentExit.remove();
    }

    const currentUpdate = currentMarks.enter()
        .append("circle")
        .attr("cx", race => projectedPoint(race)[0])
        .attr("cy", race => projectedPoint(race)[1])
        .attr("r", 1.5)
        .attr("opacity", 0)
        .merge(currentMarks)
        .attr("class", race => firstYearByCircuit.get(race.circuitKey) === pendingYear ? "current-race is-new-circuit" : "current-race")
        .interrupt()
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .interrupt()
                .attr("r", firstYearByCircuit.get(d.circuitKey) === pendingYear ? 8.4 : 7)
                .attr("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .interrupt()
                .attr("r", firstYearByCircuit.get(d.circuitKey) === pendingYear ? 7.2 : 5.8)
                .attr("opacity", 0.92);
        })
        .on("click", function(event, d) {
            show_circuit_detail(d);
        });

    const currentTarget = shouldAnimate
        ? currentUpdate.transition().duration(420).ease(d3.easeCubicOut)
        : currentUpdate;

    currentTarget
        .attr("cx", race => projectedPoint(race)[0])
        .attr("cy", race => projectedPoint(race)[1])
        .attr("r", race => firstYearByCircuit.get(race.circuitKey) === pendingYear ? 7.2 : 5.8)
        .attr("opacity", 0.92);
}
