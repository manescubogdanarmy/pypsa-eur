# HiGHS 1.10.0+ GPU Acceleration Setup Plan

**Date:** April 2026  
**Objective:** Enable GPU acceleration for PyPSA-Eur simulations using HiGHS 1.10.0+ on RTX 5070  
**Budget:** $0 (fully open-source)  
**Expected Speedup:** 15-25% on LP solving, 5-15% on mixed overall solve time

---

## Current State Assessment

### What We Have
- PyPSA-Eur project with Snakemake workflows
- Romania-focused stress tests (baseline + scenario)
- HiGHS solver (already integrated in PyPSA)
- NVIDIA RTX 5070 GPU (Blackwell architecture, sm_120)
- Conda environment for PyPSA

### Current Solver Performance
- Romania stress test: ~30-60 minutes per scenario
- Europe-wide models: Not currently tested (would take 8+ hours on CPU)
- Solver: HiGHS (likely <v1.10.0)

---

## Phase 1: Environment & Dependencies (Week 1)

### 1.1 Check Current HiGHS Version
```bash
# In your PyPSA environment
python -c "import pypsa; print(pypsa.__version__)"
python -c "import highspy; print(highspy.__version__)"

# Or check via pip
pip show highspy
```

### 1.2 Verify NVIDIA Setup
```bash
# Check NVIDIA drivers
nvidia-smi

# Check CUDA availability
nvcc --version

# Required: CUDA Toolkit 11.8+ (HiGHS GPU requires this)
# Your RTX 5070 supports CUDA, but check driver version (ideally 550+)
```

### 1.3 Install/Upgrade HiGHS 1.10.0+

**Option A: Via conda (recommended for reproducibility)**
```bash
# First, check if conda-forge has HiGHS 1.10.0+
conda search -c conda-forge highs

# Create new environment or update existing
conda install -c conda-forge highs=1.10.0 -y

# Verify installation
python -c "from highspy import h; print(h.__version__)"
```

**Option B: Build from source with GPU support**

If conda doesn't have 1.10.0+ yet:

```bash
# Prerequisites
sudo apt-get install cmake ninja-build git  # Linux/WSL
brew install cmake ninja git                 # macOS

# Clone HiGHS repo
git clone https://github.com/ERGO-Code/HiGHS.git
cd HiGHS

# Build with GPU support enabled
mkdir build && cd build
cmake -S.. -Bbuild \
  -DCMAKE_BUILD_TYPE=Release \
  -DCUPDLP_GPU=ON \
  -DCMAKE_CUDA_ARCHITECTURES=86  # For RTX 5070 (Blackwell = sm_120, but try 86 first)
cmake --build build --parallel $(nproc)

# Install to environment
cmake --install build --prefix /path/to/conda/env/pypsa-eur
```

**⚠️ RTX 5070 Note:** The RTX 5070 uses sm_120 (Blackwell). If you get CUDA architecture errors:
- Try: `-DCMAKE_CUDA_ARCHITECTURES=86` (fallback, should work)
- Or: `-DCMAKE_CUDA_ARCHITECTURES=120` (if CUDA toolkit supports it - requires CUDA 12.4+)

### 1.4 Verify GPU Detection
```python
# test_gpu_detection.py
import highspy
from highspy import h

# Create simple LP
lp = h.Highs()

# Check if GPU solver available
print("HiGHS version:", h.__version__)
print("Available solvers:", dir(lp))

# Try setting GPU solver (if available)
# Note: cuPDLP solver availability depends on build
lp.changeObjectiveSense(1)  # Test that LP works
print("HiGHS GPU support: Check documentation")
```

Run it:
```bash
python test_gpu_detection.py
```

---

## Phase 2: PyPSA Configuration (Week 1-2)

### 2.1 Update PyPSA Solver Configuration

**File:** `config/adversarial/pypsa_config.yaml` or `config/default_config.yaml`

