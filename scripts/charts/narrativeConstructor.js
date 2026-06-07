const constructorHueBook = {
    "Ferrari": "#e10600",
    "Williams": "#1064d8",
    "Mercedes": "#2a9d8f",
    "Red Bull": "#7669ea",
    "Tyrrell": "#79a415",
    "Matra": "#1565c0",
    "Maserati": "#8b5e9c",
    "Alfa Romeo": "#b94be8",
};
const GRID_COLOR = "#333333";
const LABEL_COLOR = "#cccccc";
const LABEL_SIZE = "10px";
const MARKER_COLOR = "#86898b";
const MARKER_WIDTH = 1.5;
const MARKER_DASH = "4 3";

// for button text panels
const ERA_MILESTONES = [
    // 0: Fangio
    [{ year: 1951, text: "<strong>Drivers & Points:</strong><ul><li>Juan Manuel Fangio (31 Points) - Alfa Romeo</li><li>Giuseppe Farina (19 Points) - Alfa Romeo</li></ul>Alfa Romeo's 159 Alfetta was a prewar design, but dominated the inaugural championship years." }, 
    { year: 1952, text: "<strong>Drivers & Points:</strong><ul><li>Alberto Ascari (36 Points) - Ferrari</li><li>Nino Farina (24 Points) - Ferrari</li></ul>With Ferrari dominant, F1 temporarily switched to Formula 2 rules to save the series, showcasing the fragility of constructor stability." }, 
    { year: 1954, text: "<strong>Drivers & Points:</strong><ul><li>Juan Manuel Fangio (42 Points) - Mercedes/Maserati</li><li>Karl Kling (12 Points) - Mercedes</li></ul>Fangio’s mid-season switch to Mercedes proved that driver adaptability was more important, as he won with two different teams in one year." }, 
    { year: 1957, text: "<strong>Drivers & Points:</strong><ul><li>Juan Manuel Fangio (40 Points) - Maserati</li><li>Stirling Moss (25 Points) - Vanwall</li></ul>Fangio’s Nurburgring drive remains the ultimate example of a driver overcoming a car deficit to secure a title." }],
    // 1: Stewart
    [{ year: 1969, text: "<strong>Drivers & Points:</strong><ul><li>Jackie Stewart (63 Points) - Matra</li><li>Jean-Pierre Beltoise (21 Points) - Matra</li></ul>Matra's win with the MS80 was the first time a nonBritish team dominated, signaling the beginning of international competition." }, 
    { year: 1970, text: "<strong>Drivers & Points:</strong><ul><li>Jochen Rindt (45 Points) - Lotus</li><li>Emerson Fittipaldi (12 Points) - Lotus</li></ul>The Lotus 72 introduced the sidepod radiator concept, which is still the fundamental design for every F1 car today." }, 
    { year: 1971, text: "<strong>Drivers & Points:</strong><ul><li>Jackie Stewart (62 Points) - Tyrrell</li><li>François Cevert (26 Points) - Tyrrell</li></ul>Tyrrell’s '003' car combined simple mechanics with Stewart's precision, showing that driver skill could shine much more." }, 
    { year: 1972, text: "<strong>Drivers & Points:</strong><ul><li>Emerson Fittipaldi (61 Points) - Lotus</li><li>Dave Walker (0 Points) - Lotus</li></ul>Fittipaldi became the youngest champion at the time, showing that the driver/car relationship was shifting toward younger talent." }, 
    { year: 1973, text: "<strong>Drivers & Points:</strong><ul><li>Jackie Stewart (71 Points) - Tyrrell</li><li>François Cevert (47 Points) - Tyrrell</li></ul>Stewart’s final championship was defined by his commitment to driver safety, which led to the first standardized medical protocols in F1." }],
    // 2: Williams
    [{ year: 1992, text: "<strong>Drivers & Points:</strong><ul><li>Nigel Mansell (108 Points)</li><li>Riccardo Patrese (56 Points)</li></ul>Williams' active suspension was so advanced that rivals were reportedly two seconds slower per lap purely on electronics." }, 
    { year: 1993, text: "<strong>Drivers & Points:</strong><ul><li>Alain Prost (99 Points)</li><li>Damon Hill (69 Points)</li></ul>The peak of the electronic era, where computer controlled hydraulics solved the porpoising effect that still effect modern F1." }, 
    { year: 1994, text: "<strong>Drivers & Points:</strong><ul><li>Damon Hill (91 Points)</li><li>David Coulthard (14 Points)</li><li>Ayrton Senna (6 Points)</li></ul>The FIA banned all driver aids, forcing a massive design reset for Williams." }, 
    { year: 1995, text: "<strong>Drivers & Points:</strong><ul><li>Damon Hill (69 Points)</li><li>David Coulthard (49 Points)</li></ul>One example where not having thier main racer meant losing. With Senna's absense William's Damon Hill unfortunately could win though they got second." }, 
    { year: 1997, text: "<strong>Drivers & Points:</strong><ul><li>Jacques Villeneuve (81 Points)</li><li>Heinz-Harald Frentzen (42 Points)</li></ul>Renault's withdrawal signaled the end of the factory-engine era for Williams, proving that constructor success is tethered to engine supply." }],
    // 3: Ferrari
    [{ year: 1999, text: "<strong>Drivers & Points:</strong><ul><li>Eddie Irvine (74 Points)</li><li>Michael Schumacher (44 Points)</li></ul>The start of the 'Schumacher Ferrari' project, which focused as much on pitcrew precision and data analysis as the car itself. Unfortunately Schumamer had a crash this year and stopped competing midway letting his second driver Irvine takeover. They did not win this year." }, 
    { year: 2002, text: "<strong>Drivers & Points:</strong><ul><li>Michael Schumacher (144 Points)</li><li>Rubens Barrichello (77 Points)</li></ul>Ferrari was so dominant they began to test for next year's car mid season. We can also see in the stream chart that it is the highest distribution of points they had in single season." }, 
    { year: 2003, text: "<strong>Drivers & Points:</strong><ul><li>Michael Schumacher (93 Points)</li><li>Rubens Barrichello (65 Points)</li></ul>A rule change forced cars to use the same tires for qualifying and racing, attempting to stop Ferrari's dominance." }, 
    { year: 2004, text: "<strong>Drivers & Points:</strong><ul><li>Michael Schumacher (148 Points)</li><li>Rubens Barrichello (114 Points)</li></ul>Schumacher won 13 of 18 races; this was the era that convinced the FIA that unlimited testing and budgets were destroying competition." }, 
    { year: 2005, text: "<strong>Drivers & Points:</strong><ul><li>Michael Schumacher (62 Points)</li><li>Rubens Barrichello (38 Points)</li></ul>Schumacher still raced in this year, but did not win. It can be seen that he fell to third with first place being Fernando Alonso who drove for Renault." }],
    // 4: Red Bull
    [{ year: 2010, text: "<strong>Drivers & Points:</strong><ul><li>Sebastian Vettel (256 Points)</li><li>Mark Webber (242 Points)</li></ul>The Red Bull RB6 utilized the Blown Diffuser, which used engine exhaust to create massive downforce. Sebastian Vettel and Mark Webber were the two representatives of this team and would be for the next 4 years. Additionally this was the year that the FIA decided to changed the points system in an attempt to ensure a champion would not be crowned too early." }, 
    { year: 2011, text: "<strong>Drivers & Points:</strong><ul><li>Sebastian Vettel (392 Points)</li><li>Mark Webber (258 Points)</li></ul>Despite the changes Redbull dominated so completely that this was one of the highest percentage of points that they had earned and clinching the title early despite the rules changes." }, 
    { year: 2012, text: "<strong>Drivers & Points:</strong><ul><li>Sebastian Vettel (281 Points)</li><li>Mark Webber (179 Points)</li></ul>The closest race of the era, where the design philosophy shifted from pure aero to engine map optimization. We can also see the effects of the new FIA points sytem change, unlike the last dominance era Red Bull never has that much more percentage of points." }, 
    { year: 2013, text: "<strong>Drivers & Points:</strong><ul><li>Sebastian Vettel (397 Points)</li><li>Mark Webber (199 Points)</li></ul>Vettel's dominance sparked the 'Jeep effect' where Red Bull was accused of traction control cheating due to engine mapping." }, 
    { year: 2014, text: "<strong>Drivers & Points:</strong><ul><li>Daniel Ricciardo (238 Points)</li><li>Sebastian Vettel (167 Points)</li></ul>After the hybrid regulation shift, Red Bull's inability to recover power parity exposed how dependent the competition is on a factory engine. Though they were still second Mercedes with their new engine absolutely outclassed the competition with 701 points compared to Red Bull Racing's 405. Sebastian Vettel was still the main racer but his second was Daniel Ricciardo." }],
    // 5: Mercedes
    [{ year: 2014, text: "<strong>Drivers & Points:</strong><ul><li>Lewis Hamilton (384 Points)</li><li>Nico Rosberg (317 Points)</li></ul>Mercedes’ unlike Red Bull was able to perfect the split-turbo engine design, giving them a cooling and power advantage that no rival caught for 8 years." }, 
    { year: 2016, text: "<strong>Drivers & Points:</strong><ul><li>Nico Rosberg (385 Points)</li><li>Lewis Hamilton (380 Points)</li></ul>The Nico Rosberg versus Lewis Hamilton rivalry created a conflict within the team, making internal engineering a priority." }, 
    { year: 2019, text: "<strong>Drivers & Points:</strong><ul><li>Lewis Hamilton (413 Points)</li><li>Valtteri Bottas (326 Points)</li></ul>Mercedes achieved 6 consecutive double titles, a level of constructor consistency that beat Ferrarri's." }, 
    { year: 2021, text: "<strong>Drivers & Points:</strong><ul><li>Lewis Hamilton (387.5 Points)</li><li>Valtteri Bottas (226 Points)</li></ul>The final showdown between regulation stability and aggressive design, leading to the massive 2022 overhaul to kill the Mercedes advantage." },
    { year: 2022, text: "<strong>Drivers & Points:</strong><ul><li>George Russell (275 Points)</li><li>Lewis Hamilton (240 Points)</li></ul>The massive 2022 overhaul of regulations kills the Mercedes's advantage. In this year, the drivers were Lewis Hamilton and George Russel. Their combined total was 515 compared to Red Bull's 759 and Ferrari's 554." }]
];


