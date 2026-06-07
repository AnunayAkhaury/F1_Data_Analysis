const f1Eras = [
    {
        id: "f1-origins",
        label: "The Beginning",
        shortLabel: "1950",
        start: 1950,
        end: 1950,
        note: "F1 begins"
    },
    {
        id: "sponsorship-era",
        label: "Sponsorships",
        shortLabel: "1968",
        start: 1968,
        end: 1971,
        note: "Commercial racing begins"
    },
    {
        id: "broadcast-fisa-foca",
        label: "Broadcasting",
        shortLabel: "1970",
        start: 1970,
        end: 1976,
        note: "Commercial broadcasting begins",
        labelOffset: -72,
        labelBar: "|"
    },
    {
        id: "global-expansion",
        label: "Global Expansion",
        shortLabel: "1976",
        start: 1976,
        end: 1987,
        note: "More circuits around the world"
    },
    {
        id: "commercial-boom",
        label: "Commercial Boom",
        shortLabel: "1987",
        start: 1987,
        end: 1990,
        note: "Introduction of satellite TV"
    },
    {
        id: "ecclestone-era",
        label: "The Media Era",
        shortLabel: "1990",
        start: 1990,
        end: 1999,
        note: "Commercial control centralized to FOCA",
        labelOffset: -72,
        labelBar: "|"
    },
    {
        id: "new-markets-expansion",
        label: "New Markets Expansion",
        shortLabel: "1999",
        start: 1999,
        end: 2008,
        note: "Races in China, Bahrain, Malaysia"
    },
    {
        id: "modern-race-design",
        label: "Modern Race Design",
        shortLabel: "2008",
        start: 2008,
        end: 2017,
        note: "First night race in Singapore"
    },
    {
        id: "digital-era",
        label: "The Digital Era",
        shortLabel: "2017",
        start: 2017,
        end: 2024,
        note: "Liberty Media takes over"
    }
];

const regionNames = ["Europe", "Americas", "Asia", "Middle East", "Oceania", "Africa"];

const regionPaint = new Map([
    ["Europe", "#3867a8"],
    ["Americas", "#2a9d8f"],
    ["Asia", "#e9a227"],
    ["Middle East", "#c85c54"],
    ["Oceania", "#6c63b8"],
    ["Africa", "#6f7d4f"]
]);

const countryRegion = new Map([
    ["Argentina", "Americas"],
    ["Australia", "Oceania"],
    ["Austria", "Europe"],
    ["Azerbaijan", "Asia"],
    ["Bahrain", "Middle East"],
    ["Belgium", "Europe"],
    ["Brazil", "Americas"],
    ["Canada", "Americas"],
    ["China", "Asia"],
    ["France", "Europe"],
    ["Germany", "Europe"],
    ["Hungary", "Europe"],
    ["India", "Asia"],
    ["Italy", "Europe"],
    ["Japan", "Asia"],
    ["Korea", "Asia"],
    ["Malaysia", "Asia"],
    ["Mexico", "Americas"],
    ["Monaco", "Europe"],
    ["Morocco", "Africa"],
    ["Netherlands", "Europe"],
    ["Portugal", "Europe"],
    ["Qatar", "Middle East"],
    ["Russia", "Europe"],
    ["Saudi Arabia", "Middle East"],
    ["Singapore", "Asia"],
    ["South Africa", "Africa"],
    ["Spain", "Europe"],
    ["Sweden", "Europe"],
    ["Switzerland", "Europe"],
    ["Turkey", "Europe"],
    ["UAE", "Middle East"],
    ["UK", "Europe"],
    ["USA", "Americas"],
    ["United States", "Americas"]
]);

const timelineBox = {
    width: 2200,
    height: 160,
    margin: { top: 38, right: 70, bottom: 38, left: 70 }
};

const timelineState = {
    ready: false,
    summaries: new Map(),
    pendingScene: null,
    year: 1950,
    summaryYear: null,
    labelYear: null,
    activeEraId: null,
    playing: false,
    playTimer: null
};

const clampTimelineYear = year => {
    const cleanYear = Number(year);

    if (!Number.isFinite(cleanYear)) return 1950;

    return Math.max(1950, Math.min(2024, cleanYear));
};

const seasonTimelineYear = year => Math.round(clampTimelineYear(year));