Add/update solver section:
```yaml
solving:
  solver:
    name: highs
    # Enable presolve (faster for LP)
    options:
      presolve: "choose"
      simplex_strategy: "choose"
      parallel: "on"
      threads: 8  # Adjust to your CPU core count
      
      # GPU acceleration options (HiGHS 1.10.0+)
      # Note: These may vary by HiGHS version
      run_crossover: true
      first_order_options: "use_gpu=true"  # Experimental
      
  # Solver options for PyPSA
  options:
    solver_name: highs
    log_level: 1  # 0=silent, 1=info
    crossover: true
    
  # Time limits (adjust based on your needs)
  time_limit_rom: 300  # seconds
  time_limit: 7200  # 2 hours for large problems
```

### 2.2 Update Scenario Templates

**File:** `personal_docs/scenario_template.yaml`

Ensure solver is configured:
```yaml
solving:
  solver:
    name: highs
  options:
    solver_name: highs
    solver_logfile: "logs/highs_{run_name}.log"
```

### 2.3 Validate Configuration

Create validation script:

```python
# personal_diagnostics/validate_highs_config.py
import yaml
import sys
from pathlib import Path

def validate_highs_config(config_path):
    """Validate HiGHS solver configuration"""
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    checks = []
    
    # Check solver name
    solver = config.get('solving', {}).get('solver', {})
    if isinstance(solver, dict):
        solver_name = solver.get('name', '')
    else:
        solver_name = solver
    
    if solver_name == 'highs':
        checks.append(("✓", "Solver set to HiGHS"))
    else:
        checks.append(("✗", f"Solver is '{solver_name}', expected 'highs'"))
    
    # Check thread configuration
    options = config.get('solving', {}).get('options', {})
    threads = options.get('threads', 'not set')
    checks.append(("ℹ", f"Threads configured: {threads}"))
    
    # Print results
    for status, msg in checks:
        print(f"{status} {msg}")
    
    return all("✓" in check[0] for check in checks)

if __name__ == "__main__":
    config_file = sys.argv[1] if len(sys.argv) > 1 else "config/adversarial/romania_2019_winter_baseline.yaml"
    validate_highs_config(config_file)
```

Run:
```bash
python personal_diagnostics/validate_highs_config.py config/adversarial/romania_2019_winter_baseline.yaml
```

---

## Phase 3: Testing & Benchmarking (Week 2-3)

### 3.1 Create Benchmark Script

**File:** `personal_diagnostics/benchmark_highs_gpu.py`

```python
# benchmark_highs_gpu.py
"""
Benchmark HiGHS CPU vs GPU performance on typical PyPSA scenarios
"""
import time
import logging
from pathlib import Path
import yaml
import pypsa
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_benchmark(config_path, scenario_name, num_runs=3):
    """Run scenario multiple times and report timing statistics"""
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Benchmark: {scenario_name}")
    logger.info(f"Config: {config_path}")
    logger.info(f"Runs: {num_runs}")
    logger.info(f"{'='*60}")
    
    # Load config
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    times = []
    
    for run in range(num_runs):
        logger.info(f"\nRun {run + 1}/{num_runs}")
        
        # Create network
        n = pypsa.Network(config=config)
        
        # Load data (this happens in Snakemake normally)
        # For now, we'll just prepare existing network
        
        start = time.time()
        try:
            status = n.optimize.create_model()
            logger.info(f"  Model creation: {time.time() - start:.2f}s")
            
            solve_start = time.time()
            status = n.optimize(solver_name='highs', log_level=1)
            solve_time = time.time() - solve_start
            
            logger.info(f"  Solve time: {solve_time:.2f}s")
            logger.info(f"  Status: {status}")
            
            times.append(solve_time)
        except Exception as e:
            logger.error(f"  Error: {e}")
            continue
    
    if times:
        logger.info(f"\n{'='*60}")
        logger.info(f"Results for {scenario_name}:")
        logger.info(f"  Min time: {min(times):.2f}s")
        logger.info(f"  Max time: {max(times):.2f}s")
        logger.info(f"  Avg time: {np.mean(times):.2f}s")
        logger.info(f"  Std dev:  {np.std(times):.2f}s")
        logger.info(f"{'='*60}\n")
        return np.mean(times)
    else:
        logger.error(f"No successful runs for {scenario_name}")
        return None

if __name__ == "__main__":
    # Test on Romania stress scenario
    config = "config/adversarial/romania_2019_winter_baseline.yaml"
    scenario = "romania_winter_baseline"
    
    run_benchmark(config, scenario, num_runs=3)
```

