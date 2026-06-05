from pathlib import Path
import pandas as pd
import json

def narrativeConstructorData():
    root = Path(__file__).resolve().parent.parent.parent
    data_dir = root / 'data'
    output = data_dir / 'constructorNarrativeData.json'
    
    try:
        races_df = pd.read_csv(data_dir / 'races.csv')
        constructors_df = pd.read_csv(data_dir / 'constructors.csv')
        results_df = pd.read_csv(data_dir / 'results.csv')
        drivers_df = pd.read_csv(data_dir / 'drivers.csv')

        df = pd.merge(results_df, races_df[['raceId', 'year']], on='raceId')
        df = pd.merge(df, constructors_df[['constructorId', 'name']], on='constructorId')
        df = pd.merge(df, drivers_df[['driverId', 'surname']], on='driverId')

        eras = [
            {"id": "Fangio era", "start": 1951, "end": 1958, "focus": ["Alfa Romeo", "Maserati", "Ferrari"]},
            {"id": "Stewart era", "start": 1969, "end": 1974, "focus": ["Tyrrell", "Matra"]},
            {"id": "Williams 1992–1997", "start": 1991, "end": 1998, "focus": ["Williams"]},
            {"id": "Ferrari 1999–2004", "start": 1998, "end": 2005, "focus": ["Ferrari"]},
            {"id": "Red Bull 2010–2013", "start": 2009, "end": 2014, "focus": ["Red Bull"]},
            {"id": "Mercedes 2014–2021", "start": 2013, "end": 2022, "focus": ["Mercedes"]}
        ]
        narrative_structure = []

        for era in eras:
            era_obj = {"label": era["id"], "focusTeams": era["focus"], "years": {}}
            for year in range(era["start"], era["end"] + 1):
                year_df = df[df['year'] == year]
                era_obj["years"][str(year)] = {
                    "standings": year_df.groupby('name')['points'].sum().to_dict(),
                    "drivers": year_df.groupby('name')['surname'].unique().apply(list).to_dict()
                }
            narrative_structure.append(era_obj)
        with open(output, 'w') as f:
            json.dump(narrative_structure, f, indent=2)

    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    narrativeConstructorData()