function eraForYear(year) {
    const cleanYear = seasonTimelineYear(year);

    return f1Eras.find(era => cleanYear >= era.start && cleanYear <= era.end) ?? f1Eras[0];
}

function countBlankRegions() {
    return Object.fromEntries(regionNames.map(region => [region, 0]));
}

function cleanRaceCalendar(races, circuits) {
    const circuitById = new Map(circuits.map(circuit => [circuit.circuitId, circuit]));

    return races
        .map(race => {
            const circuit = circuitById.get(race.circuitId);

            if (!circuit) return null;

            const era = eraForYear(race.year);

            return {
                year: race.year,
                era: era.id,
                raceName: race.name,
                circuitId: race.circuitId,
                circuitName: circuit.name,
                country: circuit.country,
                region: countryRegion.get(circuit.country) ?? "Other"
            };
        })
        .filter(row => row && row.year >= 1950 && row.year <= 2024);
}

function summarizeByYear(calendarRows) {
    return new Map(d3.range(1950, 2025).map(year => {
        const seasonRows = calendarRows.filter(row => row.year === year);
        const earlierRows = calendarRows.filter(row => row.year <= year);
        const regionCounts = countBlankRegions();

        for (const row of seasonRows) {
            if (regionCounts[row.region] !== undefined) {
                regionCounts[row.region] += 1;
            }
        }

        return [year, {
            year,
            era: eraForYear(year),
            total: seasonRows.length,
            regions: regionCounts,
            cumulativeCircuits: new Set(earlierRows.map(row => row.circuitId)).size,
            activeRegions: regionNames.filter(region => regionCounts[region] > 0).length
        }];
    }));
}

function yearFromScene(sceneInfo) {
    return clampTimelineYear(sceneInfo?.mapYear ?? sceneInfo?.startYear ?? sceneInfo?.endYear ?? timelineState.year);
}

