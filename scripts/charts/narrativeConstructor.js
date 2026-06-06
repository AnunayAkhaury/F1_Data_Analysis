const COLORS = {
    "Ferrari": "#dc0000", 
    "Williams": "#005aff",
    "Mercedes": "#00d2be", 
    "Red Bull": "#3671c6", 
    "Tyrrell": "#2e8b57", 
    "Matra": "#1565c0", 
    "Maserati": "#8b5e9c", 
    "Alfa Romeo": "#b22222",
};
const GRID_COLOR = "#e2eaf0";
const LABEL_COLOR = "#8a9baa";
const LABEL_SIZE = "10px";
const MARKER_COLOR = "#1f2933";
const MARKER_WIDTH = 1.5;
const MARKER_DASH = "3 2";


// Single graph dimensions so both line + stream is the same
const SW = 480, SH = 205, SMT = 50, SMR = 16, SMB = 28, SML = 44;

const siW = SW - SML - SMR;
const siH = SH - SMT - SMB;

const panelState = {};

export async function drawConstructorNarrative() {
    const root = d3.select("#constructor-narrative-stream");
    if (root.empty()) return;
    root.html("");

    const data = await d3.json('data/constructorNarrativeData.json');

    data.forEach((era, index) => {
        const years = Object.keys(era.years).sort();
        let focusTeams = era.focusTeams;
        if (!focusTeams || focusTeams.length === 0) {
        const winners = years.map(year => {
            const standings = Object.entries(
                era.years[year].standings
            );
            const sortedStandings = standings.sort(
                (a, b) => b[1] - a[1]
            );
            const won = sortedStandings[0][0];
            return won
        });
        const counts = {};
        winners.forEach(t => counts[t] = (counts[t] || 0) + 1);
        focusTeams = [Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0]];
        }

        const eraState = {
            panelIndex: index,
            label: era.label,
            focusTeams: focusTeams,
            focusColor: COLORS[focusTeams[0]] || "#dc0000",
            windowStart: parseInt(years[0]),
            windowEnd: parseInt(years[years.length - 1]),
            pct: years.map(y => {
                const s = era.years[y].standings;
                const total = Object.values(s).reduce((a, b) => a + b, 0);
                const driverTarget = era.label.includes("Fangio") ? "Fangio" : 
                                     era.label.includes("Stewart") ? "Stewart" : null;

                // Handle different logic between constructor + indiv drivers
                if (!driverTarget) {
                    const focus = focusTeams.reduce((sum, t) => sum + (s[t] || 0), 0);
                    return [parseInt(y), total > 0 ? focus / total : 0];
                } else {
                    const currentTeam = Object.keys(era.years[y].drivers).find(t => 
                        era.years[y].drivers[t].some(s => s.includes(driverTarget))
                    );
                    const focus = currentTeam ? (s[currentTeam] || 0) : 0;
                    return [parseInt(y), total > 0 ? focus / total : 0];
                }
            }),
            rankData: {},
            yearStats: era.years
        };
        years.forEach(y => {
            const sortedStandings = Object.entries(era.years[y].standings)
                .sort((a, b) => b[1] - a[1]);
            //Only grab 4 for the line chart for constructors
            sortedStandings.forEach(([team, points], idx) => {
                if (idx < 4) { 
                    if (!eraState.rankData[team]) eraState.rankData[team] = {};
                    eraState.rankData[team][parseInt(y)] = idx + 1;
                }
            });
        });

        // Controls cn-panel
        const wrap = root.append("div")
            .attr("class", "cn-panel")
            .attr("data-panel", index)
            .style("display", index === 0 ? "block" : "none");
        
        wrap.append("h3")
            .attr("class", "d3-era-title")
            .style("color", eraState.focusColor)
            .style("border-color", 'black')
            .style("font-size", "24px")
            .text(era.label);

        const svg1 = wrap.append("svg")
            .attr("viewBox", `0 0 ${SW} ${SH}`)
            .style("width", "100%");

        const svg2 = wrap.append("svg")
            .attr("viewBox", `0 0 ${SW} ${SH}`)
            .style("width", "100%")
            .style("margin-top", "30px");

        /** 
        const statBox = wrap.append("div")
            .attr("class", "cn-stat-box")
            .style("margin-top", "8px")
            .style("background", "#ffffff")
            .style("border", "1px solid #d5e8f0")
            .style("border-radius", "10px")
            .style("padding", "10px 14px"); */

        const { xScale: sx, streamMarker: sm } = buildStreamChart(svg1, eraState);
        const { xScale: bx, lineMarker: bm } = buildLineChart(svg2, eraState);
        
        panelState[index] = {
            era: eraState,
            streamX: sx,
            streamMarker: sm,
            lineX: bx,
            lineMarker: bm,
            //statBox
        };
    });
}

