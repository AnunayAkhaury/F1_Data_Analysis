export async function drawConstructorDominance() {
  const [constructorStandings, races, constructors, results] = await Promise.all([
  d3.csv("data/constructor_standings.csv", d3.autoType),
  d3.csv("data/races.csv", d3.autoType),
  d3.csv("data/constructors.csv", d3.autoType),
  d3.csv("data/results.csv", d3.autoType)
]);

  const raceById = new Map(races.map(d => [d.raceId, d.year]));
  const constructorById = new Map(constructors.map(d => [d.constructorId, d.name]));

  const data = constructorStandings.map(d => ({
    year: raceById.get(d.raceId),
    constructor: constructorById.get(d.constructorId),
    wins: Number(d.wins),
    points: Number(d.points),
    position: Number(d.position)
  }));

  const raceYearById = new Map(races.map(d => [d.raceId, d.year]));
const resultData = results.map(d => ({
  year: raceYearById.get(d.raceId),
  constructor: constructorById.get(d.constructorId),
  raceId: d.raceId
}));

  const container = d3.select("#constructor-stream");

  container.html(`
  <div id="constructorYearLabel"></div>

  <div style="display:flex; gap:20px; align-items:flex-start;">
    <div>
      <h3>Constructor Wins</h3>
      <svg id="constructorChart" width="650" height="600"></svg>
    </div>

    <div>
      <h3>Race Participation</h3>
      <svg id="constructorParticipationChart" width="650" height="600"></svg>
    </div>
  </div>
`);



  const currentYear = d3.min(data, d => d.year);

draw(currentYear);
drawParticipation(currentYear);

const minYear = d3.min(data, d => d.year);
const maxYear = d3.max(data, d => d.year);
let selectedYear = currentYear;

container.node().addEventListener("wheel", event => {
  event.preventDefault();

  if (event.deltaY > 0) selectedYear++;
  else selectedYear--;

  selectedYear = Math.max(minYear, Math.min(maxYear, selectedYear));

  draw(selectedYear);
drawParticipation(selectedYear);
}, { passive: false });

  function draw(year) {
    const yearData = Array.from(
  d3.rollup(
    data.filter(d => d.year === year),
    v => ({
      constructor: v[0].constructor,
      wins: d3.max(v, d => d.wins),
      points: d3.max(v, d => d.points),
      position: d3.min(v, d => d.position)
    }),
    d => d.constructor
  ).values()
)
  .filter(d => d.wins > 0)
  .sort((a, b) => b.wins - a.wins);
  const champion = yearData.find(d => d.position === 1);

    d3.select("#constructorYearLabel").html(`
      <h3>${year}</h3>
      <p>🏆 Constructor Champion: ${champion ? champion.constructor : "No data"}</p>
    `);

    const svg = d3.select("#constructorChart");
    svg.selectAll("*").remove();

    const width = 700;
    const height = 700;
    const margin = { top: 20, right: 50, bottom: 50, left: 140 };

    const x = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.wins)])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(yearData.map(d => d.constructor))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    svg.selectAll("rect")
  .data(yearData)
  .join("rect")
  .attr("x", margin.left)
  .attr("y", d => y(d.constructor))
  .attr("width", d => x(d.wins) - margin.left)
  .attr("height", y.bandwidth())
  .attr("fill", d => d.position === 1 ? "#d4af37" : "#69b3a2")
  .style("cursor", "pointer")
  .on("click", function(event, d) {
    alert(
      `${year} ${d.constructor}\n` +
      `Wins: ${d.wins}\n` +
      `Points: ${d.points}\n` +
      `Championship Position: ${d.position}`
    );
  });

    svg.selectAll("text.label")
      .data(yearData)
      .join("text")
      .attr("class", "label")
      .attr("x", d => x(d.wins) + 8)
      .attr("y", d => y(d.constructor) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .text(d => `${d.wins} wins`);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }
  function drawParticipation(year) {
  const yearData = Array.from(
    d3.rollup(
      resultData.filter(d => d.year === year),
      v => new Set(v.map(d => d.raceId)).size,
      d => d.constructor
    ),
    ([constructor, races]) => ({ constructor, races })
  )
    .filter(d => d.constructor && d.races > 0)
    .sort((a, b) => b.races - a.races);

  const svg = d3.select("#constructorParticipationChart");
  svg.selectAll("*").remove();

  const width = 650;
  const height = 600;
  const margin = { top: 20, right: 50, bottom: 50, left: 140 };

  const x = d3.scaleLinear()
    .domain([0, d3.max(yearData, d => d.races)])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(yearData.map(d => d.constructor))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  svg.selectAll("rect")
    .data(yearData)
    .join("rect")
    .attr("x", margin.left)
    .attr("y", d => y(d.constructor))
    .attr("width", d => x(d.races) - margin.left)
    .attr("height", y.bandwidth())
    .attr("fill", "#8aa6c1");

  svg.selectAll("text.label")
    .data(yearData)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d.races) + 8)
    .attr("y", d => y(d.constructor) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .text(d => `${d.races} races`);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}
}

export function updateConstructorDominance(sceneState) {}
