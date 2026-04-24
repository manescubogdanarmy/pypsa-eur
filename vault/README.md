# PyPSA-Eur Project Overview Vault

This Obsidian vault provides a comprehensive overview of the PyPSA-Eur project structure and its custom Romania-focused analysis extensions.

## Navigation

### 📁 Vault Structure

```
vault/
├── 📂 Core/                    # Core project documentation
│   ├── README.md              # Main project overview
│   ├── CLAUDE.md             # Claude Code development guide
│   ├── PLAN.md               # Project planning
│   └── romania_guide.md      # Romania-specific guide
│
├── 📂 Piele-Analysis/         # Results processing & reporting
│   └── README.md             # Analysis tools overview
│
├── 📂 Piele-Dashboard/        # Interactive visualizations
│   ├── README.md             # Main dashboard guide
│   ├── documentation.md      # Technical documentation
│   └── scenario_manager_README.md # Scenario management
│
├── 📂 Piele-Runners/          # Scenario execution
│   └── README.md             # Execution scripts guide
│
├── 📂 Piele-Diagnostics/      # Testing & validation
│   └── README.md             # Diagnostic tools guide
│
├── 📂 Piele-Data/            # External data acquisition
│   └── README.md             # Data download tools
│
└── 📂 Piele-Docs/            # Project documentation
    ├── DASHBOARD_README.md           # Dashboard v1 guide
    ├── DASHBOARD_V2_IMPLEMENTATION.md # Dashboard v2 technical
    ├── FORMAT_SUPPORT.md             # File format support
    ├── PLAN.md                       # Original project plan
    ├── README.md                     # Documentation overview
    ├── README2.md                    # Additional guides
    ├── README3.md                    # Extended documentation
    ├── TEMPLATE_ARCHITECTURE.md      # Template system
    ├── VISUALIZER_COMPARISON.md      # Dashboard comparison
    ├── planui.md                     # UI planning
    └── results_summary.md            # Results summary
```

## Quick Links

### 🚀 Getting Started
- [[Core/README]] - Project overview and introduction
- [[Core/CLAUDE]] - Development setup and commands
- [[Core/romania_guide]] - Romania-specific workflows

### 🔧 Analysis Tools
- [[Piele-Analysis/README]] - Results processing and reporting tools
- [[Piele-Runners/README]] - Automated scenario execution
- [[Piele-Diagnostics/README]] - Testing and validation utilities

### 📊 Visualization
- [[Piele-Dashboard/README]] - Interactive Streamlit dashboards
- [[Piele-Dashboard/documentation]] - Technical implementation
- [[Piele-Docs/DASHBOARD_V2_IMPLEMENTATION]] - Advanced features

### 📚 Documentation
- [[Piele-Docs/README]] - Comprehensive project documentation
- [[Piele-Docs/PLAN]] - Original project planning
- [[Piele-Docs/TEMPLATE_ARCHITECTURE]] - System architecture

## Key Concepts

### PyPSA-Eur Framework
- Open optimization model of European energy system
- Snakemake-based workflow for data processing
- PyPSA framework for network optimization
- Multi-sector coupling (electricity, heat, transport, industry)

### Romania Analysis Extensions
- **Seasonal Analysis**: 5-season studies (winter, spring, summer, autumn, december)
- **Stress Testing**: 10+ adversarial scenarios simulating infrastructure failures
- **Interactive Dashboards**: Real-time visualization and comparison tools
- **Automated Workflows**: Batch execution and results processing

### Workflow Components
1. **Data Retrieval** - External data sources (ENTSO-E, weather, costs)
2. **Network Building** - Processing into network components
3. **Optimization** - PyPSA-based solving with multiple solvers
4. **Post-processing** - Results analysis and visualization

## Usage Patterns

### Development Workflow
1. Environment setup with `pixi shell`
2. Configuration in `config/` directory
3. Testing with `snakemake -n` dry runs
4. Quality checks with pre-commit hooks
5. Integration testing before deployment

### Analysis Workflow
1. Scenario configuration generation
2. Batch execution via runners
3. Results interpretation and summarization
4. Interactive visualization in dashboards
5. Report generation and export

## Tags for Organization

Use these tags to organize and filter content:

- `#core` - Essential project documentation
- `#analysis` - Results processing and interpretation
- `#dashboard` - Visualization and UI components
- `#runner` - Execution and automation
- `#diagnostics` - Testing and validation
- `#data` - External data management
- `#romania` - Romania-specific functionality
- `#workflow` - Snakemake and process documentation
- `#energy` - Energy system modeling concepts

---

*This vault serves as a centralized knowledge base for the PyPSA-Eur Romania analysis project, providing quick access to all documentation and facilitating project understanding and development.*