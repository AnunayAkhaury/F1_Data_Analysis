# Data Plan

## Current Data Files

- `data/races.csv`: seasons, rounds, race names, dates, circuit IDs.
- `data/circuits.csv`: circuit names, locations, countries, latitude, longitude.
- `data/results.csv`: race results, drivers, constructors, finishing positions, points.
- `data/constructor_standings.csv`: constructor standings by race/season.
- `data/driver_standings.csv`: driver standings by race/season.
- `data/drivers.csv`: driver names, nationalities, IDs.
- `data/constructors.csv`: constructor names, IDs, nationalities.
- `data/f1_processed.json`: current processed map data used by the starter map.

## Required Joins

1. Race location view:
   - `races.csv` joins to `circuits.csv` by `circuitId`.
   - Output needs season, race name, circuit name, country, latitude, longitude, and continent.

2. Continent timeline:
   - Use race locations grouped by season and continent.
   - Output needs race count or race share per continent per season.

3. Constructor dominance:
   - Use constructor standings/results joined to constructor names.
   - Output needs constructor points by season.
   - Best metric for streamgraph: percent of total constructor points per season.

4. Driver drilldown:
   - Use driver standings/results joined to driver names and constructors.
   - Output needs driver points, wins, or championship rank within a selected era.

## Preprocessing Notes

- Add continent labels once, either manually by country lookup or with a preprocessing script.
- Keep raw data unchanged.
- Put generated files in `data/processed/` if the processed data gets larger or more specialized.
