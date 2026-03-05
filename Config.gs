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
        // Step 5: Revenue & COGS Benefits
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
        },

        // Step 6: Productivity Benefits
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
        },

        // Step 7: Cost Recovery Benefits
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
          defaultInclude: true
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
