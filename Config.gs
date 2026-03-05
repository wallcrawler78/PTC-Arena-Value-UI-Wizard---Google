/**
 * Config.gs
 * Single source of truth for all cell mappings and field definitions.
 * Update this file if the spreadsheet structure changes.
 */

var SPREADSHEET_TABS = {
  DATA_INPUT: 'Data Input',
  BENEFITS_CALC: 'Benefits Calc'
};

/**
 * Returns the complete wizard configuration including all field definitions
 * and cell mappings for both tabs.
 *
 * storeAs values:
 *   'text'    - write as-is string
 *   'number'  - write as plain number
 *   'decimal' - divide by 100 before writing (wizard uses %, sheet expects 0.xx)
 *   'percent' - write as-is (sheet expects whole number %)
 *   'currency'- write as plain number (dollar amounts)
 */
function getSheetConfig() {
  return {
    tabs: SPREADSHEET_TABS,

    dataInput: {
      tab: SPREADSHEET_TABS.DATA_INPUT,
      writeCol: 'D',
      fields: [
        // Step 1: Company Profile
        {
          id: 'customerName',
          label: 'Customer Name',
          row: 3,
          type: 'text',
          storeAs: 'text',
          required: true,
          step: 1,
          placeholder: 'e.g. Acme Corporation'
        },
        {
          id: 'annualRevenue',
          label: 'Annual Revenue ($)',
          row: 4,
          type: 'currency',
          storeAs: 'currency',
          required: true,
          step: 1,
          placeholder: 'e.g. 50000000',
          min: 0
        },
        {
          id: 'totalEmployees',
          label: 'Total Employees',
          row: 5,
          type: 'number',
          storeAs: 'number',
          required: true,
          step: 1,
          placeholder: 'e.g. 250',
          min: 1
        },

        // Step 2: Business Assumptions
        {
          id: 'revenueGrowthRate',
          label: 'Revenue Growth Rate',
          row: 10,
          type: 'slider',
          storeAs: 'decimal',
          step: 2,
          default: 10,
          min: 0,
          max: 50,
          unit: '%',
          hint: 'Expected annual revenue growth percentage'
        },
        {
          id: 'revenueFromNewProducts',
          label: '% Revenue from New Products',
          row: 11,
          type: 'slider',
          storeAs: 'decimal',
          step: 2,
          default: 20,
          min: 0,
          max: 100,
          unit: '%',
          hint: 'Share of total revenue from new/recently launched products'
        },
        {
          id: 'profitMarginNewProducts',
          label: 'Profit Margin on New Products',
          row: 12,
          type: 'slider',
          storeAs: 'decimal',
          step: 2,
          default: 10,
          min: 0,
          max: 50,
          unit: '%',
          hint: 'Net profit margin on new product lines'
        },
        {
          id: 'npdCycleTime',
          label: 'NPD/NPI Cycle Time (weeks)',
          row: 15,
          type: 'slider',
          storeAs: 'number',
          step: 2,
          default: 52,
          min: 4,
          max: 260,
          unit: 'wks',
          hint: 'Average weeks from concept to market launch'
        },

        // Step 3: Cost Structure
        {
          id: 'cogsPercent',
          label: 'COGS as % of Revenue',
          row: 18,
          type: 'slider',
          storeAs: 'decimal',
          step: 3,
          default: 70,
          min: 0,
          max: 100,
          unit: '%',
          hint: 'Cost of Goods Sold as a percentage of total revenue'
        },
        {
          id: 'directMaterialPercent',
          label: 'Direct Material % of COGS',
          row: 19,
          type: 'slider',
          storeAs: 'decimal',
          step: 3,
          default: 30,
          min: 0,
          max: 100,
          unit: '%',
          hint: 'Direct material costs as a share of COGS'
        },
        {
          id: 'cmMaterialPercent',
          label: 'CM Material % of COGS',
          row: 20,
          type: 'slider',
          storeAs: 'decimal',
          step: 3,
          default: 30,
          min: 0,
          max: 100,
          unit: '%',
          hint: 'Contract manufacturer material costs as a share of COGS'
        },
        {
          id: 'inventoryValue',
          label: 'Inventory Value ($)',
          row: 23,
          type: 'currency',
          storeAs: 'currency',
          step: 3,
          default: null,
          min: 0,
          hint: 'Total inventory value (default: 10% of Annual Revenue)'
        },
        {
          id: 'inventoryCarryingCost',
          label: 'Inventory Carrying Cost %',
          row: 24,
          type: 'slider',
          storeAs: 'decimal',
          step: 3,
          default: 25,
          min: 0,
          max: 50,
          unit: '%',
          hint: 'Annual cost to hold inventory as a percentage of inventory value'
        },
        {
          id: 'expeditingCosts',
          label: 'Annual Expediting Costs ($)',
          row: 27,
          type: 'currency',
          storeAs: 'currency',
          step: 3,
          default: null,
          min: 0,
          hint: 'Annual expediting costs (default: 0.2% of Revenue)'
        },
        {
          id: 'scrapRework',
          label: 'Annual Scrap & Rework ($)',
          row: 28,
          type: 'currency',
          storeAs: 'currency',
          step: 3,
          default: null,
          min: 0,
          hint: 'Annual scrap and rework costs (default: 0.2% of Revenue)'
        },
        {
          id: 'warrantyService',
          label: 'Annual Warranty & Service ($)',
          row: 29,
          type: 'currency',
          storeAs: 'currency',
          step: 3,
          default: null,
          min: 0,
          hint: 'Annual warranty and service costs (default: 0.2% of Revenue)'
        },
        {
          id: 'excessObsolete',
          label: 'Annual Excess & Obsolete ($)',
          row: 30,
          type: 'currency',
          storeAs: 'currency',
          step: 3,
          default: null,
          min: 0,
          hint: 'Annual excess and obsolete inventory costs (default: 0.2% of Revenue)'
        },

        // Step 4: Team Resources
        {
          id: 'devTeamFTEs',
          label: 'Development Team FTEs',
          row: 34,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of development team FTEs (default: 15% of employees)'
        },
        {
          id: 'devSalary',
          label: 'Development Team Avg Salary',
          row: 35,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        },
        {
          id: 'cadFTEs',
          label: 'CAD Design FTEs',
          row: 36,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of CAD design FTEs (default: 2% of employees)'
        },
        {
          id: 'cadSalary',
          label: 'CAD Design Avg Salary',
          row: 37,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        },
        {
          id: 'engServicesFTEs',
          label: 'Eng Services / Doc Mgmt FTEs',
          row: 38,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of engineering services / doc management FTEs (default: 1% of employees)'
        },
        {
          id: 'engServicesSalary',
          label: 'Eng Services Avg Salary',
          row: 39,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        },
        {
          id: 'pdcFTEs',
          label: 'Product Data Consumer FTEs',
          row: 40,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of product data consumer FTEs (default: 20% of employees)'
        },
        {
          id: 'pdcWorkweekPercent',
          label: 'PDC % Workweek Consuming Data',
          row: 41,
          type: 'slider',
          storeAs: 'decimal',
          step: 4,
          default: 10,
          min: 0,
          max: 100,
          unit: '%',
          hint: 'Fraction of workweek product data consumers spend consuming product data'
        },
        {
          id: 'pdcSalary',
          label: 'Product Data Consumer Avg Salary',
          row: 42,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        },
        {
          id: 'qualityFTEs',
          label: 'Quality / CAPA FTEs',
          row: 43,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of quality / CAPA FTEs (default: 5% of employees)'
        },
        {
          id: 'qualitySalary',
          label: 'Quality / CAPA Avg Salary',
          row: 44,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        },
        {
          id: 'complianceFTEs',
          label: 'Compliance FTEs',
          row: 45,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of compliance FTEs (default: 2% of employees)'
        },
        {
          id: 'complianceSalary',
          label: 'Compliance Avg Salary',
          row: 46,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        },
        {
          id: 'sourcingFTEs',
          label: 'Sourcing FTEs',
          row: 47,
          type: 'number',
          storeAs: 'number',
          step: 4,
          default: null,
          min: 0,
          hint: 'Number of sourcing FTEs (default: 1% of employees)'
        },
        {
          id: 'sourcingSalary',
          label: 'Sourcing Avg Salary',
          row: 48,
          type: 'currency',
          storeAs: 'currency',
          step: 4,
          default: 120000,
          min: 0
        }
      ]
    },

    benefitsCalc: {
      tab: SPREADSHEET_TABS.BENEFITS_CALC,
      improvementCol: 'D',
      includeCol: 'F',
      fields: [

        // ── Step 5: Revenue & COGS Benefits ──────────────────────────────────
        {
          id: 'reduceTimeToMarket',
          label: 'Reduce Time to Market',
          row: 2,
          storeAs: 'decimal',
          step: 5,
          default: 10,
          min: 10,
          max: 30,
          unit: '%',
          lowAnchor: 'Minor process improvements, limited PLM adoption',
          highAnchor: 'Full digital thread, real-time BOM visibility across teams',
          defaultInclude: true,
          suggestedPct: 15,
          maturityLevels: [
            { pct: 10, label: 'Fragmented Process',    description: 'Change orders tracked in spreadsheets; approval routing via email means design iterations take weeks longer than necessary.' },
            { pct: 17, label: 'Process Forming',       description: 'Core BOM and change workflows are managed in Arena, but supplier collaboration and cross-site visibility remain limited.' },
            { pct: 23, label: 'Digitally Connected',   description: 'Arena manages end-to-end change workflows with full stakeholder visibility, compressing cycle time across every function.' },
            { pct: 30, label: 'Digital Thread Leader', description: 'Full digital thread from concept to release. Suppliers collaborate directly in Arena; real-time change propagation drives market-leading launch speed.' }
          ]
        },
        {
          id: 'incrementalMargin',
          label: 'Incremental Margin from Early Launch',
          row: 4,
          storeAs: 'decimal',
          step: 5,
          default: 1,
          min: 1,
          max: 3,
          unit: '%',
          lowAnchor: 'Modest margin recovery from slight schedule improvement',
          highAnchor: 'Significant first-mover advantage on premium products',
          defaultInclude: true,
          suggestedPct: 1.5,
          maturityLevels: [
            { pct: 1,   label: 'Reactive',      description: 'Delayed launches due to change management gaps result in missed first-mover windows and compressed initial margins.' },
            { pct: 1.5, label: 'Improving',     description: 'Better schedule visibility from Arena change workflows reduces slippage; some early-launch margin is now captured.' },
            { pct: 2.5, label: 'Proactive',     description: 'Parallel engineering enabled by Arena\'s shared BOM environment consistently shortens time to market and improves margin capture.' },
            { pct: 3,   label: 'Market Leader', description: 'Systematic early market entry, driven by Arena\'s real-time release workflows, consistently captures premium pricing and margin.' }
          ]
        },
        {
          id: 'reduceDirectMaterial',
          label: 'Reduce Direct Material Spend',
          row: 5,
          storeAs: 'decimal',
          step: 5,
          default: 1,
          min: 1,
          max: 3,
          unit: '%',
          lowAnchor: 'Better supplier visibility, reduced duplicate parts',
          highAnchor: 'Strategic sourcing optimization with full part reuse analytics',
          defaultInclude: true,
          suggestedPct: 1.5,
          maturityLevels: [
            { pct: 1,   label: 'Fragmented Sourcing',  description: 'Duplicate parts proliferate across product lines; supplier data managed in spreadsheets disconnected from design.' },
            { pct: 1.5, label: 'Improving Visibility', description: 'Arena provides part master with AML/AVL linkage; occasional reuse reviews begin reducing duplicate part specifications.' },
            { pct: 2.5, label: 'Managed',              description: 'Procurement uses Arena BOM data for strategic sourcing negotiations; part reuse tracking actively reduces redundant spend.' },
            { pct: 3,   label: 'Optimized',            description: 'Full part reuse analytics, AVL cost benchmarking, and automated duplicate detection maximize direct material savings.' }
          ]
        },
        {
          id: 'reduceInventoryCarrying',
          label: 'Reduce Inventory Carrying Cost',
          row: 6,
          storeAs: 'decimal',
          step: 5,
          default: 5,
          min: 5,
          max: 15,
          unit: '%',
          lowAnchor: 'Improved BOM accuracy reduces buffer stock slightly',
          highAnchor: 'Real-time inventory intelligence, proactive obsolescence management',
          defaultInclude: true,
          suggestedPct: 8,
          maturityLevels: [
            { pct: 5,  label: 'BOM-Driven',  description: 'Arena BOM accuracy reduces buffer stock slightly; obsolescence management remains largely reactive and behind the curve.' },
            { pct: 8,  label: 'Improving',   description: 'Change effectivity dates in Arena enable better inventory planning against pending design changes and upcoming EOL components.' },
            { pct: 12, label: 'Proactive',   description: 'Arena change management integrates with supply chain visibility, enabling proactive inventory reduction before EOL events occur.' },
            { pct: 15, label: 'Optimized',   description: 'Real-time Arena intelligence drives dynamic safety stock adjustments and proactive EOL management across all SKUs.' }
          ]
        },
        {
          id: 'reduceCMMaterial',
          label: 'Reduce CM Material Spend',
          row: 7,
          storeAs: 'decimal',
          step: 5,
          default: 5,
          min: 3,
          max: 8,
          unit: '%',
          lowAnchor: 'Better CM collaboration, reduced re-orders',
          highAnchor: 'Tight CM integration with shared BOM, real-time change propagation',
          defaultInclude: true,
          suggestedPct: 5,
          maturityLevels: [
            { pct: 3,   label: 'Ad-Hoc Collaboration', description: 'BOMs transmitted to contract manufacturers via email or spreadsheet; version errors and costly re-orders are common.' },
            { pct: 5,   label: 'Structured Handoffs',  description: 'Standardized BOM packages sent to CM reduce errors, but change propagation is still delayed and manual.' },
            { pct: 6.5, label: 'Collaborative',        description: 'CM has direct visibility into Arena item records; change notifications significantly reduce expedited orders and material waste.' },
            { pct: 8,   label: 'Integrated',           description: 'CM operates within the Arena workspace; real-time BOM and change updates eliminate material waste from stale or misaligned data.' }
          ]
        },

        // ── Step 6: Productivity Benefits ─────────────────────────────────────
        {
          id: 'devTeamEfficiency',
          label: 'Development Team Efficiency',
          row: 8,
          storeAs: 'decimal',
          step: 6,
          default: 1,
          min: 1,
          max: 5,
          unit: '%',
          lowAnchor: 'Reduced searching for correct BOM/documentation',
          highAnchor: 'Fully automated change notifications, zero duplicate work',
          defaultInclude: true,
          suggestedPct: 2,
          maturityLevels: [
            { pct: 1,   label: 'Search & Rework',    description: 'Engineers spend significant time hunting for correct BOM versions; stale data leads to rework and duplicated effort across the team.' },
            { pct: 2,   label: 'Improving Access',   description: 'Arena provides a single source of truth; search time decreases meaningfully but some manual coordination steps remain.' },
            { pct: 3.5, label: 'Connected Teams',    description: 'Automated change notifications eliminate most duplicate effort; engineers focus on design rather than data management.' },
            { pct: 5,   label: 'Peak Efficiency',    description: 'Real-time product record access and automated change alerts eliminate wasted engineering time entirely; teams operate at full capacity.' }
          ]
        },
        {
          id: 'engServicesEfficiency',
          label: 'Eng Services / Doc Mgmt Efficiency',
          row: 9,
          storeAs: 'decimal',
          step: 6,
          default: 15,
          min: 15,
          max: 65,
          unit: '%',
          lowAnchor: 'Basic document management improvements',
          highAnchor: 'Fully automated release workflows, e-signatures, zero manual routing',
          defaultInclude: true,
          suggestedPct: 30,
          maturityLevels: [
            { pct: 15, label: 'Manual Routing',    description: 'Approval workflows managed by email; release packages assembled by hand with frequent missing items or wrong document revisions.' },
            { pct: 28, label: 'Basic Workflow',    description: 'Arena manages some approval workflows, but e-signatures and automated routing are not fully configured or consistently used.' },
            { pct: 50, label: 'Streamlined',       description: 'Most release workflows are automated within Arena; e-signatures replace wet signatures in nearly all cases.' },
            { pct: 65, label: 'Fully Automated',   description: 'Zero manual document routing; complete automated release workflows, e-signatures, and audit-ready archives throughout Arena.' }
          ]
        },
        {
          id: 'pdcEfficiency',
          label: 'Product Data Consumer Efficiency',
          row: 10,
          storeAs: 'decimal',
          step: 6,
          default: 18,
          min: 18,
          max: 90,
          unit: '%',
          lowAnchor: 'Single source of truth reduces search time',
          highAnchor: 'Full self-service access, no manual data requests',
          defaultInclude: true,
          suggestedPct: 40,
          maturityLevels: [
            { pct: 18, label: 'Data Gating',         description: 'Manufacturing, service, and procurement teams rely entirely on engineering to pull and deliver product data — high wait times, frequent interruptions.' },
            { pct: 38, label: 'Partial Self-Service', description: 'Arena provides some direct access, but permission gaps and training barriers limit adoption among downstream teams.' },
            { pct: 65, label: 'Broad Access',         description: 'Most data consumers access current product records in Arena directly, dramatically reducing engineering interrupt rate.' },
            { pct: 90, label: 'Full Self-Service',    description: 'All product data consumers are autonomous Arena users; zero manual data requests to engineering; teams operate independently.' }
          ]
        },
        {
          id: 'cadEfficiency',
          label: 'CAD Design Efficiency',
          row: 11,
          storeAs: 'decimal',
          step: 6,
          default: 1,
          min: 1,
          max: 3,
          unit: '%',
          lowAnchor: 'Better part library access, fewer redesigns',
          highAnchor: 'Full CAD-PLM integration, automated BOM population',
          defaultInclude: true,
          suggestedPct: 1.5,
          maturityLevels: [
            { pct: 1,   label: 'Disconnected CAD',    description: 'CAD data and PLM are siloed; BOMs are built manually from CAD exports, creating version drift, errors, and redundant part creation.' },
            { pct: 1.5, label: 'Partial Integration', description: 'Some CAD-PLM linkage exists but BOM population remains semi-manual and prone to synchronization errors.' },
            { pct: 2.5, label: 'Integrated Workflow', description: 'CAD integration pushes accurate BOMs to Arena automatically; part library reuse is tracked and enforced to prevent duplication.' },
            { pct: 3,   label: 'Fully Optimized',     description: 'Seamless CAD-Arena integration with automatic BOM creation, reuse analytics, and zero redundant part generation.' }
          ]
        },
        {
          id: 'qualityEfficiency',
          label: 'Quality / CAPA Efficiency',
          row: 12,
          storeAs: 'decimal',
          step: 6,
          default: 4,
          min: 4,
          max: 20,
          unit: '%',
          lowAnchor: 'Faster access to quality records and history',
          highAnchor: 'Automated CAPA workflows, closed-loop quality management',
          defaultInclude: true,
          suggestedPct: 8,
          maturityLevels: [
            { pct: 4,  label: 'Reactive Quality', description: 'CAPAs tracked in spreadsheets or standalone tools; traceability between design changes and quality events is entirely manual.' },
            { pct: 9,  label: 'Connected Records', description: 'Arena links quality records to product items and changes; some CAPA workflows automated but not consistently adopted.' },
            { pct: 14, label: 'Closed-Loop',       description: 'Automated CAPA workflows tied to Arena change events; resolution time decreases as teams work within a unified quality system.' },
            { pct: 20, label: 'Proactive Quality', description: 'Fully automated, closed-loop quality management in Arena eliminates reactive firefighting and significantly reduces repeat failure rates.' }
          ]
        },
        {
          id: 'complianceEfficiency',
          label: 'Compliance Efficiency',
          row: 13,
          storeAs: 'decimal',
          step: 6,
          default: 2,
          min: 2,
          max: 20,
          unit: '%',
          lowAnchor: 'Easier audit trail access and report generation',
          highAnchor: 'Fully automated compliance reporting, real-time substance alerts',
          defaultInclude: true,
          suggestedPct: 8,
          maturityLevels: [
            { pct: 2,  label: 'Manual Compliance',    description: 'Compliance documentation prepared manually for each audit; RoHS/REACH substance data tracked in disconnected spreadsheets by individual contributors.' },
            { pct: 7,  label: 'Structured Records',   description: 'Compliance declarations linked to Arena items; report preparation is faster but still requires manual assembly and review.' },
            { pct: 14, label: 'Automated Reporting',  description: 'Compliance reports generated directly from Arena with complete roll-up substance data; audit readiness is maintained continuously.' },
            { pct: 20, label: 'Full Automation',      description: 'Real-time compliance alerts, automated regulatory filings, and proactive substance change management eliminate compliance exposure and audit prep burden.' }
          ]
        },
        {
          id: 'sourcingEfficiency',
          label: 'Sourcing Efficiency',
          row: 14,
          storeAs: 'decimal',
          step: 6,
          default: 3,
          min: 3,
          max: 10,
          unit: '%',
          lowAnchor: 'Better supplier data visibility, reduced manual work',
          highAnchor: 'Integrated sourcing workflows, automated AVL management',
          defaultInclude: true,
          suggestedPct: 5,
          maturityLevels: [
            { pct: 3,   label: 'Manual Sourcing',      description: 'AVL managed in spreadsheets disconnected from Arena BOMs; supplier changes communicated by email, causing data inconsistency and re-sourcing effort.' },
            { pct: 5,   label: 'Improving Visibility', description: 'AML/AVL linked to Arena items; procurement has read access but change-driven sourcing workflows are not yet integrated.' },
            { pct: 7.5, label: 'Collaborative',        description: 'Supplier qualification workflows managed in Arena; BOM-linked AVL enables accurate RFQ data and reduces sourcing cycle time.' },
            { pct: 10,  label: 'Optimized',            description: 'Fully integrated sourcing workflows with Arena-driven AVL management, automated supplier notifications, and real-time compliance tracking.' }
          ]
        },

        // ── Step 7: Cost Recovery Benefits ────────────────────────────────────
        {
          id: 'reduceExpediting',
          label: 'Reduce Expediting Costs',
          row: 15,
          storeAs: 'decimal',
          step: 7,
          default: 6,
          min: 6,
          max: 25,
          unit: '%',
          lowAnchor: 'Fewer surprises from better BOM accuracy',
          highAnchor: 'Proactive change management eliminates most expediting',
          defaultInclude: true,
          suggestedPct: 12,
          maturityLevels: [
            { pct: 6,  label: 'Reactive',   description: 'Expediting driven by BOM errors and delayed change communication to manufacturing; high premium freight costs are a regular occurrence.' },
            { pct: 12, label: 'Improving',  description: 'Arena BOM accuracy and change notifications reduce most BOM-driven surprises; expediting declining but not yet eliminated.' },
            { pct: 19, label: 'Managed',    description: 'Proactive Arena change management and real-time supplier visibility significantly reduce unplanned shortages and last-minute procurement.' },
            { pct: 25, label: 'Proactive',  description: 'Real-time change propagation through Arena to manufacturing and supply chain virtually eliminates data-error-driven expediting.' }
          ]
        },
        {
          id: 'reduceScrapRework',
          label: 'Reduce Scrap & Rework',
          row: 16,
          storeAs: 'decimal',
          step: 7,
          default: 5,
          min: 5,
          max: 15,
          unit: '%',
          lowAnchor: 'Better documentation reduces build errors',
          highAnchor: 'Real-time ECO propagation, zero rework from stale BOMs',
          defaultInclude: true,
          suggestedPct: 8,
          maturityLevels: [
            { pct: 5,  label: 'Stale BOMs',  description: 'Manufacturing occasionally builds to outdated BOM revisions; scrap and rework driven by ECO communication gaps are a recurring cost.' },
            { pct: 8,  label: 'Improving',   description: 'Arena change management reduces most BOM-driven rework; legacy process gaps account for remaining scrap and rework occurrences.' },
            { pct: 12, label: 'Connected',   description: 'ECOs managed in Arena with clear effectivity dates; manufacturing consistently executes to the correct current product revision.' },
            { pct: 15, label: 'Zero Rework', description: 'Real-time ECO propagation and Arena-managed work instructions eliminate scrap and rework from stale product data entirely.' }
          ]
        },
        {
          id: 'reduceWarranty',
          label: 'Reduce Warranty & Service Costs',
          row: 17,
          storeAs: 'decimal',
          step: 7,
          default: 10,
          min: 10,
          max: 20,
          unit: '%',
          lowAnchor: 'Faster root cause analysis with complete product history',
          highAnchor: 'Proactive field issue prevention through quality integration',
          defaultInclude: true,
          suggestedPct: 13,
          maturityLevels: [
            { pct: 10, label: 'Faster Investigation', description: 'Arena product history enables faster root cause analysis for field failures, reducing time-to-resolution and repeat warranty claims.' },
            { pct: 13, label: 'Improving',            description: 'Better design-to-field traceability in Arena reduces investigation time and the rate of repeat failure occurrences.' },
            { pct: 17, label: 'Proactive',            description: 'Quality data linked to Arena product records enables pattern detection and proactive field issue resolution before failures escalate.' },
            { pct: 20, label: 'Warranty Excellence',  description: 'Closed-loop quality management with full product genealogy in Arena minimizes field failures and drives warranty costs to minimum.' }
          ]
        },
        {
          id: 'nonComplianceAvoidance',
          label: 'Non-Compliance Cost Avoidance',
          row: 18,
          storeAs: 'decimal',
          step: 7,
          default: 1,
          min: 1,
          max: 5,
          unit: '%',
          lowAnchor: 'Better audit readiness reduces minor penalty risk',
          highAnchor: 'Full compliance automation prevents major regulatory exposure',
          defaultInclude: true,
          suggestedPct: 2,
          maturityLevels: [
            { pct: 1,   label: 'Audit Ready',         description: 'Arena provides document history for audits; regulatory penalty risk is modestly reduced by improved record consistency and retrieval.' },
            { pct: 2,   label: 'Structured Evidence',  description: 'Compliance documentation consistently maintained in Arena significantly reduces audit preparation time and evidence-gathering effort.' },
            { pct: 3.5, label: 'Automated Compliance', description: 'Arena generates compliance reports automatically; substance alerts prevent non-compliant designs from reaching production undetected.' },
            { pct: 5,   label: 'Full Protection',      description: 'Proactive substance management, automated regulatory reporting, and complete compliance automation eliminate non-compliance cost exposure.' }
          ]
        },
        {
          id: 'reduceEOL',
          label: 'Reduce End of Life Costs',
          row: 19,
          storeAs: 'decimal',
          step: 7,
          default: 6,
          min: 6,
          max: 25,
          unit: '%',
          lowAnchor: 'Improved visibility into aging parts/products',
          highAnchor: 'Automated EOL alerts, proactive product transition management',
          defaultInclude: true,
          suggestedPct: 12,
          maturityLevels: [
            { pct: 6,  label: 'Reactive EOL',        description: 'EOL components identified late; unplanned redesigns and supply disruptions driven by component obsolescence are a recurring cost.' },
            { pct: 12, label: 'Improving Visibility', description: 'Arena flags known EOL components in item records; some proactive redesign initiated but management remains largely reactive.' },
            { pct: 19, label: 'Proactive Management', description: 'Arena integrates with component lifecycle data; EOL alerts trigger timely product transitions before availability impacts production.' },
            { pct: 25, label: 'Optimized',            description: 'Automated EOL monitoring across the full product portfolio drives proactive transitions and eliminates unplanned obsolescence costs entirely.' }
          ]
        }

      ]
    }
  };
}

/**
 * Returns only the config needed by the client-side wizard (no server internals).
 * Called via <?!= JSON.stringify(getWizardConfig()); ?> in Wizard.html
 */
function getWizardConfig() {
  var config = getSheetConfig();
  return {
    dataInputFields: config.dataInput.fields,
    benefitsFields: config.benefitsCalc.fields
  };
}
