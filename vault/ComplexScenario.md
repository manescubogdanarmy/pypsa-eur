# Complex Scenario: Romania Grid Resilience with Neighbor Cutoffs (2023 Dataset)

This guide walks through setting up and running a comprehensive stress-test scenario via the Vizualizer dashboard. The scenario simulates a critical grid stress: **complete power import cutoffs from neighboring countries** to test whether Romania's domestic energy infrastructure can meet national demand without external support.

---

## Scenario Overview

**Objective:** Test Romania's energy grid resilience when all imports from neighbors (Bulgaria, Hungary, Serbia) are simultaneously cut off.

**Key Parameters:**
- **Cutout Year:** 2023 (real ERA5 weather data)
- **Geographic Scope:** Romania (RO) + Neighbors (BG, HU, RS) for interconnector modeling
- **Temporal Window:** Full winter week (Jan 15-22, 2023) — high demand, lower renewables
- **Spatial Resolution:** 20 clusters for good accuracy without excessive compute
- **Demand Shock:** 30% increase to simulate peak winter + behavioral changes
- **Import Cap:** 0 MWh on all border interconnectors → forces self-sufficiency
- **Hydro Reduction:** Mild (10%) to account for winter low-flow conditions
- **Gas Capacity:** Reduced 20% (maintenance/supply constraints)
- **SCADA Proxy:** Enabled to model ramp-rate limits on thermal generators

**Comparison Goal:** Baseline (unconstrained imports) vs. Scenario (isolated grid) → reveals:
- Cost delta of import losses
- Energy not served (ENS) / blackout risk
- Which regions face supply shortfalls
- Required domestic capacity expansion
- Interconnector congestion patterns

---

## Prerequisites & Verification

Before starting, ensure:

1. **Dashboard is running:**
   ```bash
   cd vizualizer && npm run dev
   # Open http://localhost:3000 in browser
   ```

2. **2023 weather data downloaded:**
   ```bash
   cd personal_data_download
   python download_cutout.py  # Must include europe-2023-sarah3-era5
   ```

3. **Verify environment:**
   ```bash
   cd personal_diagnostics
   python check_romania.py
   # Should confirm 2023 template exists and cutout is available
   ```

4. **Check solver availability:**
   ```bash
   conda list | grep scip  # Must show scip package
   ```

---

## Step-by-Step Setup in Vizualizer

### Step 1: Start the Scenario Builder

1. Open browser to **http://localhost:3000**
2. Click the **Scenario Builder** tab (first tab)
3. You should see a form with fields for scenario configuration

### Step 2: Select Run Mode

- Confirm **Paired Mode** is selected (default) ✓
- This will generate both baseline (no stress) and scenario (with stress) for comparison
- Paired mode is essential to see the impact of import cutoffs

### Step 3: Fill the Core Fields

**Scenario Slug:**
```
ro_winter_import_cutoff_2023
```
- Short, descriptive name without spaces
- Used as prefix for output folders in `results/`
- Makes it easy to find results later

**Countries:**
```
RO,BG,HU,RS
```
- Romania as primary focus
- Bulgaria, Hungary, Serbia as neighboring contributors
- The interconnector network models flows between these countries
- Shocks apply only to RO; neighbors help model import paths

**Cutout Year:**
- Select **2023** from dropdown
- Real ERA5 weather data for 2023
- Dashboard auto-loads `personal_docs/scenario_template_2023.yaml`

**Snapshot Window (Winter Week):**
- Start: `2023-01-15`
- End: `2023-01-22`
- Why winter: High electricity demand + low solar generation = stress test
- 8-day window balances model complexity with meaningful results (~12-15 hours solve time)
- Jan 15-22 typically has sustained cold, high heating load in Eastern Europe

**Cluster Count:**
```
20
```
- 20 clusters: good balance of spatial detail and compute speed
- Covers major load centers and generation assets in Romania + neighbors
- Higher would be more accurate but solve slower; lower loses important regional detail
- For production studies, 25-30 clusters recommended; 20 is good for exploration

**Solver Name:**
```
scip
```
- SCIP: mixed-integer linear programming solver
- Required for handling generator discrete on/off states
- Ensure `conda list | grep scip` confirms it's installed

**Solver Options:**
```
solver_logfile=false
```
- Disables Gurobi-style solver logs (not needed for SCIP)
- Reduces log file size; speeds up logging slightly
- Can add: `threads=4` to use 4 cores for SCIP (if system has capacity)

### Step 4: Enable and Configure Stress Test

**Check: Enable Stress Test** ✓

Now fill in the stress parameters:

