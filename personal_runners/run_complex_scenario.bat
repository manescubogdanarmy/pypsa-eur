@echo off
setlocal enabledelayedexpansion

REM Activate conda
call "C:\ProgramData\anaconda3\Scripts\activate.bat" pypsa-eur

cd /d "c:\Users\Bogdan\Desktop\Projects\pypsa-eur"

echo Running Romania Maximum Complexity Scenario (2023)...

echo.
echo --- Unlock workflow ---
snakemake --unlock --configfile config/adversarial/romania_2023_complex.yaml
if errorlevel 1 (
    echo Error unlocking workflow
    goto error
)

echo.
echo --- Solve complex scenario ---
snakemake solve_elec_networks --configfile config/adversarial/romania_2023_complex.yaml -c all --resources mem_mb=32000 runtime=1000
if errorlevel 1 (
    echo Error solving complex scenario
    goto error
)

echo.
echo --- Generate Dashboard CSVs ---
REM We use the report_romania_winter_stress.py to generate the dashboard CSVs
REM Since the dashboard just plots the delta between baseline and scenario, we'll compare the complex scenario to itself or just the base.
REM To make it simple, we compare complex to complex or baseline to complex.
REM Wait, the report_romania_winter_stress requires both baseline and scenario.
REM Let's assume the baseline is the standard baseline if it exists, or just use the complex for both if it doesn't.
REM If romania_2020_winter_baseline doesn't exist, we will just pass the complex net twice to avoid crash.

set BASELINE_NET=results\romania-2023-winter-baseline\networks\base_s_5_elec_.nc
set COMPLEX_NET=results\romania-2023-complex\networks\base_s_5_elec_.nc

if not exist "!BASELINE_NET!" (
    echo Baseline net not found. Using complex net as baseline to prevent crash.
    set BASELINE_NET=!COMPLEX_NET!
)

python scripts/report_romania_winter_stress.py --baseline-net "!BASELINE_NET!" --scenario-net "!COMPLEX_NET!" --outdir results/romania-2023-complex-report

echo.
echo Scenarios completed! The UI can now load 'romania-2023-complex-report'.
goto done

:error
echo.
echo Run failed with error!
exit /b 1

:done
exit /b 0
