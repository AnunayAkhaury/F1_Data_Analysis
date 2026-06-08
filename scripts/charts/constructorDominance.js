// Maps constructor names to consistent colors.
// Used throughout the visualization so the same team always appears with the same color.
const constructorColorBook = {
    "Ferrari": "#e10600",
    "Williams": "#3867a8",
    "Mercedes": "#2a9d8f",
    "Red Bull": "#6c63b8",
    "McLaren": "#ff7a1a",
    "Renault": "#e9a227",
    "Lotus": "#6f7d4f",
    "Benetton": "#2a9d8f",
    "Brabham": "#3867a8",
    "Brawn": "#d4af37",
    "Racing Point": "#c85c54",
    "AlphaTauri": "#8aa6c1",
    "Haas F1 Team": "#8aa6c1",
    "Alfa Romeo": "#b94be8",
    "Alfa Romeo Racing": "#b94be8",
    "Tyrrell": "#6f7d4f",
    "Matra": "#1565c0",
    "Maserati": "#8b5e9c"
};

// Returns the color assigned to a constructor.
// If no color is defined, a default teal color is used.
function constructorColorFor(constructorName) {
    return constructorColorBook[constructorName] ?? "#2a9d8f";
}

// Main entry point for the Constructor Dominance section.
//
// Responsibilities:
// 1. Load constructor, race, and result datasets.
// 2. Build season-by-season summaries.
// 3. Create the interactive dashboard layout.
// 4. Set up season controls.
// 5. Render charts and information panels.
export async function drawConstructorDominance() {
    const [constructorStandings, races, constructors, results] = await Promise.all([
        // Load all CSV files needed for constructor analysis.
        d3.csv("data/constructor_standings.csv", d3.autoType),
        d3.csv("data/races.csv", d3.autoType),
        d3.csv("data/constructors.csv", d3.autoType),
        d3.csv("data/results.csv", d3.autoType)
    ]);
    // Create lookup tables for fast conversion between IDs and human-readable names.
    const constructorNameById = new Map(constructors.map(d => [d.constructorId, d.name]));
    const raceById = new Map(races.map(d => [d.raceId, d]));
    
    // Determine the first and last seasons available so the season controls know their valid range.
    const seasonYears = Array.from(new Set(races.map(d => d.year))).sort((a, b) => a - b);
    const firstSeasonYear = d3.min(seasonYears);
    const latestSeasonYear = d3.max(seasonYears);
    
    // Creates a season-by-season data structure that stores:
    // - Constructor standings
    // - Champion information
    // - Wins
    // - Points
    // - Race participation
    // This prevents expensive recalculations every time the user changes seasons.
    const constructorSeasonBook = buildConstructorSeasonBook(constructorStandings, results, raceById, constructorNameById);
    const constructorPanel = d3.select("#constructor-stream");
    // Tracks the currently selected season and the constructor currently selected by the user.
    let activeSeasonYear = latestSeasonYear;
    let pinnedConstructorName = null;

    // Creates the dashboard layout:
    // Left side:
    // - Constructor wins chart
    // Right side:
    // - Season summary
    // - Selected constructor details
    // - Participation summary
    constructorPanel.html(`
        <div class="constructor-lab">
            <div class="constructor-lab-heading">
                <div>
                    <p class="constructor-lab-kicker">Interactive constructor explorer</p>
                    <h3>Constructor wins by season</h3>
                    <p class="constructor-lab-subtitle">
                        Use the season control to compare how constructor power changes after the geographic story.
                    </p>
                </div>
                <div class="constructor-season-badge">
                    <span class="constructor-season-badge-label">Season</span>
                    <strong id="constructor-season-readout">${activeSeasonYear}</strong>
                </div>
            </div>

            <div class="constructor-season-controls">
                <button type="button" class="constructor-season-button" id="constructor-season-prev">Previous</button>
                <input id="constructor-season-slider" type="range" min="${firstSeasonYear}" max="${latestSeasonYear}" value="${activeSeasonYear}" step="1">
                <button type="button" class="constructor-season-button" id="constructor-season-next">Next</button>
            </div>

            <div class="constructor-era-jumps" id="constructor-era-jumps"></div>

            <div class="constructor-lab-grid">
                <section class="constructor-win-card">
                    <div class="constructor-card-title-row">
                        <div>
                            <p class="constructor-lab-kicker">Season result</p>
                            <h4>Race wins</h4>
                        </div>
                        <p class="constructor-click-hint">Click a bar to inspect one constructor.</p>
                    </div>
                    <svg id="constructor-win-chart" viewBox="0 0 760 420" preserveAspectRatio="xMidYMid meet"></svg>
                </section>

                <aside class="constructor-insight-rail">
                    <div id="constructor-season-snapshot"></div>
                    <div class="constructor-rail-divider"></div>
                    <div id="constructor-pinned-team"></div>
                    <div class="constructor-rail-divider"></div>
                    <div id="constructor-grid-presence"></div>
                </aside>
            </div>
        </div>
    `);

    // Quick navigation buttons that jump to important Formula 1 historical periods.
    const eraJumpButtons = [
        { label: "Origins", start: 1950, end: 1967 },
        { label: "Commercial growth", start: 1968, end: 1989 },
        { label: "Global boom", start: 1990, end: 2009 },
        { label: "Modern era", start: 2010, end: latestSeasonYear }
    ];

    // Creates the era navigation buttons and updates the dashboard when one is clicked.
    d3.select("#constructor-era-jumps")
        .selectAll("button")
        .data(eraJumpButtons)
        .join("button")
        .attr("type", "button")
        .attr("class", "constructor-era-jump")
        .text(d => `${d.label} (${d.start}-${d.end})`)
        .on("click", (event, d) => {
            activeSeasonYear = d.start;
            pinnedConstructorName = null;
            refreshConstructorLab(true);
        });

    // Move one season backward.
    d3.select("#constructor-season-slider")
        .on("input", event => {
            activeSeasonYear = Number(event.target.value);
            refreshConstructorLab(true);
        });

    // Move one season backward.
    d3.select("#constructor-season-prev")
        .on("click", () => {
            activeSeasonYear = Math.max(firstSeasonYear, activeSeasonYear - 1);
            refreshConstructorLab(true);
        });

    // Move one season forward.
    d3.select("#constructor-season-next")
        .on("click", () => {
            activeSeasonYear = Math.min(latestSeasonYear, activeSeasonYear + 1);
            refreshConstructorLab(true);
        });

    refreshConstructorLab(false);


    // Central update function.
    // Called whenever:
    // - season changes
    // - constructor selection changes
    // Updates:
    // - wins chart
    // - season summary
    // - constructor detail panel
    // - participation summary
    function refreshConstructorLab(shouldAnimate) {
        const seasonSlice = constructorSeasonBook.get(activeSeasonYear) ?? blankConstructorSeason(activeSeasonYear);
        const topWinRows = seasonSlice.standings
            .slice()
            .sort((a, b) => d3.descending(a.wins, b.wins) || d3.ascending(a.position, b.position))
            .slice(0, 8);

        if (pinnedConstructorName && !seasonSlice.byConstructor.has(pinnedConstructorName)) {
            pinnedConstructorName = null;
        }

        d3.select("#constructor-season-readout").text(activeSeasonYear);
        d3.select("#constructor-season-slider").property("value", activeSeasonYear);

        d3.selectAll(".constructor-era-jump")
            .classed("is-active", d => activeSeasonYear >= d.start && activeSeasonYear <= d.end);

        drawSeasonWinBars(topWinRows, seasonSlice, shouldAnimate);
        writeSeasonSnapshot(seasonSlice);
        writePinnedTeamSnapshot(seasonSlice);
        writeGridPresenceSnapshot(seasonSlice);
    }


    // Draws the horizontal bar chart showing constructor race wins for the selected season.
    function drawSeasonWinBars(topWinRows, seasonSlice, shouldAnimate) {
        const svg = d3.select("#constructor-win-chart");
        const chartWidth = 760;
        const chartHeight = 420;
        const chartPad = { top: 24, right: 86, bottom: 46, left: 150 };
        const largestWinCount = Math.max(1, d3.max(topWinRows, d => d.wins) ?? 1);
        const seasonShift = svg.transition().duration(shouldAnimate ? 450 : 0).ease(d3.easeCubicOut);

        // Converts win counts into pixel positions.
        const winsScale = d3.scaleLinear()
            .domain([0, largestWinCount])
            .nice()
            .range([chartPad.left, chartWidth - chartPad.right]);

        // Positions constructors vertically.
        const teamScale = d3.scaleBand()
            .domain(topWinRows.map(d => d.constructor))
            .range([chartPad.top, chartHeight - chartPad.bottom])
            .padding(0.22);

        svg.selectAll(".constructor-win-axis-x")
            .data([null])
            .join("g")
            .attr("class", "constructor-win-axis-x")
            .attr("transform", `translate(0,${chartHeight - chartPad.bottom})`)
            .transition(seasonShift)
            .call(d3.axisBottom(winsScale).ticks(5).tickSizeOuter(0));

        svg.selectAll(".constructor-win-axis-y")
            .data([null])
            .join("g")
            .attr("class", "constructor-win-axis-y")
            .attr("transform", `translate(${chartPad.left},0)`)
            .transition(seasonShift)
            .call(d3.axisLeft(teamScale).tickSizeOuter(0));

        // Draw vertical guide lines to improve readability.
        svg.selectAll(".constructor-win-guide")
            .data(winsScale.ticks(5), d => d)
            .join(
                enter => enter.append("line")
                    .attr("class", "constructor-win-guide")
                    .attr("x1", d => winsScale(d))
                    .attr("x2", d => winsScale(d))
                    .attr("y1", chartPad.top)
                    .attr("y2", chartHeight - chartPad.bottom),
                update => update,
                exit => exit.transition(seasonShift).attr("opacity", 0).remove()
            )
            .transition(seasonShift)
            .attr("x1", d => winsScale(d))
            .attr("x2", d => winsScale(d))
            .attr("y1", chartPad.top)
            .attr("y2", chartHeight - chartPad.bottom)
            .attr("opacity", 1);

        
        // Draw constructor win bars.
        // Gold = champion.
        // Team color = other constructors.
        // Clicking a bar selects a constructor and updates the detail panel.
        const winBarSelection = svg.selectAll(".constructor-win-bar")
            .data(topWinRows, d => d.constructor)
            .join(
                enter => enter.append("rect")
                    .attr("class", "constructor-win-bar")
                    .attr("x", chartPad.left)
                    .attr("y", d => teamScale(d.constructor))
                    .attr("height", teamScale.bandwidth())
                    .attr("width", 0)
                    .attr("rx", 7),
                update => update,
                exit => exit.transition(seasonShift).attr("width", 0).attr("opacity", 0).remove()
            );

        winBarSelection
            .classed("is-champion", d => d.position === 1)
            .classed("is-selected", d => d.constructor === pinnedConstructorName)
            .classed("is-dimmed", d => pinnedConstructorName && d.constructor !== pinnedConstructorName)
            .style("fill", d => d.position === 1 ? "#d4af37" : constructorColorFor(d.constructor))
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                pinnedConstructorName = pinnedConstructorName === d.constructor ? null : d.constructor;
                refreshConstructorLab(true);
            })
            .transition(seasonShift)
            .attr("x", chartPad.left)
            .attr("y", d => teamScale(d.constructor))
            .attr("height", teamScale.bandwidth())
            .attr("width", d => winsScale(d.wins) - chartPad.left)
            .attr("opacity", 1);

        // Display numeric win totals next to bars.
        svg.selectAll(".constructor-win-label")
            .data(topWinRows, d => d.constructor)
            .join(
                enter => enter.append("text")
                    .attr("class", "constructor-win-label")
                    .attr("x", chartPad.left + 8)
                    .attr("y", d => teamScale(d.constructor) + teamScale.bandwidth() / 2)
                    .attr("opacity", 0),
                update => update,
                exit => exit.transition(seasonShift).attr("opacity", 0).remove()
            )
            .transition(seasonShift)
            .attr("x", d => winsScale(d.wins) + 10)
            .attr("y", d => teamScale(d.constructor) + teamScale.bandwidth() / 2)
            .attr("opacity", 1)
            .text(d => `${d.wins} win${d.wins === 1 ? "" : "s"}`);

        svg.selectAll(".constructor-win-axis-title")
            .data([null])
            .join("text")
            .attr("class", "constructor-win-axis-title")
            .attr("x", chartPad.left)
            .attr("y", chartHeight - 8)
            .text("Race wins in selected season");

        svg.selectAll(".constructor-no-season-note")
            .data(topWinRows.length ? [] : [seasonSlice.year])
            .join("text")
            .attr("class", "constructor-no-season-note")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight / 2)
            .attr("text-anchor", "middle")
            .text(d => `No constructor standing data for ${d}.`);
    }

    // Displays season-level information:
    // - season year
    // - champion constructor
    // - race count
    // - final points total
    function writeSeasonSnapshot(seasonSlice) {
        const championRow = seasonSlice.champion;
        const raceText = seasonSlice.raceCount === 1 ? "race" : "races";

        d3.select("#constructor-season-snapshot").html(`
            <p class="constructor-lab-kicker">Selected season</p>
            <h4>${seasonSlice.year}</h4>
            <p class="constructor-champion-line">
                ${championRow ? championRow.constructor : "No champion data"}
            </p>
            <p class="constructor-muted-note">
                ${seasonSlice.raceCount} ${raceText} in the calendar.
                ${championRow ? `${championRow.constructor} finished P${championRow.position} with ${championRow.points.toFixed(1)} points.` : ""}
            </p>
        `);
    }

    // Displays detailed information for the currently selected constructor.
    function writePinnedTeamSnapshot(seasonSlice) {
        const focusRow = pinnedConstructorName
            ? seasonSlice.byConstructor.get(pinnedConstructorName)
            : seasonSlice.champion;

        d3.select("#constructor-pinned-team").html(`
            <p class="constructor-lab-kicker">${pinnedConstructorName ? "Clicked constructor" : "Champion focus"}</p>
            <h4>${focusRow ? focusRow.constructor : "Select a constructor"}</h4>
            ${focusRow ? `
                <div class="constructor-stats-grid">
                    <div><strong>${focusRow.wins}</strong><span>wins</span></div>
                    <div><strong>${focusRow.points.toFixed(1)}</strong><span>points</span></div>
                    <div><strong>P${focusRow.position}</strong><span>standing</span></div>
                    <div><strong>${focusRow.races}</strong><span>entries</span></div>
                </div>
            ` : `
                <p class="constructor-muted-note">Click a bar to keep one team highlighted.</p>
            `}
        `);
    }

    // Displays constructors with the highest number of race entries in the selected season.
    function writeGridPresenceSnapshot(seasonSlice) {
        const gridPresenceRows = seasonSlice.standings
            .filter(d => d.races > 0)
            .sort((a, b) => d3.descending(a.races, b.races) || d3.ascending(a.position, b.position))
            .slice(0, 5);
        const busiestRaceCount = Math.max(1, d3.max(gridPresenceRows, d => d.races) ?? 1);

        d3.select("#constructor-grid-presence").html(`
            <p class="constructor-lab-kicker">Participation context</p>
            <h4>Most race entries</h4>
            <div class="constructor-entry-stack">
                ${gridPresenceRows.map(d => `
                    <div class="constructor-entry-strip">
                        <span>${d.constructor}</span>
                        <div><i style="width:${(d.races / busiestRaceCount) * 100}%; background:${constructorColorFor(d.constructor)}"></i></div>
                        <strong>${d.races}</strong>
                    </div>
                `).join("")}
            </div>
        `);
    }
}