function drawTimelineShell() {
    const holder = d3.select("#continent-timeline")
        .classed("planned-chart", false)
        .classed("era-timeline-card", true);

    holder.selectAll("*").remove();

    const topRow = holder.append("div")
        .attr("class", "timeline-top-row");

    topRow.append("p")
        .attr("class", "era-kicker")
        .text("Calendar timeline");
    
    const controls = topRow.append("div")
        .attr("class", "timeline-controls");

    controls.append("div")
        .attr("class", "timeline-year-pill")
        .text("1950 season");
    
    controls.append("button")
        .attr("class", "timeline-play-button")
        .text("▶ Play")
        .on("click", toggleTimelinePlayback);

    holder.append("svg")
        .attr("class", "era-timeline-svg")
        .attr("viewBox", `0 0 ${timelineBox.width} ${timelineBox.height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    holder.append("div")
        .attr("class", "era-summary");
}

function dispatchYear(year, animate = true) {
    const cleanYear = clampTimelineYear(year);
    const era = eraForYear(cleanYear);

    window.dispatchEvent(new CustomEvent("f1-year-change", {
        detail: {
            activeEra: era.id,
            mapYear: cleanYear,
            animate
        }
    }));
}

function toggleTimelinePlayback() {
    if (timelineState.playing) {
        stopTimelinePlayback();
    } else {
        startTimelinePlayback();
    }
}

function startTimelinePlayback() {
    timelineState.playing = true;
    d3.select(".timeline-play-button")
        .text("❚❚ Pause");
    let currentYear = seasonTimelineYear(timelineState.year);
    timelineState.playTimer = setInterval(() => {
        currentYear += 1;
        if (currentYear > 2024) {
            stopTimelinePlayback();
            return;
        }
        dispatchYear(currentYear, true);
    }, 300);
}

function stopTimelinePlayback() {
    timelineState.playing = false;
    clearInterval(timelineState.playTimer);
    timelineState.playTimer = null;
    d3.select(".timeline-play-button")
        .text("▶ Play");
}

function drawTimelineMarks() {
    const svg = d3.select(".era-timeline-svg");
    const innerLeft = timelineBox.margin.left;
    const innerRight = timelineBox.width - timelineBox.margin.right;
    const yTrack = 84;
    const xYear = d3.scaleLinear()
        .domain([1950, 2024])
        .range([innerLeft, innerRight])
        .clamp(true);
    const decadeTicks = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2024];

    svg.append("g")
        .attr("class", "era-band-layer")
        .selectAll("rect")
        .data(f1Eras)
        .join("rect")
        .attr("class", "era-band")
        .attr("x", era => xYear(era.start))
        .attr("y", yTrack - 24)
        .attr("width", era => Math.max(8, xYear(era.end) - xYear(era.start)))
        .attr("height", 48)
        .attr("rx", 24);

    svg.append("line")
        .attr("class", "era-track")
        .attr("x1", innerLeft)
        .attr("x2", innerRight)
        .attr("y1", yTrack)
        .attr("y2", yTrack);

    svg.append("line")
        .attr("class", "era-progress")
        .attr("x1", innerLeft)
        .attr("x2", innerLeft)
        .attr("y1", yTrack)
        .attr("y2", yTrack);

    svg.append("g")
        .attr("class", "timeline-tick-layer")
        .selectAll("g")
        .data(decadeTicks)
        .join("g")
        .attr("class", "timeline-tick")
        .attr("transform", year => `translate(${xYear(year)},${yTrack})`)
        .call(group => {
            group.append("line")
                .attr("y1", 22)
                .attr("y2", 34);

            group.append("text")
                .attr("y", 56)
                .attr("text-anchor", "middle")
                .text(year => year);
        });

    const eraGroup = svg.append("g")
        .attr("class", "era-checkpoint-layer")
        .selectAll(".era-node")
        .data(f1Eras)
        .join("g")
        .attr("class", "era-node")
        .attr("transform", era => `translate(${xYear(era.start)},${yTrack})`)
        .on("click", (event, era) => dispatchYear(era.start, true));

    eraGroup.append("circle")
        .attr("r", 10)
        .attr("fill", "#ffffff");

    eraGroup.append("text")
        .attr("class", "era-name-label")
        .attr("y", era => era.labelOffset ?? -48)
        .attr("text-anchor", "middle")
        .text(era => era.label);

    eraGroup.append("text")
        .attr("class", "era-bar")
        .attr("y", -46)
        .attr("text-anchor", "middle")
        .text(era => era.labelBar ?? "")

    eraGroup.append("text")
        .attr("class", "era-year-label")
        .attr("y", -24)
        .attr("text-anchor", "middle")
        .text(era => era.shortLabel);

    const handle = svg.append("g")
        .attr("class", "current-year-handle")
        .attr("transform", `translate(${innerLeft},${yTrack})`);

    handle.append("line")
        .attr("class", "current-year-rule")
        .attr("y1", -50)
        .attr("y2", 42);

    handle.append("circle")
        .attr("r", 15);

    handle.append("rect")
        .attr("x", -42)
        .attr("y", -78)
        .attr("width", 84)
        .attr("height", 30)
        .attr("rx", 15);

    handle.append("text")
        .attr("class", "current-year-label")
        .attr("y", -57)
        .attr("text-anchor", "middle")
        .text("1950");

    const moveToPointerYear = (event, animate) => {
        const [pointerX] = d3.pointer(event, svg.node());
        stopTimelinePlayback();
        dispatchYear(xYear.invert(pointerX), animate);
    };

    svg.append("rect")
        .attr("class", "timeline-hitbox")
        .attr("x", innerLeft)
        .attr("y", yTrack - 48)
        .attr("width", innerRight - innerLeft)
        .attr("height", 96)
        .on("click", event => moveToPointerYear(event, true))
        .call(d3.drag()
            .on("start", event => moveToPointerYear(event, false))
            .on("drag", event => moveToPointerYear(event, false)));

    timelineState.xYear = xYear;
    timelineState.yTrack = yTrack;
}

function updateSummary(summary, animate = false) {
    const rows = regionNames.map(region => ({
        region,
        races: summary.regions[region],
        share: summary.total ? summary.regions[region] / summary.total : 0
    }));

    const summaryBox = d3.select(".era-summary");

    summaryBox.selectAll(".era-summary-heading")
        .data([summary])
        .join("div")
        .attr("class", "era-summary-heading")
        .html(d => `
            <strong>${d.year} ${d.era.label}</strong>
            <span>${d.total} season races | ${d.cumulativeCircuits} circuits introduced</span>
        `);

    summaryBox.selectAll(".era-summary-note")
        .data([summary])
        .join("p")
        .attr("class", "era-summary-note")
        .text(d => d.era.note);

    const rowJoin = summaryBox.selectAll(".region-row")
        .data(rows, d => d.region)
        .join(
            enter => {
                const row = enter.append("div").attr("class", "region-row");

                row.append("span")
                    .attr("class", "region-dot")
                    .style("background-color", d => regionPaint.get(d.region));

                row.append("span")
                    .attr("class", "region-label")
                    .text(d => d.region);

                row.append("span")
                    .attr("class", "region-bar-wrap")
                    .append("span")
                    .attr("class", "region-bar")
                    .style("background-color", d => regionPaint.get(d.region))
                    .style("width", "0%");

                row.append("span")
                    .attr("class", "region-count");

                return row;
            },
            update => update
        );

    rowJoin.classed("is-empty", d => d.races === 0);

    const bars = rowJoin.select(".region-bar")
        .interrupt();

    if (animate) {
        bars.transition()
            .duration(280)
            .ease(d3.easeCubicOut)
            .style("width", d => `${d.share * 100}%`);
    } else {
        bars.style("width", d => `${d.share * 100}%`);
    }

    rowJoin.select(".region-count")
        .text(d => d.races);
}

export async function drawContinentTimeline() {
    drawTimelineShell();
    drawTimelineMarks();

    const [races, circuits] = await Promise.all([
        d3.csv("data/races.csv", d3.autoType),
        d3.csv("data/circuits.csv", d3.autoType)
    ]);

    const calendarRows = cleanRaceCalendar(races, circuits);
    timelineState.summaries = summarizeByYear(calendarRows);
    timelineState.ready = true;

    updateContinentTimeline(timelineState.pendingScene ?? { mapYear: timelineState.year });
}

export function updateContinentTimeline(sceneInfo = {}) {
    timelineState.pendingScene = sceneInfo;

    if (!timelineState.ready) return;

    const activeYear = yearFromScene(sceneInfo);
    const activeSeason = seasonTimelineYear(activeYear);
    const activeEra = eraForYear(activeSeason);
    const summary = timelineState.summaries.get(activeSeason) ?? timelineState.summaries.get(1950);
    const xYear = timelineState.xYear;
    const handleX = xYear(activeYear);
    const shouldAnimate = sceneInfo.animate === true;

    timelineState.year = activeYear;

    if (timelineState.labelYear !== activeSeason) {
        timelineState.labelYear = activeSeason;

        d3.select(".timeline-year-pill")
            .text(`${activeSeason} season`);

        d3.select(".current-year-label")
            .text(activeSeason);
    }

    const progressLine = d3.select(".era-progress").interrupt();
    const yearHandle = d3.select(".current-year-handle").interrupt();

    if (shouldAnimate) {
        progressLine.transition()
            .duration(420)
            .ease(d3.easeCubicOut)
            .attr("x2", handleX);

        yearHandle.transition()
            .duration(420)
            .ease(d3.easeCubicOut)
            .attr("transform", `translate(${handleX},${timelineState.yTrack})`);
    } else {
        progressLine.attr("x2", handleX);
        yearHandle.attr("transform", `translate(${handleX},${timelineState.yTrack})`);
    }

    const eraChanged = timelineState.activeEraId !== activeEra.id;

    if (eraChanged || shouldAnimate) {
        timelineState.activeEraId = activeEra.id;

        const eraCircles = d3.selectAll(".era-node")
            .classed("is-active", era => era.id === activeEra.id)
            .classed("is-muted", era => era.id !== activeEra.id)
            .select("circle")
            .interrupt();

        if (shouldAnimate || eraChanged) {
            eraCircles.transition()
                .duration(220)
                .ease(d3.easeCubicOut)
                .attr("r", era => era.id === activeEra.id ? 14 : 10);
        } else {
            eraCircles.attr("r", era => era.id === activeEra.id ? 14 : 10);
        }

        d3.selectAll(".era-band")
            .classed("is-active", era => era.id === activeEra.id);
    }

    if (timelineState.summaryYear !== activeSeason || shouldAnimate) {
        timelineState.summaryYear = activeSeason;
        updateSummary(summary, shouldAnimate);
    }
}