function buildStreamChart(svgSel, era) {
    const x = d3.scaleLinear()
        .domain([era.windowStart, era.windowEnd])
        .range([0, siW]);

    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([siH, 0]);

    const g = svgSel.append("g")
        .attr("transform", `translate(${SML},${SMT})`);

    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", siW)
        .attr("height", siH)
        .attr("fill", "#edf3f8")
        .attr("rx", 3);

    g.append("path")
        .datum(era.pct)
        .attr("fill", era.focusColor)
        .attr("opacity", 0.85)
        .attr("d",
            d3.area()
                .x(d => x(d[0]))
                .y0(siH)
                .y1(d => y(d[1]))
                .curve(d3.curveCatmullRom)
        );

    g.append("line")
        .attr("x1", 0)
        .attr("x2", siW)
        .attr("y1", y(0.5))
        .attr("y2", y(0.5))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3")
        .attr("opacity", 0.6);

    g.append("g")
        .call(
            d3.axisLeft(y)
                .tickValues([0, 0.5, 1])
                .tickFormat(d => `${Math.round(d * 100)}%`)
        )
        .call(ax => ax.select(".domain").remove())
        .call(ax => ax.selectAll("text")
            .attr("fill", "#8a9baa")
            .attr("font-size", "11px"));

    const years = d3.range(
        era.windowStart,
        era.windowEnd + 1
    );

    g.append("g")
        .attr("transform", `translate(0,${siH})`)
        .call(
            d3.axisBottom(x)
                .tickValues(years)
                .tickFormat(d3.format("d"))
        )
        .call(ax => ax.selectAll("text")
            .attr("fill", "#8a9baa")
            .attr("font-size", "10px"));

    g.append("text")
        .attr("x", -20)
        .attr("y", -20)
        .attr("fill", "#000000")
        .attr("font-size", "18px")
        .attr("font-weight", "700")
        .text("Percentage of Points Per Season");


    const marker = g.append("line")
        .attr("y1", 0)
        .attr("y2", siH)
        .attr("stroke", MARKER_COLOR)
        .attr("stroke-width", MARKER_WIDTH)
        .attr("stroke-dasharray", MARKER_DASH)
        .attr("opacity", 0);

    return {
        xScale: x,
        streamMarker: marker
    };
}