Run baseline test:
```bash
cd personal_diagnostics
python benchmark_highs_gpu.py
```

### 3.2 Run Quick Validation Tests

```bash
# Test 1: Simple baseline run (quick)
cd personal_runners
python run_baseline_only.bat

# Monitor GPU usage
# In another terminal:
watch -n 1 nvidia-smi
```

### 3.3 Create Performance Comparison

After getting GPU working, compare against CPU benchmarks:

**File:** `personal_diagnostics/compare_cpu_gpu.py`

```python
# compare_cpu_gpu.py
"""
Compare CPU-only vs GPU-accelerated HiGHS performance
"""
import subprocess
import json
from datetime import datetime
from pathlib import Path

def run_scenario_and_measure(config_path, env_vars=None):
    """Run scenario and measure solve time from logs"""
    env = env_vars or {}
    result = subprocess.run(
        ["python", "-c", f"import pypsa; n = pypsa.Network(); n.optimize(solver_name='highs')"],
        capture_output=True,
        env={**os.environ, **env}
    )
    # Parse timing from output
    return result

results = {
    "timestamp": datetime.now().isoformat(),
    "gpu": "RTX 5070",
    "tests": []
}

# You'll run this manually after benchmarking both CPU and GPU versions
print(json.dumps(results, indent=2))
```

---

## Phase 4: Snakemake Integration (Week 3)

### 4.1 Update Snakemake Rules

**File:** `rules/solve_network.smk` (or equivalent in your setup)

Ensure HiGHS is specified:
```smk
rule solve_network:
    input:
        "networks/{run_name}_base.nc"
    output:
        "results/{run_name}/networks/base_s_elec.nc"
    params:
        solver="highs"
    log:
        "logs/solve_{run_name}.log"
    resources:
        mem_mb=16000
    shell:
        """
        python scripts/solve_network.py \
            --network {input} \
            --solver {params.solver} \
            --log {log} \
            2>&1 | tee {log}
        """
```

### 4.2 Test Snakemake Pipeline

```bash
# Dry run to check DAG
snakemake --configfile config/adversarial/romania_2019_winter_baseline.yaml --dry-run

# Run single target with verbose output
snakemake \
    --configfile config/adversarial/romania_2019_winter_baseline.yaml \
    --cores 8 \
    -v \
    results/romania-2019-winter-baseline/networks/base_s_10_elec_.nc
```

---

## Phase 5: Optimization Tuning (Week 4)

### 5.1 HiGHS Parameter Tuning

Create parameter sweep script:

```python
# personal_analysis/tune_highs_parameters.py
"""
Test different HiGHS parameter combinations to find optimal settings
"""
import pandas as pd
import time
from itertools import product

# Parameter combinations to test
param_configs = {
    'presolve': ['on', 'off'],
    'parallel': ['on', 'off'],
    'simplex_strategy': ['choose', 'primal', 'dual'],
    'crash': ['off', 'basismax', 'ltssf'],
}

results = []

for params in product(*param_configs.values()):
    param_dict = dict(zip(param_configs.keys(), params))
    
    # Run scenario with these parameters
    # Time it
    # Record results
    
    results.append({
        'params': param_dict,
        'solve_time': solve_time,
        'optimal': status_ok
    })

# Find best configuration
df = pd.DataFrame(results)
best = df.loc[df['solve_time'].idxmin()]
print(f"Best configuration:\n{best}")
```