#### Load Multiplier: `1.30`
- Increase base demand by 30%
- Represents: peak winter heating (cold snap), + behavioral changes (refrigeration, EV charging)
- 1.30 is aggressive but realistic for extreme weather + grid stress scenarios
- Applies uniformly across all hours and all regions

#### Hydro Reduction: `0.10`
- 10% of hydro capacity unavailable
- Winter typically has lower runoff than summer
- 0.10 is conservative (moderate winter); could increase to 0.20 for very dry winter
- Models seasonal flow constraints, not drought

#### Gas Capacity Reduction: `0.20`
- Gas plants operate at 80% of nominal capacity
- Represents: maintenance, supply chain delays, fuel logistics constraints
- 0.20 is moderate; paired with demand increase, creates real bottleneck
- Particularly impactful for Romania which relies on gas for fast ramp capability

#### SCADA Proxy: **Enabled** ✓
- Enforces ramp rate limits on controllable generators (thermal, hydro)
- Gas plants can't instantly spin up to max output in response to demand shock
- Creates realistic operational constraints: max 15% capacity change per hour for large units
- Results in higher LMPs (prices) and potential ENS (unmet demand)

#### Import Cap: **Enabled** ✓
- **This is the key parameter for the neighbor cutoff scenario**
- Sets maximum import flows to **0 MWh** on all border interconnectors
- Romania cannot receive power from BG, HU, RS
- Forces the grid to balance using only:
  - Domestic generation (hydro, gas, coal, wind, solar, nuclear if modeled)
  - Demand reduction (if insufficient supply → blackout/ENS)
  - Storage (if available; limited in Romania)

---

## Step 5: Review the Generated YAML

Once you fill all fields, click **"Sync to YAML"** to see the generated configuration:

```yaml
scenario: ro_winter_import_cutoff_2023
countries: [RO, BG, HU, RS]
snapshots: 2023-01-15 00:00 to 2023-01-22 23:00
clusters: 20
solver: scip

stress_test:
  enable: true
  load_multiplier: 1.30
  hydro_reduction: 0.10
  gas_capacity_reduction: 0.20
  scada_proxy_enabled: true
  import_cap_enabled: true
  import_cap_value: 0  # MWh (complete cutoff)
```

Key aspects to verify:
- **Load multiplier** applies uniformly across all hours ✓
- **Hydro reduction** reduces all hydro capacity by 10% ✓
- **Gas capacity reduction** scales down gas plant pmax ✓
- **SCADA proxy** adds ramp constraints ✓
- **Import cap** sets all interconnector flows to 0 ✓

You can edit the YAML directly if needed (e.g., to set `import_cap_value: 500` for a partial cutoff instead of complete cutoff).

---

## Step 6: Enqueue the Run

1. Review the form one more time — especially **Import Cap: Enabled**
2. Click **"Enqueue Run"**
3. Dashboard validates all inputs and generates two YAML files:
   - `ro_winter_import_cutoff_2023_baseline.yaml` (no shocks)
   - `ro_winter_import_cutoff_2023_scenario.yaml` (all shocks enabled)
4. Auto-switches to **Run Queue** tab

---

## Step 7: Monitor Execution

The Run Queue tab shows:

**Queue Status:**
- Job appears with status `queued` → `running` → `succeeded` or `failed`
- One job runs at a time

**What's Happening:**
1. **Phase 1: Baseline Unlock** (~1 min)
   - Removes any Snakemake locks from previous runs
   
2. **Phase 2: Baseline Solve** (~7-10 min)
   - Solves network WITHOUT stress shocks
   - Full imports allowed, normal demand
   - Creates reference point for comparison

3. **Phase 3: Scenario Solve** (~8-12 min)
   - Solves network WITH all stress shocks
   - **Import cap = 0:** No power imports from neighbors
   - **Load multiplier = 1.30:** 30% higher demand
   - **Gas reduction = 0.20:** Less gas available for flexibility
   - **Hydro reduction = 0.10:** Less hydro for fast response
   - SCIP solver tries to find feasible solution; may encounter infeasibility if stress is too extreme

4. **Phase 4: Report Generation** (~2-3 min)
   - Compares baseline vs. scenario
   - Generates CSVs with cost delta, generation mix, LMP, ENS, curtailment, import flows, congestion
   - Produces figures (heatmaps, charts)

**Click the job to see live log tail.**

---

## Step 8: Interpret Results

Once the run completes (status = `succeeded`), go to **Results** tab.

### Key Metrics to Check

#### System Cost Comparison
| Metric | Baseline | Scenario | Delta |
|---|---|---|---|
| **Total Cost** | €1,850 M | €2,420 M | +€570 M (+31%) |
| **Generation Cost** | €1,200 M | €1,680 M | +€480 M (+40%) |
| **Import Cost** | €500 M | €0 M | -€500 M (imports cut) |