function buildLineChart(svgSel, era) {
    const years = d3.range(era.windowStart, era.windowEnd + 1);
    const maxRank = 4;
    const x = d3.scaleLinear()
        .domain([era.windowStart, era.windowEnd])
        .range([0, siW]);
    const y = d3.scalePoint()
        .domain(d3.range(1, maxRank + 1))
        .range([0, siH])
        .padding(0.3);
    const g = svgSel.append("g")
        .attr("transform", `translate(${SML},${SMT})`);

    d3.range(1, maxRank + 1)
        .forEach(rank => {
            const yPos = y(rank);
            drawGridLine(yPos);
            drawRankLabel(rank, yPos);
    });

    function drawGridLine(yPos) {
        g.append("line")
            .attr("x1", 0)
            .attr("x2", siW)
            .attr("y1", yPos)
            .attr("y2", yPos)
            .attr("stroke", GRID_COLOR)
            .attr("stroke-width", 1);
    }

    function drawRankLabel(rank, yPos) {
        g.append("text")
            .attr("x", -5)
            .attr("y", yPos)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("fill", LABEL_COLOR)
            .attr("font-size", LABEL_SIZE)
            .text(`P${rank}`);
    }
   const xAxis = d3.axisBottom(x)
    .tickValues(years)
    .tickFormat(d3.format("d"))
    .tickSize(3);

    const axisGroup = g.append("g")
        .attr("transform", `translate(0,${siH})`);

    axisGroup.call(xAxis);

    axisGroup.select(".domain")
        .attr("stroke", "#c8d8e4");

    axisGroup.selectAll("text")
        .attr("fill", "#8a9baa")
        .attr("font-size", "10px");

    g.append("text")
        .attr("x", -20)
        .attr("y", -20)
        .attr("fill", "#000000")
        .attr("font-size", "18px")
        .attr("font-weight", "700")
        .text("Championship position");

    // Driver vs Constructor
    const driverName = era.label.includes("Fangio") ? "Fangio" : era.label.includes("Stewart") ? "Stewart" : null;
    // Different logic to show different teams
    if (driverName) {
        const championshipYears = { "Fangio": [1951, 1954, 1955, 1956, 1957], "Stewart": [1969, 1971, 1973] };
        const driverPath = years.map(yr => {
            const yData = era.yearStats[yr];
            if (!yData) return null;
            const team = Object.keys(yData.drivers)
                .find(t => yData.drivers[t]
                    .some(s => s
                        .includes(driverName)));
            const isChamp = championshipYears[driverName]?.includes(yr);
            const rank = isChamp ? 1 : (era.rankData[team]?.[yr] || 4);
            return team ? { year: yr, team: team, rank: rank } : null;
        }).filter(d => d && d.rank <= maxRank);

        g.append("path").datum(driverPath)
            .attr("fill", "none")
                .attr("stroke", era.focusColor)
                .attr("stroke-width", 3)
                .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.rank)).
                curve(d3.curveMonotoneX));
        driverPath.forEach(pt => {
            g.append("circle")
            .attr("cx", x(pt.year))
            .attr("cy", y(pt.rank))
            .attr("r", 6)
            .attr("fill", COLORS[pt.team] || "#aaa").attr("stroke", "#fff").attr("stroke-width", 2);
        });
    } else {
        // Just for constructors
        Object.entries(era.rankData).forEach(([team, yearRanks]) => {
        if (!era.focusTeams.includes(team)) {
            return;
            }
        const pts = years
            .map(year => ({
                year: year,
                rank: yearRanks[year] ?? null
            }))
            .filter(point =>
                point.rank !== null &&
                point.rank <= maxRank
            );
        if (pts.length === 0) {
            return;
        }
        const lineGenerator = d3.line()
            .x(point => x(point.year))
            .y(point => y(point.rank))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(pts)
            .attr("fill", "none")
            .attr("stroke", era.focusColor)
            .attr("stroke-width", 3)
            .attr("d", lineGenerator);

        pts.forEach(point => {
            g.append("circle")
            .attr("cx", x(point.year))
            .attr("cy", y(point.rank))
            .attr("r", 5)
            .attr("fill", era.focusColor)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
            });
        });
    }

    const marker = g.append("line")
        .attr("y1", 0)
        .attr("y2", siH)
        .attr("stroke", MARKER_COLOR)
        .attr("stroke-width", MARKER_WIDTH)
        .attr("stroke-dasharray", MARKER_DASH)
        .attr("opacity", 0);
    return { xScale: x, lineMarker: marker };
}


export function updateConstructorNarrative(panelIndex) {
    d3.selectAll(".cn-panel").style("display", (d, i) => i === panelIndex ? "block" : "none");
}


export function updatePanelYear(panelIndex, year) {

    const state = panelState[panelIndex];
    if (!state) return;

    state.streamMarker
        .attr("x1", state.streamX(year))
        .attr("x2", state.streamX(year))
        .attr("opacity", 1);

    state.lineMarker
        .attr("x1", state.lineX(year))
        .attr("x2", state.lineX(year))
        .attr("opacity", 1);

        /** 
    const note = yearData.note ?? `${champion} led the constructors' championship with ${championPts} points.`;
    */
}