// Single graph dimensions so both line + stream are the same
const SW = 480, SH = 220, SMT = 50, SMR = 16, SMB = 55, SML = 44;

const siW = SW - SML - SMR;
const siH = SH - SMT - SMB;

//store the state of each era panel 
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
            focusColor: constructorHueBook[focusTeams[0]] || "#e10600",
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
        //populate rank data
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

        const wrap = root.append("div")
            .attr("class", "cn-panel")
            .attr("data-panel", index)
            .style("display", index === 0 ? "block" : "none");
        //wrap the title element 
        wrap.append("h3")
            .attr("class", "d3-era-title")
            .style("color", eraState.focusColor)
            .style("font-size", "32px")
            .text(era.label);

        const svg1 = wrap.append("svg")
            .attr("viewBox", `0 0 ${SW} ${SH}`)
            .style("width", "100%");

        const svg2 = wrap.append("svg")
            .attr("viewBox", `0 0 ${SW} ${SH}`)
            .style("width", "100%")
            .style("margin-top", "30px");

        const { xScale: sx, streamMarker: sm } = buildStreamChart(svg1, eraState);
        const { xScale: bx, lineMarker: bm } = buildLineChart(svg2, eraState);
        
        panelState[index] = {
            era: eraState,
            streamX: sx,
            streamMarker: sm,
            lineX: bx,
            lineMarker: bm,
        };
    });
}