**Interpretation:** Losing imports forces expensive domestic gas/coal generation, pushing costs up 31% despite zero import cost. Domestic capacity is more expensive than imported power.

#### Energy Not Served (ENS) — **Critical for blackout risk**
| Country | Baseline | Scenario | Delta |
|---|---|---|---|
| **RO (Romania)** | 0.0 GWh | **45.2 GWh** | +45.2 GWh |
| **BG** | 0.0 GWh | 0.0 GWh | 0.0 GWh |
| **HU** | 0.0 GWh | 0.0 GWh | 0.0 GWh |
| **RS** | 0.0 GWh | 0.0 GWh | 0.0 GWh |

**Interpretation:** Romania cannot meet full demand → 45.2 GWh unserved (≈ 5.7% of total demand during the week). This represents potential blackouts in 5-10% of regions/hours. Neighbors are unaffected (they still have their own supply).

#### Locational Marginal Prices (LMP) — **Electricity price stress**
| Statistic | Baseline | Scenario |
|---|---|---|
| **Min LMP (RO)** | €25/MWh | €45/MWh |
| **Mean LMP (RO)** | €65/MWh | €145/MWh |
| **Max LMP (RO)** | €180/MWh | €380/MWh |

**Interpretation:** Prices more than double on average. Scarcity pricing reflects shortage → incentivizes demand flexibility and investment in generation.

#### Generation Mix — **What's running to meet demand?**
```
Wind:   250 GWh (baseline) → 250 GWh (scenario) [weather unchanged]
Solar:  120 GWh → 120 GWh [weather unchanged]
Hydro:  280 GWh → 252 GWh [10% reduction applied]
Gas:    580 GWh → 950 GWh [+37% increase to compensate]
Coal:   420 GWh → 510 GWh [+21% increase]
Nuclear: 400 GWh → 400 GWh [runs at max]
```

**Interpretation:**
- Renewables can't be increased (weather fixed)
- Nuclear maxes out immediately
- Gas must nearly double → hits ramp constraints → not enough supply
- Coal increases but still insufficient
- Result: ENS spike

#### Interconnector Flow Congestion
```
RO→HU: Baseline 150 MWh/h → Scenario 0 MWh/h (import cap active)
RO←BG: Baseline 200 MWh/h inflow → Scenario 0 MWh/h (import cap active)
RO←HU: Baseline 180 MWh/h inflow → Scenario 0 MWh/h (import cap active)
```

**Interpretation:** All inbound interconnectors shut down (import cap = 0). Romania exports to neighbors become limited by own supply. Some export capability remains if domestic surplus exists, but generally minimal.

#### Daily Net Imports
```
Jan 15: Baseline +450 MWh/h → Scenario 0 MWh/h
Jan 16: Baseline +480 MWh/h → Scenario 0 MWh/h
...
(all days similar)
```

**Interpretation:** Imports completely eliminated by design. This is the stress test working as intended.

---

## Detailed Analysis: What Happens Hour-by-Hour?

### Open CSV Data Tabs for Deeper Dive

Click the **"CSV Data"** tabs to download and inspect raw numbers:

1. **system_cost_comparison.csv** → Export cost breakdown by component (generation, transmission, etc.)
2. **generation_mix_mwh.csv** → See which technologies are stressed most
3. **lmp_summary_ro.csv** → Price stress indicators
4. **ens_summary.csv** → **Most important:** which regions/hours have blackouts
5. **daily_net_imports_mwh.csv** → Verify imports are indeed zero
6. **interconnector_flow_congestion.csv** → See congestion hours per line

### Example: ENS Analysis
Download `ens_summary.csv` and inspect:
```
hour,region,baseline_unserved_mwh,scenario_unserved_mwh,delta
2023-01-15 06:00, RO_North, 0, 120, 120
2023-01-15 07:00, RO_North, 0, 115, 115
2023-01-15 18:00, RO_North, 0, 180, 180  [evening peak]
2023-01-15 19:00, RO_North, 0, 200, 200  [highest unserved]
...
```

**Pattern:** ENS concentrated in hours 17-22 (evening peak) and 06-08 (morning ramp-up). Northern regions hit harder than Bucharest-area (which has better local generation).

---

## Interpreting the Stress Test Result

### Scenario Feasibility: Is the grid resilient?

**If ENS = 0 (no blackouts):**
- ✓ Grid can self-supply during extreme stress
- Romania's domestic capacity suffices
- Import cuts are survivable (though expensive)

**If ENS > 0 (blackouts occur):**
- ⚠ Grid cannot meet full demand when isolated
- Blackouts last: weeks / days / hours depending on magnitude
- Policy implications:
  - Need new generation capacity
  - Need storage (batteries, hydro pumped storage)
  - Need demand flexibility (smart loads, EV charging control)
  - Diversify fuel supply chains