### 5.2 Recommended Settings for Your Setup

Based on HiGHS 1.10.0+ and RTX 5070:

```yaml
solving:
  solver:
    name: highs
    options:
      # GPU and parallelization
      parallel: "on"
      threads: 8  # Adjust to your CPU cores
      
      # LP solving strategy
      simplex_strategy: "choose"  # Auto-select best
      crash: "ltssf"  # Better starting basis
      
      # Presolve (often helps with LP)
      presolve: "choose"
      
      # Interior point (can use GPU acceleration)
      ipm_optimality_tolerance: 1e-6
      
      # Time/iteration limits
      dual_feasibility_tolerance: 1e-7
      
  options:
    solver_name: highs
    multi_investment_periods: false
    solver_logfile: "logs/highs_{run_name}.log"
    time_limit: 3600  # 1 hour for Europe-wide
```

---

## Phase 6: Monitoring & Diagnostics (Ongoing)

### 6.1 Create Performance Dashboard

**File:** `personal_diagnostics/monitor_highs.py`

```python
# monitor_highs.py
"""
Monitor HiGHS solver performance and GPU utilization
"""
import subprocess
import time
import json
from datetime import datetime
from pathlib import Path

def monitor_gpu_during_solve():
    """Monitor GPU usage while solving"""
    log_file = Path("logs/gpu_monitor.jsonl")
    
    start_time = time.time()
    while True:
        try:
            gpu_info = subprocess.check_output(
                ["nvidia-smi", "--query-gpu=utilization.gpu,utilization.memory,memory.used,memory.total",
                 "--format=csv,nounits,noheader"],
                text=True
            ).strip().split(',')
            
            log_file.write_text(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "elapsed_s": time.time() - start_time,
                "gpu_util": float(gpu_info[0]),
                "mem_util": float(gpu_info[1]),
                "mem_used_mb": float(gpu_info[2]),
                "mem_total_mb": float(gpu_info[3])
            }) + "\n", mode='a')
            
            time.sleep(5)  # Sample every 5 seconds
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")
            break

if __name__ == "__main__":
    # Run in background during solve
    # Start this before running scenario
    monitor_gpu_during_solve()
```

### 6.2 Parse and Visualize Results

```python
# personal_analysis/analyze_solve_performance.py
"""
Analyze HiGHS solver logs and GPU utilization
"""
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

def plot_gpu_utilization(log_file="logs/gpu_monitor.jsonl"):
    """Plot GPU utilization over time"""
    import json
    
    data = []
    with open(log_file) as f:
        for line in f:
            data.append(json.loads(line))
    
    df = pd.DataFrame(data)
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
    
    ax1.plot(df['elapsed_s'], df['gpu_util'], label='GPU Utilization %')
    ax1.set_ylabel('GPU Utilization (%)')
    ax1.set_title('GPU Usage During Solve')
    ax1.grid(True)
    ax1.legend()
    
    ax2.plot(df['elapsed_s'], df['mem_used_mb'], label='Memory Used')
    ax2.set_ylabel('Memory (MB)')
    ax2.set_xlabel('Elapsed Time (s)')
    ax2.set_title('GPU Memory Usage')
    ax2.grid(True)
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig('results/gpu_utilization.png')
    print("Saved to results/gpu_utilization.png")

if __name__ == "__main__":
    plot_gpu_utilization()
```

---

## Phase 7: Documentation & Expected Results

### 7.1 Expected Performance Improvements

| Scenario | CPU Time | GPU Time (Expected) | Speedup |
|----------|----------|-------------------|---------|
| Romania baseline (10 nodes, 168h) | 5-10 min | 4-8 min | ~1.2x |
| Romania stress (10 nodes, 168h) | 5-10 min | 4-8 min | ~1.2x |
| Small Europe (50 nodes, 3-hourly) | 30-60 min | 25-45 min | ~1.3x |
| Medium Europe (100 nodes, 3-hourly) | 2-3 hours | 1.5-2 hours | ~1.4x |
| Full Europe (250 nodes, 3-hourly) | 8+ hours | 6-7 hours | ~1.3x |