function buildStreamChart(svgSel, era) {
    //linear scale for percentage vs year
    const x = d3.scaleLinear()
        .domain([era.windowStart, era.windowEnd])
        .range([0, siW]);

    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([siH, 0]);

    const g = svgSel.append("g")
        .attr("transform", `translate(${SML},${SMT})`);

    //change background for streamchart
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", siW)
        .attr("height", siH)
        .attr("fill", "#222222")
        .attr("rx", 0);

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
        .attr("fill", "#ffffff")
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

//creates the line chart
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
    });

    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", siW)
        .attr("height", siH)
        .attr("fill", "#222222")
        .attr("rx", 0);

    function drawGridLine(yPos) {
        g.append("line")
            .attr("x1", 0)
            .attr("x2", siW)
            .attr("y1", yPos)
            .attr("y2", yPos)
            .attr("stroke", GRID_COLOR)
            .attr("stroke-width", 1);
    }

    g.append("g").call(d3.axisLeft(y).tickFormat(d => `P${d}`))
        .call(ax => ax.select(".domain").remove()) 
        .call(ax => ax.selectAll("text")
            .attr("fill", LABEL_COLOR)
            .attr("font-size", LABEL_SIZE))
        .call(ax => ax.selectAll("line")
            .attr("stroke", "#8a9baa") 
            .attr("opacity", 0.6));

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
        .attr("fill", "#ffffff")
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
            .attr("fill", constructorHueBook[pt.team] || "#8a9baa").attr("stroke", "#fff").attr("stroke-width", 2);
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


    // Dynamic Shadow Coloring
    const defs = svgSel.append("defs");
    const filter = defs.append("filter")
        .attr("id", `glow-${era.panelIndex}`);
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    g.append("path")

        .attr("stroke", era.focusColor)
        .style("filter", `url(#glow-${era.panelIndex})`); 
    g.append("circle")
        .style("filter", `url(#glow-${era.panelIndex})`);

   // button clicking, ensure to clear all between layouts
    svgSel.selectAll(".button-layer").remove();

    const milestones = ERA_MILESTONES[era.panelIndex] || [];

    if (milestones.length > 0) {
    const btnWidth = 70;
    const btnSpacing = 10;
    const totalButtonsWidth = (milestones.length * btnWidth) + ((milestones.length - 1) * btnSpacing);
    let btnX = (siW - totalButtonsWidth) / 2;
    const btnY = siH + (SMB / 2) + 4.5;
    const btnContainer = g.append("g").attr("class", "button-layer");

    milestones.forEach(m => {
        const btnGroup = btnContainer.append("g")
            .attr("transform", `translate(${btnX}, ${btnY})`)
            .style("cursor", "pointer")
            .style("pointer-events", "all")
            .on("click", function(event) {
                event.stopPropagation();
                swapNarrativeText(era.panelIndex, m.year, m.text);
                updatePanelYear(era.panelIndex, m.year);
            });

        // create the buttons
        btnGroup.append("rect")
            .attr("width", btnWidth).attr("height", 22)
            .attr("rx", 6)
            .attr("fill", "#1a1a1a")
            .attr("stroke", era.focusColor)
            .attr("stroke-width", 2);

        btnGroup.append("text")
            .attr("x", btnWidth / 2).attr("y", 11)
            .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
            .style("font-size", "10px").style("font-weight", "bold")
            .attr("fill", "#ffffff")
            .text(`${m.year}`);

        btnX += (btnWidth + btnSpacing);
    });
}
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
}

