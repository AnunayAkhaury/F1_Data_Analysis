const f1Eras = [
    {
        id: "european-origins",
        label: "European Origins",
        shortLabel: "1950-69",
        start: 1950,
        end: 1969,
        note: "The calendar is still built around European circuits."
    },
    {
        id: "early-global-reach",
        label: "Early Global Reach",
        shortLabel: "1970-89",
        start: 1970,
        end: 1989,
        note: "More races outside Europe become part of the season rhythm."
    },
    {
        id: "commercial-expansion",
        label: "Commercial Expansion",
        shortLabel: "1990-09",
        start: 1990,
        end: 2009,
        note: "The calendar becomes more internationally distributed."
    },
    {
        id: "modern-global-calendar",
        label: "Modern Global Calendar",
        shortLabel: "2010-24",
        start: 2010,
        end: 2024,
        note: "Asia, the Middle East, and the Americas are regular parts of the schedule."
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
    width: 1800,
    height: 96,
    margin: { top: 16, right: 110, bottom: 30, left: 110 }
};

const timelineState = {
    ready: false,
    summaries: new Map(),
    pendingScene: null,
    activeEra: "european-origins"
};

function eraForYear(year) {
    return f1Eras.find(era => year >= era.start && year <= era.end) ?? f1Eras[0];
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
                circuitName: circuit.name,
                country: circuit.country,
                region: countryRegion.get(circuit.country) ?? "Other"
            };
        })
        .filter(Boolean);
}

function summarizeByEra(calendarRows) {
    return new Map(f1Eras.map(era => {
        const eraRows = calendarRows.filter(row => row.era === era.id);
        const regionCounts = countBlankRegions();

        for (const row of eraRows) {
            if (regionCounts[row.region] !== undefined) {
                regionCounts[row.region] += 1;
            }
        }

        return [era.id, {
            ...era,
            total: eraRows.length,
            regions: regionCounts
        }];
    }));
}

function chooseEra(sceneInfo) {
    if (sceneInfo?.activeEra) {
        return sceneInfo.activeEra;
    }

    if (sceneInfo?.mapYear) {
        return eraForYear(sceneInfo.mapYear).id;
    }

    return timelineState.activeEra;
}

function drawTimelineShell() {
    const holder = d3.select("#continent-timeline")
        .classed("planned-chart", false)
        .classed("era-timeline-card", true);

    holder.selectAll("*").remove();

    // Build the timeline panel inside the placeholder from index.html.
    holder.append("p")
        .attr("class", "era-kicker")
        .text("Calendar timeline");

    holder.append("svg")
        .attr("class", "era-timeline-svg")
        .attr("viewBox", `0 0 ${timelineBox.width} ${timelineBox.height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    holder.append("div")
        .attr("class", "era-summary");
}

function drawTimelineMarks() {
    const svg = d3.select(".era-timeline-svg");
    const innerLeft = timelineBox.margin.left;
    const innerRight = timelineBox.width - timelineBox.margin.right;
    const yTrack = 40;
    const xEra = d3.scalePoint()
        .domain(f1Eras.map(era => era.id))
        .range([innerLeft, innerRight])
        .padding(0.45);

    // Draw the baseline that makes the four eras read as one continuous time story.
    svg.append("line")
        .attr("class", "era-track")
        .attr("x1", innerLeft)
        .attr("x2", innerRight)
        .attr("y1", yTrack)
        .attr("y2", yTrack);

    // Add one timeline node for each era so scroll steps can highlight the active period.
    const eraGroup = svg.selectAll(".era-node")
        .data(f1Eras)
        .join("g")
        .attr("class", "era-node")
        .attr("transform", era => `translate(${xEra(era.id)},${yTrack})`)
        .on("click", (event, era) => {
            window.dispatchEvent(new CustomEvent("f1-era-change", {
                detail: {
                    activeEra: era.id,
                    mapYear: era.end
                }
            }));
        });

    eraGroup.append("circle")
        .attr("r", 8)
        .attr("fill", "#ffffff");

    eraGroup.append("text")
        .attr("class", "era-year-label")
        .attr("y", 28)
        .attr("text-anchor", "middle")
        .text(era => era.shortLabel);

    eraGroup.append("text")
        .attr("class", "era-name-label")
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .text(era => era.label);
}

function updateSummary(summary) {
    const rows = regionNames.map(region => ({
        region,
        races: summary.regions[region],
        share: summary.total ? summary.regions[region] / summary.total : 0
    }));

    const summaryBox = d3.select(".era-summary");

    // Update the short text summary for the era currently connected to the map.
    summaryBox.selectAll(".era-summary-heading")
        .data([summary])
        .join("div")
        .attr("class", "era-summary-heading")
        .html(d => `
            <strong>${d.label}</strong>
            <span>${d.start}-${d.end} | ${d.total} races</span>
        `);

    summaryBox.selectAll(".era-summary-note")
        .data([summary])
        .join("p")
        .attr("class", "era-summary-note")
        .text(d => d.note);

    const rowJoin = summaryBox.selectAll(".region-row")
        .data(rows, d => d.region)
        .join(
            enter => {
                const row = enter.append("div").attr("class", "region-row");

                // Each region row gets a dot, label, bar, and number so the summary stays compact.
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

    rowJoin.select(".region-bar")
        .transition()
        .duration(450)
        .ease(d3.easeCubicOut)
        .style("width", d => `${Math.max(2, d.share * 100)}%`);

    rowJoin.select(".region-count")
        .text(d => `${d.races}`);
}

export async function drawContinentTimeline() {
    drawTimelineShell();
    drawTimelineMarks();

    const [races, circuits] = await Promise.all([
        d3.csv("data/races.csv", d3.autoType),
        d3.csv("data/circuits.csv", d3.autoType)
    ]);

    const calendarRows = cleanRaceCalendar(races, circuits);
    timelineState.summaries = summarizeByEra(calendarRows);
    timelineState.ready = true;

    updateContinentTimeline(timelineState.pendingScene ?? { activeEra: timelineState.activeEra });
}

export function updateContinentTimeline(sceneInfo = {}) {
    timelineState.pendingScene = sceneInfo;

    if (!timelineState.ready) return;

    const activeEra = chooseEra(sceneInfo);
    const summary = timelineState.summaries.get(activeEra) ?? timelineState.summaries.get("european-origins");
    timelineState.activeEra = summary.id;

    d3.selectAll(".era-node")
        .classed("is-active", era => era.id === summary.id)
        .classed("is-muted", era => era.id !== summary.id)
        .select("circle")
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("r", era => era.id === summary.id ? 11 : 8);

    updateSummary(summary);
}
