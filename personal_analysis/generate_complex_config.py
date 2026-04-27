"""
Generate a Maximum Complexity Scenario Configuration for Romania
=============================================================
This config enables all available energy carriers (conventional and renewable)
and allows the solver to optimize extensions for all of them.
"""

import yaml
import os

OUTPUT_DIR = "config/adversarial"
os.makedirs(OUTPUT_DIR, exist_ok=True)

complex_config = {
    "tutorial": True,
    "run": {
        "name": "romania-2023-complex",
        "disable_progressbar": True,
        "shared_resources": {"policy": False}
    },
    "scenario": {
        "clusters": [5],
        "opts": [""]
    },
    "countries": ["RO"],
    "snapshots": {
        "start": "2023-12-01",
        "end": "2023-12-08"
    },
    "electricity": {
        "co2limit_enable": True,
        "co2limit": 100.0e+6,
        "extendable_carriers": {
            "Generator": [
                "solar", "solar-hsat", "onwind", "offwind-ac", "offwind-dc", "offwind-float", 
                "OCGT", "CCGT", "nuclear", "coal", "lignite", "biomass", "geothermal", "oil"
            ],
            "StorageUnit": ["battery"],
            "Store": ["H2"],
            "Link": ["H2 pipeline"]
        },
        "conventional_carriers": ["nuclear", "oil", "OCGT", "CCGT", "coal", "lignite", "geothermal", "biomass"],
        "renewable_carriers": ["solar", "solar-hsat", "onwind", "offwind-ac", "offwind-dc", "offwind-float", "hydro"],
        "powerplants_filter": "(DateOut >= 2024 or DateOut != DateOut)", # Remove any exclusion of nuclear/coal
        "estimate_renewable_capacities": {
            "enable": True,
            "from_gem": True,
            "year": 2023,
            "expansion_limit": False,
            "technology_mapping": {
                "Offshore": "offwind-ac",
                "Onshore": "onwind",
                "PV": "solar"
            }
        }
    },
    "atlite": {
        "default_cutout": "europe-2023-sarah3-era5",
        "cutouts": {
            "europe-2023-sarah3-era5": {
                "module": ["sarah", "era5"],
                "x": [-12.0, 42.0],
                "y": [33.0, 72.0],
                "dx": 0.3,
                "dy": 0.3,
                "time": ["2023", "2023"]
            }
        }
    },
    "renewable": {
        "offwind-ac": {"max_depth": False},
        "offwind-dc": {"max_depth": False},
        "offwind-float": {"max_depth": False, "min_depth": False}
    },
    "clustering": {
        "exclude_carriers": [], # Do not exclude ANY carriers
        "temporal": {"resolution_elec": "24h"}
    },
    "lines": {
        "dynamic_line_rating": {
            "activate": True,
            "max_line_rating": 1.3
        }
    },
    "solving": {
        "solver": {
            "name": "highs",
            "options": "highs-simplex"
        },
        "check_objective": {"enable": False}
    }
}

filename = os.path.join(OUTPUT_DIR, "romania_2023_complex.yaml")
with open(filename, 'w') as f:
    f.write("# Maximum Complexity Scenario: All Energy Sources of Romania\n")
    f.write(f"# Run name: {complex_config['run']['name']}\n\n")
    yaml.dump(complex_config, f, sort_keys=False, default_flow_style=False)

print(f"Created highly complex config: {filename}")