//controls our button interactions such as swapping text panels
function swapNarrativeText(panelIndex, year, specificText) {
    // specifically for panelIndex
    const activeBox = document.querySelector(`.narrative-text-box[data-panel="${panelIndex}"]`);
    
    if (!activeBox) {
        console.error("Could not find text box for panel", panelIndex);
        return;
    }
 
    if (!activeBox.dataset.originalContent) {
        activeBox.dataset.originalContent = activeBox.innerHTML;
    }

    //controller for colors
    activeBox.innerHTML = `
        <div class="detail-view" style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h2 style="margin: 0; color: #ffffff; border-bottom: none; padding-bottom: 0;">${year} Insight</h2>
                <button class="back-btn" style="
                    background: #ffffff; border: 1px solid #cbd5e1;
                    padding: 4px 10px; border-radius: 6px; cursor: pointer;
                    font-weight: bold; color: #000000;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                ">← Back</button>
            </div>
            <hr style="border: none; border-top: 1px solid #e2eaf0; margin: 0 0 16px 0;">
            <p style="font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${specificText}
            </p>
        </div>
    `;
 
    activeBox.querySelector(".back-btn").addEventListener("click", () => {
        activeBox.innerHTML = activeBox.dataset.originalContent;
    });
}

 // set markers back to 0
export function clearAllMarkers() {
    Object.values(panelState).forEach(state => {
        if (state.streamMarker) state.streamMarker.attr("opacity", 0);
        if (state.lineMarker) state.lineMarker.attr("opacity", 0);
    });
}