// Converts raw datasets into season summaries.
// Produces:
// season ->
//   standings
//   champion
//   race count
//   participation
// Used throughout the dashboard.
function buildConstructorSeasonBook(constructorStandings, results, raceById, constructorNameById) {
    // Count races held each season.
    const raceCountBySeason = d3.rollup(
        Array.from(raceById.values()),
        rows => rows.length,
        d => d.year
    );

    // Count how many races each constructor entered during each season.
    const entryCountBySeasonAndConstructor = d3.rollup(
        results,
        rows => new Set(rows.map(d => d.raceId)).size,
        d => raceById.get(d.raceId)?.year,
        d => constructorNameById.get(d.constructorId)
    );

    // Group constructor standings by season and constructor.
    // The final round of the season is used to determine the constructor's final championship position.
    const standingsBySeasonAndConstructor = d3.group(
        constructorStandings
            .map(d => {
                const race = raceById.get(d.raceId);

                return {
                    year: race?.year,
                    round: race?.round,
                    constructor: constructorNameById.get(d.constructorId),
                    wins: Number(d.wins) || 0,
                    points: Number(d.points) || 0,
                    position: Number(d.position) || 99
                };
            })
            .filter(d => d.year && d.constructor),
        d => d.year,
        d => d.constructor
    );

    return new Map(Array.from(standingsBySeasonAndConstructor, ([year, constructorRows]) => {
        const standings = Array.from(constructorRows, ([constructor, rows]) => {
            const finalSeasonRow = rows.sort((a, b) => d3.descending(a.round, b.round))[0];

            return {
                ...finalSeasonRow,
                constructor,
                races: entryCountBySeasonAndConstructor.get(year)?.get(constructor) ?? 0
            };
        }).sort((a, b) => d3.ascending(a.position, b.position) || d3.descending(a.wins, b.wins));

        return [year, {
            year,
            standings,
            champion: standings.find(d => d.position === 1) ?? standings[0],
            raceCount: raceCountBySeason.get(year) ?? 0,
            byConstructor: new Map(standings.map(d => [d.constructor, d]))
        }];
    }));
}

// Returns an empty season object when no data exists.
// Prevents rendering errors.
function blankConstructorSeason(year) {
    return {
        year,
        standings: [],
        champion: null,
        raceCount: 0,
        byConstructor: new Map()
    };
}

// Reserved for future integration with the scrolling story framework.
export function updateConstructorDominance(sceneState) {}
