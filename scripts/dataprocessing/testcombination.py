from pathlib import Path
import pandas as pd
import json

def test_merge():
    project_root = Path(__file__).resolve().parent.parent.parent

    races_path = project_root/'data'/'races.csv'
    circuits_path = project_root/'data'/'circuits.csv'
    json_output_path = project_root/'data'/'f1_processed.json'
    
    
    try:
        races_df = pd.read_csv(races_path)
        circuits_df = pd.read_csv(circuits_path)
        races_subset = races_df[['year', 'circuitId', 'name']]
        circuits_subset = circuits_df[['circuitId','name', 'location','country', 'lat', 'lng']]

        merged =pd.merge(races_subset, circuits_subset, on='circuitId', suffixes=('_race', '_circuit'))

        dict = {}
        for year, group in merged.groupby('year'):
            dict[int(year)] = group[['name_race','location', 'country', 'lat', 'lng']].to_dict(orient='records')
        
        with open(json_output_path, 'w') as f:
            json.dump(dict, f, indent=2)
            
        print(f"Succeeded")

    except FileNotFoundError as e:
        print(f"Failed")

if __name__ == "__main__":
    test_merge()