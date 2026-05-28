# From Europe to the World

This project is a narrative visualization about Formula 1's global expansion and the racing eras defined by dominant constructors and drivers.

## Core Question

How did Formula 1 grow from a European racing series into a global sport, and which drivers and constructors defined each era?

## Planned Story

The project follows a Martini Glass structure. The first part is guided and author-driven. The final part opens into interaction.

1. Introduce the question.
2. Show F1's European origins on a circuit map.
3. Animate the calendar expanding across the world.
4. Summarize race distribution by continent over time.
5. Show constructor dominance over the same historical timeline.
6. Drill into the drivers behind selected constructor eras.
7. Let the viewer explore years, regions, constructors, and drivers.

## Planned Views

- Circuit expansion map: shows where F1 races happened by season or decade.
- Continent timeline: summarizes the map into race counts or race share by continent.
- Constructor dominance streamgraph: advanced visualization showing team dominance by season.
- Driver drilldown: detail view for selected eras, constructors, or drivers.

## Current Repo Structure

```text
data/                         Raw and processed F1 data
docs/                         Storyboard and data planning notes
scripts/main.js               Scroll-driven story controller
scripts/storyboard.js         Scene plan used by the story controller
scripts/charts/startermap.js  Current map prototype
scripts/charts/*.js           Planned chart modules
styles/styles.css             Layout and visual styling
index.html                    Story structure and chart containers
```

## Running Locally

Run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Implementation Priorities

1. Clean the processed race-location data and add continent labels.
2. Finish the map expansion scene.
3. Add the continent timeline as the transition from geography to competition.
4. Build the constructor streamgraph as the advanced visualization.
5. Add driver drilldown interaction.
6. Add annotations and transitions that support the main story.