**Note:** Actual speedup depends on:
- LP vs MIP ratio (GPU helps LP more)
- Problem sparsity
- RTX 5070 vs CPU core count
- HiGHS version and build optimization

### 7.2 Success Criteria

✓ HiGHS 1.10.0+ installed and GPU support enabled  
✓ PyPSA configuration updated to use HiGHS  
✓ Romania baseline scenario completes <10 min  
✓ GPU utilization >50% during solve (check with nvidia-smi)  
✓ Measurable speedup vs CPU baseline (even if modest)  
✓ Documentation updated with benchmarks  

---

## Troubleshooting Guide

### Problem: CUDA architecture mismatch

**Error:** `Error: CUDA architecture sm_120 not supported`

**Solution:**
```bash
# Try fallback architecture
cmake -DCMAKE_CUDA_ARCHITECTURES=86 ...
# Or check your actual architecture
nvidia-smi | grep "Compute Capability"
```

### Problem: GPU not detected

**Error:** HiGHS compiled but GPU not used

**Diagnosis:**
```bash
# Check HiGHS build info
python -c "from highspy import h; print(h.__version__); help(h.Highs)"

# Verify CUDA in LD_LIBRARY_PATH
echo $LD_LIBRARY_PATH | grep cuda
```

### Problem: Out of memory errors

**Error:** `CUDA out of memory`

**Solution:**
- Reduce problem size (fewer nodes, lower temporal resolution)
- Use CPU fallback: `presolve: "on"` reduces memory usage
- Increase GPU memory available (close other programs)

### Problem: Slow GPU performance

**Issue:** GPU solve is only slightly faster than CPU

**Causes:**
- GPU memory bottleneck (transfer overhead)
- Not using first-order solver (cuPDLP)
- Problem too small (GPU advantage starts at ~2000 variables)

**Solutions:**
- Use larger problems (Europe-wide)
- Ensure you're using the right solver: check HiGHS logs for "cuPDLP"
- Ensure GPU is fully utilized: `watch -n 1 nvidia-smi`

---

## Implementation Timeline

| Phase | Timeline | Owner | Status |
|-------|----------|-------|--------|
| 1. Environment Setup | Week 1 | You | Not started |
| 2. PyPSA Config | Week 1-2 | You | Not started |
| 3. Testing & Benchmarking | Week 2-3 | You | Not started |
| 4. Snakemake Integration | Week 3 | You | Not started |
| 5. Parameter Tuning | Week 4 | You | Not started |
| 6. Monitoring Setup | Ongoing | You | Not started |
| 7. Documentation | Final | You | Not started |

---

## Next Steps

1. **Immediate (This week):**
   - Check current HiGHS version
   - Verify NVIDIA drivers (ideally 550+)
   - Install/upgrade HiGHS 1.10.0+

2. **Short-term (Next 2 weeks):**
   - Update PyPSA configuration
   - Run benchmark script
   - Test Romania baseline scenario

3. **Medium-term (Weeks 3-4):**
   - Integrate with Snakemake
   - Tune HiGHS parameters
   - Document results and speedups

4. **Long-term (Ongoing):**
   - Monitor GPU utilization
   - Update documentation with real benchmarks
   - Share results with PyPSA community

---

## References

- [HiGHS Official Documentation](https://highs.dev/)
- [HiGHS GitHub - Building with GPU](https://github.com/ERGO-Code/HiGHS)
- [HiGHS May 2025 Newsletter](https://highs.dev/assets/HiGHS_Newsletter_25_0.pdf)
- [PyPSA Documentation](https://pypsa.org/)
- [NVIDIA CUDA Architecture Guide](https://developer.nvidia.com/cuda/gpus)

---

**Last Updated:** April 27, 2026  
**Status:** Ready for Implementation