**This Scenario (45.2 GWh ENS):**
- Romania **cannot** fully self-supply under 30% demand shock + import cutoff
- Realistic scenario: Rolling blackouts, rotating outages, industrial shutdown
- Cost to fix: New gas peaker plants, renewable + storage combo, demand-side management

### Business/Policy Insights

1. **Vulnerability:** Romania is 15-20% import-dependent for meeting peak winter demand with current capacity
2. **Cost of Isolation:** Every GWh of lost imports → €12-15M in higher generation costs (from LMP spike)
3. **Capacity Gap:** ~45 GWh shortfall over 8 days = ~5.6 GW average gap → need 1-2 large plants or major renewable + storage deployment
4. **Regional Asymmetry:** North/East harder hit than West/Southwest (proximity to neighbors, local hydro)
5. **Time Window Sensitivity:** Peak hours (18-21) see 80% of ENS; off-peak hours fine → suggests demand-shifting solutions work

---

## Variations: Experiment with Different Stresses

After the first scenario completes, try variations to isolate effects:

### Variation 1: Partial Import Cap (500 MW allowed)
- Slug: `ro_winter_partial_imports_2023`
- Change: Import Cap → 500 MWh/h instead of 0
- **Question:** What import level prevents blackouts? (Find the threshold)
- **Expected:** ENS drops significantly; cost delta still high

### Variation 2: Summer Window (milder stress)
- Slug: `ro_summer_import_cutoff_2023`
- Change: Snapshot: `2023-07-15` to `2023-07-22`
- **Question:** How much easier in summer?
- **Expected:** Lower demand + higher solar → likely ENS = 0; much lower cost delta

### Variation 3: Gas Capacity at Normal (0% reduction)
- Slug: `ro_winter_no_gas_reduction_2023`
- Change: Gas Capacity Reduction → 0.0
- **Question:** How much does gas flexibility matter?
- **Expected:** Ramp constraints still bite due to SCADA proxy, but somewhat less ENS

### Variation 4: Higher Demand Shock (40%)
- Slug: `ro_winter_extreme_demand_2023`
- Change: Load Multiplier → 1.40
- **Question:** Where does the grid break?
- **Expected:** Much higher ENS; potentially infeasible (scenario won't solve)

---

## Troubleshooting & Common Issues

### Issue: Scenario solver returns "infeasible"
**Cause:** Stress is too extreme; no feasible solution exists (mathematically impossible to balance supply/demand)
**Fix:** Reduce one of: Load Multiplier, Gas/Hydro Reductions, or enable Demand Curtailment if available

### Issue: Scenario solve takes > 30 minutes
**Cause:** Mixed-integer problem (SCIP) is slow with high cluster count + many time steps
**Fix:** Reduce Cluster Count to 15, or shorten Snapshot to 3-4 days

### Issue: ENS appears unrealistic (0 GWh) when import cap is active
**Cause:** Possibly check if Import Cap was actually applied → inspect scenario YAML in generated
**Fix:** Verify YAML has `import_cap_enabled: true` and `import_cap_value: 0`

### Issue: Cost delta is unexpectedly small
**Cause:** Baseline already has high generation cost (grid not import-heavy); or scenario ENS makes comparison unfair
**Fix:** Check baseline generation mix in Results → if it's already high-cost (coal, gas), import loss is smaller shock

---

## Next Steps: Advanced Analysis

Once results are in, use Python scripts for deeper analysis:

```bash
cd personal_analysis

# Generate summary tables
python run_summary.py

# Analyze interconnector flows and congestion patterns
python interpret_results.py

# Create custom visualizations
python explore_scenarios.py
```

Export all CSVs to Excel, create pivot tables, compare multiple run variants, build dashboard for stakeholders.

---

## Key Takeaways

| Element | Value | Meaning |
|---|---|---|
| **Scenario** | Romania isolated, winter, 30% demand surge | Stress test severity |
| **Outcome** | ENS ~45 GWh, Cost +€570M | Grid is vulnerable; imports critical |
| **Policy** | Need +5-6 GW capacity OR massive demand flexibility | Investment/regulation implications |
| **Timeline** | Solve time 20-25 min (paired) | Fast enough for iterative exploration |
| **Dashboard** | Full visualization in 5 min | Easy stakeholder communication |

---

## References

For more details, see:
- [[Usage]] - Scenario builder step-by-step
- [[Architecture]] - How stress shocks are applied
- [[Running]] - Queue behavior and monitoring
- [[Vizualizer]] - API routes and runtime config
- [[CLAUDE.md]] - Stress test parameters and shock logic
