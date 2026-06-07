// scripts/charts/startermap.js
const countryColor = new Map([
    ["Argentina", "#2a9d8f"],
    ["Australia", "#6c63b8"],
    ["Austria", "#3867a8"],
    ["Azerbaijan", "#e9a227"],
    ["Bahrain", "#c85c54"],
    ["Belgium", "#3867a8"],
    ["Brazil", "#2a9d8f"],
    ["Canada", "#2a9d8f"],
    ["China", "#e9a227"],
    ["France", "#3867a8"],
    ["Germany", "#3867a8"],
    ["Hungary", "#3867a8"],
    ["India", "#e9a227"],
    ["Italy", "#3867a8"],
    ["Japan", "#e9a227"],
    ["Malaysia", "#e9a227"],
    ["Mexico", "#2a9d8f"],
    ["Monaco", "#3867a8"],
    ["Morocco", "#6f7d4f"],
    ["Netherlands", "#3867a8"],
    ["Portugal", "#3867a8"],
    ["Qatar", "#c85c54"],
    ["Russia", "#3867a8"],
    ["Saudi Arabia", "#c85c54"],
    ["Singapore", "#e9a227"],
    ["South Africa", "#6f7d4f"],
    ["South Korea", "#e9a227"],
    ["Spain", "#3867a8"],
    ["Sweden", "#3867a8"],
    ["Switzerland", "#3867a8"],
    ["Turkey", "#3867a8"],
    ["United Arab Emirates", "#c85c54"],
    ["United Kingdom", "#3867a8"],
    ["United States of America", "#2a9d8f"]
]);

const countryDebut = new Map([
    ["Argentina", 1953],
    ["Australia", 1985],
    ["Austria", 1964],
    ["Azerbaijan", 2016],
    ["Bahrain", 2004],
    ["Belgium", 1950],
    ["Brazil", 1973],
    ["Canada", 1967],
    ["China", 2004],
    ["France", 1950],
    ["Germany", 1951],
    ["Hungary", 1986],
    ["India", 2011],
    ["Italy", 1950],
    ["Japan", 1976],
    ["Malaysia", 1999],
    ["Mexico", 1963],
    ["Monaco", 1950],
    ["Morocco", 1958],
    ["Netherlands", 1952],
    ["Portugal", 1958],
    ["Qatar", 2021],
    ["Russia", 2014],
    ["Saudi Arabia", 2021],
    ["Singapore", 2008],
    ["South Africa", 1962],
    ["South Korea", 2010],
    ["Spain", 1951],
    ["Sweden", 1973],
    ["Switzerland", 1950],
    ["Turkey", 2005],
    ["United Arab Emirates", 2009],
    ["United Kingdom", 1950],
    ["United States of America", 1950]
]);

const countryNameAliases = new Map([
    ["United States", "United States of America"],
    ["UAE", "United Arab Emirates"],
    ["Korea", "South Korea"],
    ["Republic of Korea", "South Korea"]
]);

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

function show_circuit_detail(d) {
    if (!d) return;

    const detail = d3.select("#detailPanel");
    detail.selectAll("*").remove();
    detail.style("display", "block");

    detail.append("h3")
        .text("Circuit Detail");

    detail.append("p")
        .attr("class", "detail-subtitle")
        .text("Country: " + d.country);

    detail.append("p")
        .html("Race Name: " + d.name_race);

    detail.append("p")
        .text("Location: Lat " + d.lat + ", Lng " + d.lng);
}

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

function bestMapCountryName(feature) {
    const props = feature.properties ?? {};
    const possibleNames = [props.name, props.name_long, props.admin, props.geounit, props.sovereignt]
        .filter(Boolean);

    for (const name of possibleNames) {
        const fixedName = countryNameAliases.get(name) ?? name;

        if (countryDebut.has(fixedName)) {
            return fixedName;
        }
    }

    return possibleNames[0] ?? "";
}

function splitFrenchGuianaFromFrance(feature) {
    if (feature?.properties?.name !== "France" || feature?.geometry?.type !== "MultiPolygon") {
        return [feature];
    }

    return feature.geometry.coordinates.map(coordinates => {
        const singlePiece = {
            ...feature,
            geometry: { type: "Polygon", coordinates },
            properties: { ...feature.properties }
        };
        const [lon, lat] = d3.geoCentroid(singlePiece);
        const isFrenchGuiana = lon < -40 && lat > -10 && lat < 15;

        if (!isFrenchGuiana) {
            return singlePiece;
        }

        return {
            ...singlePiece,
            properties: {
                ...singlePiece.properties,
                name: "French Guiana",
                displayRegion: "Americas",
                displayColor: "#2a9d8f",
                displayDebut: 1950
            }
        };
    });
}

function mapFeaturesFromGeo(geoData) {
    const features = geoData.type === "FeatureCollection"
        ? geoData.features
        : topojson.feature(geoData, geoData.objects.countries).features;

    return features.flatMap(splitFrenchGuianaFromFrance);
}

function countryFillForYear(feature) {
    if (feature.properties?.displayColor && feature.properties?.displayDebut <= pendingYear) {
        return feature.properties.displayColor;
    }

    const country = bestMapCountryName(feature);
    const debutYear = countryDebut.get(country);

    return debutYear <= pendingYear ? countryColor.get(country) : "#e7edf2";
}

function drawCountries(countries) {
    projection.fitExtent([[100, 20], [width - 100, height - 200]], { type: "Sphere" });

    svg.append("g")
        .attr("class", "countries-layer")
        .selectAll("path")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", worldMap)
        .attr("fill", "#e7edf2")
        .attr("stroke", "#6f7d89")
        .attr("stroke-width", 0.52);

    svg.append("g").attr("class", "context-circuit-layer");
    svg.append("g").attr("class", "current-race-layer");
}

function updateCountryColors() {
    svg.selectAll(".country")
        .transition()
        .duration(400)
        .attr("fill", countryFillForYear)
}

export function testMap() {
    d3.json("data/custom.geo.json")
        .then(mapData => {
            const countries = mapFeaturesFromGeo(mapData);

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
    updateCountryColors();

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
