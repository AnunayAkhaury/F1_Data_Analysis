
//detailed information about a selected circuit
//triggered when the user clicks a race location on the world map and updates the detail panel 
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

    
    detail.append("p")
        .html("Winner: " + d.winner_driver);
    
    
}
    
  
//display constructor performance statistics for the selected season
//Shows wins, race participation, and a pie chart summarizin the constructor's season performance


function show_constructor_detail(d, year, constructorStandings, results) {

  const constructorName = d.constructor;
  const wins = d.wins;
  const races = getConstructorRaceCount(constructorName, year, results);

  const detail = d3.select("#detailPanel");
  detail.selectAll("*").remove();

  detail
    .style("display", "block");

  detail.append("h3")
    .text(constructorName);

  detail.append("p")
    .html(`Year: ${year}`);

  detail.append("p")
    .html(`Wins: ${wins}`);

  detail.append("p")
    .html(`Races participated: ${races}`);

  detail.append("p")
    .html(`Dominance: This team won ${wins} races in this season.`);

  detail.append("svg")
    .attr("id", "detailPieChart")
    .attr("width", 220)
    .attr("height", 220);

  drawWinRacePieChart(wins, races);
}


//Display constructor participation information.
//Triggered from the participation chart and reuses the detail panel 
function show_constructor_participation(d, year, constructorStandings, results) {

  const constructorName = d.constructor;
  const races = d.races;
  const wins = getConstructorWins(constructorName, year, constructorStandings);

  const detail = d3.select("#detailPanel");
  detail.selectAll("*").remove();

  detail
    .style("display", "block");

  detail.append("h3")
    .text(constructorName);

  detail.append("p")
    .html(`Year: ${year}`);

  detail.append("p")
    .html(`Wins: ${wins}`);

  detail.append("p")
    .html(`Races participated: ${races}`);


  detail.append("svg")
    .attr("id", "detailPieChart")
    .attr("width", 220)
    .attr("height", 220);

  drawWinRacePieChart(wins, races);
}


//Count the number of unique races entered by a constructor
function getConstructorRaceCount(constructorName, year, results) {

  const raceCount = new Set(
    results
      .filter(d => d.season === year)
      .filter(d => d.constructor === constructorName)
      .map(d => d.race_name)
  ).size;

  return raceCount;
}


//get the total number of wins recorded for a constructor in a given season
function getConstructorWins(constructorName, year, constructorStandings) {

  const row = constructorStandings
    .filter(d => d.season === year)
    .filter(d => d.constructor === constructorName)[0];

  if (row == null) {
    return 0;
  }

  return row.wins;
}


//pie chart comparing wins against total race participation.
//inside the detail panel to help users understand constructor dominance 
function drawWinRacePieChart(wins, races) {

  const svg = d3.select("#detailPieChart");

  svg.selectAll("*").remove();

  const width = 220;
  const height = 220;
  const radius = 80;

  let nonWins = races - wins;

  if (nonWins < 0) {
    nonWins = 0;
  }

  const pieData = [
    { type: "Wins", value: wins },
    { type: "Other races", value: nonWins }
  ];

  const pie = d3.pie()
    .value(d => d.value);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d.type))
    .range(["#2a9d8f", "#dce7ef"]);

  g.selectAll("path")
    .data(pie(pieData))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.type));

  g.selectAll("text")
    .data(pie(pieData))
    .join("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "12px")
    .text(d => {
      if (d.data.value === 0) {
        return "";
      }
      return d.data.value;
    });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Wins / Participated Races");

  svg.append("text")
    .attr("x", 20)
    .attr("y", 200)
    .attr("font-size", "12px")
    .text(`Wins: ${wins}`);

  svg.append("text")
    .attr("x", 120)
    .attr("y", 200)
    .attr("font-size", "12px")
    .text(`Other: ${nonWins}`);
}

//Clear and hide the detail panel.
function clear_detail() {

  const detail = d3.select("#detailPanel");

  detail.selectAll("*").remove();

  detail
    .style("display", "none");
}
