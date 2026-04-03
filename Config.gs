/**
 * Config.gs
 * Single source of truth for all cell mappings and field definitions.
 * Update this file if the spreadsheet structure changes.
 */

var SPREADSHEET_TABS = {
  DATA_INPUT: 'Data Input',
  BENEFITS_CALC: 'Benefits Calc',
  LEGACY_TCO: 'Legacy TCO'
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
      writeCol: 'E',
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
          currentDefault: 0,
          currentLowAnchor: 'Manual BOM approvals and email ECOs — every change costs weeks',
          currentHighAnchor: 'Highly digitized NPI today — approvals and changes move in days',
          defaultInclude: true,
          suggestedPct: 15,
          maturityLevels: [
            {
              pct: 10,
              label: 'Manual & Fragmented',
              description: 'Your NPD process relies on shared drives, email threads, and spreadsheet-based BOMs. Engineers spend significant time hunting for the latest revision, and most change orders stall waiting for offline approvals — adding weeks to every product launch.'
            },
            {
              pct: 17,
              label: 'Early PLM Adoption',
              description: 'Your team has moved core BOMs and documents into Arena, but many handoffs between engineering, procurement, and manufacturing are still manual. ECO cycle times have improved, though cross-functional reviews still bottleneck at stage gates.'
            },
            {
              pct: 23,
              label: 'Streamlined Workflows',
              description: 'Most product data flows through Arena with automated change routing and parallel reviews. Your NPI teams can launch design reviews faster, and suppliers receive change notifications directly — cutting weeks out of each development cycle.'
            },
            {
              pct: 30,
              label: 'Full Digital Thread',
              description: 'Your entire product lifecycle — from concept through manufacturing release — runs on a seamless digital thread in Arena. Real-time BOM visibility, automated phase-gate transitions, and integrated supplier collaboration enable your fastest possible time to market.'
            }
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
          currentDefault: 0,
          currentLowAnchor: 'Products routinely launch late — premium pricing windows consistently missed',
          currentHighAnchor: 'Reliably first to market today — premium windows captured without PLM',
          defaultInclude: true,
          suggestedPct: 1,
          maturityLevels: [
            {
              pct: 1,
              label: 'Marginal Recovery',
              description: 'Your products consistently launch behind schedule, eroding premium pricing windows. By the time you reach market, competitors have already established pricing pressure, leaving only modest margin recovery from slight cycle time gains.'
            },
            {
              pct: 1.5,
              label: 'Noticeable Advantage',
              description: 'Faster Arena-driven ECO cycles let you hit market windows more reliably. Your sales team can capture early-adopter pricing on roughly half of new launches, translating shorter development time into measurable margin improvement.'
            },
            {
              pct: 2.5,
              label: 'Consistent First-Mover',
              description: 'Your streamlined NPI process in Arena consistently beats competitor launch timelines. Product managers can plan premium pricing strategies with confidence, knowing engineering can deliver on aggressive schedules.'
            },
            {
              pct: 3,
              label: 'Market Leader Pricing',
              description: 'Your fully optimized Arena workflow enables you to be first to market on virtually every new product, commanding premium pricing and establishing market position before competitors can respond. Early launch margins are a reliable part of your revenue model.'
            }
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
          currentDefault: 0,
          currentLowAnchor: 'Engineers create duplicate parts freely — no part reuse visibility or controls',
          currentHighAnchor: 'Active catalogue discipline today — part reuse and spend consolidation strong',
          defaultInclude: true,
          suggestedPct: 1,
          maturityLevels: [
            {
              pct: 1,
              label: 'Duplicate-Heavy',
              description: 'Your engineers regularly create new part numbers for components that already exist because there is no easy way to search and discover reusable parts. Supplier negotiations happen in silos, and approved vendor lists live in disconnected spreadsheets.'
            },
            {
              pct: 1.5,
              label: 'Part Reuse Emerging',
              description: 'Arena\'s component library is giving engineers visibility into existing parts, reducing some duplicate creation. Your sourcing team is starting to leverage consolidated spend data to negotiate better pricing with key suppliers.'
            },
            {
              pct: 2.5,
              label: 'Active Spend Optimization',
              description: 'Your team actively uses Arena\'s part reuse analytics and AVL data to standardize components across product lines. Preferred parts lists drive design decisions, and commodity managers have real spend visibility for volume negotiations.'
            },
            {
              pct: 3,
              label: 'Strategic Sourcing',
              description: 'Full part reuse analytics in Arena drive every new design, virtually eliminating unnecessary new part creation. Cross-product standardization and data-driven supplier consolidation deliver maximum material cost savings across your entire portfolio.'
            }
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
          currentDefault: 0,
          currentLowAnchor: 'BOM errors force heavy safety stock — buffer driven by uncertainty, not demand',
          currentHighAnchor: 'Clean BOMs and accurate demand signal today — minimal buffer stock needed',
          defaultInclude: true,
          suggestedPct: 7,
          maturityLevels: [
            {
              pct: 5,
              label: 'Buffer-Heavy',
              description: 'Your warehouse carries excessive safety stock because BOM inaccuracies and last-minute ECOs make demand unpredictable. Purchasing over-orders "just in case," and no one has clear visibility into which parts are approaching obsolescence.'
            },
            {
              pct: 8,
              label: 'Improving Accuracy',
              description: 'With Arena managing your BOMs, purchasing receives more accurate component lists, reducing over-ordering. However, change propagation delays still cause occasional mismatches between what engineering releases and what procurement buys.'
            },
            {
              pct: 12,
              label: 'Demand-Aligned',
              description: 'Real-time BOM accuracy from Arena means procurement orders align closely with actual build requirements. Your team proactively identifies slow-moving inventory tied to upcoming design changes, significantly reducing carrying costs.'
            },
            {
              pct: 15,
              label: 'Optimized Inventory',
              description: 'Arena\'s lifecycle visibility gives you proactive obsolescence alerts and automated change propagation to purchasing. Buffer stock is minimized, excess is near zero, and every inventory dollar is tied to a confirmed production requirement.'
            }
          ]
        },
        {
          id: 'reduceCMMaterial',
          label: 'Reduce CM Material Spend',
          row: 7,
          storeAs: 'decimal',
          step: 5,
          default: 3,
          min: 3,
          max: 8,
          unit: '%',
          lowAnchor: 'Better CM collaboration, reduced re-orders',
          highAnchor: 'Tight CM integration with shared BOM, real-time change propagation',
          currentDefault: 0,
          currentLowAnchor: 'CMs work from emailed PDFs — revision mismatches and re-orders are frequent',
          currentHighAnchor: 'CMs have near-real-time data access today — material waste is minimal',
          defaultInclude: true,
          suggestedPct: 5,
          maturityLevels: [
            {
              pct: 3,
              label: 'Disconnected CMs',
              description: 'Your contract manufacturers work from emailed BOM exports and PDF drawings that are often out of date. Revision mismatches cause CMs to order wrong components, leading to costly re-orders, excess inventory at the CM, and production delays.'
            },
            {
              pct: 5,
              label: 'Shared Access',
              description: 'CMs now have read access to current BOMs in Arena, reducing the worst revision mismatch issues. However, change notification delivery and CM acknowledgment tracking are still inconsistent, causing occasional material waste.'
            },
            {
              pct: 6.5,
              label: 'Active Collaboration',
              description: 'Your CMs receive automated change notifications from Arena and can flag material concerns before builds start. Shared AVL data ensures CMs source from approved suppliers, and component substitution requests flow through a controlled process.'
            },
            {
              pct: 8,
              label: 'Fully Integrated CMs',
              description: 'Your contract manufacturers operate from the same real-time BOM data in Arena that your engineering team uses. Change propagation is instant, material procurement is perfectly synchronized with design releases, and CM material waste is virtually eliminated.'
            }
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
          currentDefault: 1,
          currentLowAnchor: 'Engineers spend hours per week hunting for the correct BOM or drawing revision',
          currentHighAnchor: 'Existing tools give strong data access today — minimal search overhead',
          defaultInclude: true,
          suggestedPct: 2,
          maturityLevels: [
            {
              pct: 1,
              label: 'Search & Wait',
              description: 'Your development engineers spend hours each week hunting for the correct BOM revision, chasing email chains for approval status, and manually reconciling document versions. Tribal knowledge determines who has the "real" latest file.'
            },
            {
              pct: 2,
              label: 'Centralized Data',
              description: 'Engineers now go to Arena as the single source of truth for BOMs and specifications. Time spent searching for documents has dropped significantly, though some teams still maintain shadow copies on local drives out of habit.'
            },
            {
              pct: 3.5,
              label: 'Automated Workflows',
              description: 'Arena\'s automated change notifications ensure every engineer knows immediately when a relevant BOM or spec changes. Cross-functional design reviews run through structured workflows, eliminating meeting-heavy review cycles and email bottlenecks.'
            },
            {
              pct: 5,
              label: 'Zero Friction',
              description: 'Your development team operates at peak efficiency with fully automated change routing, real-time collaboration across disciplines, and zero duplicate work. Engineers spend virtually all their time on value-add design work rather than administrative overhead.'
            }
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
          currentDefault: 15,
          currentLowAnchor: 'Fully manual routing — paper trails, shared drives, chasing approvers by email',
          currentHighAnchor: 'Existing workflow tools cover most release automation today',
          defaultInclude: true,
          suggestedPct: 25,
          maturityLevels: [
            {
              pct: 15,
              label: 'Paper-Burdened',
              description: 'Your engineering services team spends most of their time manually routing documents for signatures, maintaining folder structures on shared drives, and chasing down approvers. Release packages are assembled by hand, and version control depends on file naming conventions.'
            },
            {
              pct: 28,
              label: 'Digital Foundation',
              description: 'Arena handles document storage and basic revision control, freeing your team from shared-drive chaos. Release workflows are partially automated, but some approval routing and document packaging still requires manual intervention and follow-up emails.'
            },
            {
              pct: 50,
              label: 'Mostly Automated',
              description: 'Most release workflows in Arena run end-to-end with automated routing, e-signatures, and built-in audit trails. Your doc management team focuses on process improvement rather than manual routing, and release cycle times have dropped dramatically.'
            },
            {
              pct: 65,
              label: 'Fully Self-Service',
              description: 'Document release workflows are fully automated in Arena with e-signatures, auto-generated release packages, and zero manual routing. Your engineering services team has been redeployed to higher-value process optimization work because the system manages itself.'
            }
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
          currentDefault: 18,
          currentLowAnchor: 'All data requests route through engineering — zero self-service exists today',
          currentHighAnchor: 'Consumers find data independently today — strong self-service culture in place',
          defaultInclude: true,
          suggestedPct: 30,
          maturityLevels: [
            {
              pct: 18,
              label: 'Request & Wait',
              description: 'Your manufacturing, purchasing, and quality teams constantly interrupt engineers to get the latest BOM, drawing, or spec. Data requests go through email or hallway conversations, and consumers never quite trust that what they have is current.'
            },
            {
              pct: 38,
              label: 'Basic Self-Service',
              description: 'Product data consumers can now look up BOMs and documents in Arena themselves, eliminating most ad-hoc requests to engineering. Search time has dropped significantly, though some users still struggle with finding exactly what they need without help.'
            },
            {
              pct: 65,
              label: 'Confident Access',
              description: 'Your cross-functional teams confidently pull product data from Arena whenever they need it. Role-based views show each consumer exactly the data relevant to their function, and automated notifications alert them when changes affect their work.'
            },
            {
              pct: 90,
              label: 'Full Self-Service',
              description: 'Every product data consumer across your organization has instant, role-appropriate access to exactly the data they need in Arena. Zero manual data requests, zero stale information, and zero engineering interruptions — manufacturing, quality, and procurement operate from a single trusted source.'
            }
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
          currentDefault: 1,
          currentLowAnchor: 'CAD and BOMs are completely disconnected — all BOM entry is manual and error-prone',
          currentHighAnchor: 'Existing CAD integration handles most BOM sync today — minimal manual entry',
          defaultInclude: true,
          suggestedPct: 1,
          maturityLevels: [
            {
              pct: 1,
              label: 'Disconnected CAD',
              description: 'Your CAD designers work in isolation from PLM data, manually re-entering BOM information and searching local drives for reusable models. Redesigns are common because designers unknowingly duplicate existing components or work from outdated reference models.'
            },
            {
              pct: 1.5,
              label: 'Linked Libraries',
              description: 'Arena\'s component library is accessible from the CAD environment, helping designers find and reuse existing parts. BOM data still requires some manual synchronization, but fewer redesigns occur thanks to better visibility into what already exists.'
            },
            {
              pct: 2.5,
              label: 'Bi-Directional Sync',
              description: 'Your CAD tools sync bi-directionally with Arena, automatically populating BOM structures from design assemblies. Designers spend less time on data entry and more time on creative design work, with confidence that their BOMs are always accurate.'
            },
            {
              pct: 3,
              label: 'Full CAD-PLM Fusion',
              description: 'Your CAD-to-Arena integration is seamless — BOM population is automatic, part reuse is guided by real-time analytics, and designers never leave their CAD environment to interact with PLM data. Design efficiency is maximized with zero manual BOM management overhead.'
            }
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
          currentDefault: 4,
          currentLowAnchor: 'CAPAs tracked in spreadsheets — quality data disconnected from product records',
          currentHighAnchor: 'Strong quality system with product linkage today — good investigation efficiency',
          defaultInclude: true,
          suggestedPct: 7,
          maturityLevels: [
            {
              pct: 4,
              label: 'Reactive & Manual',
              description: 'Your quality team tracks CAPAs in spreadsheets or standalone databases disconnected from product data. Root cause investigations require manually pulling records from multiple systems, and linking a quality event back to a specific BOM revision is time-consuming detective work.'
            },
            {
              pct: 9,
              label: 'Connected Records',
              description: 'Quality events are now linked to specific items and revisions in Arena, making root cause investigation faster. CAPA initiation is streamlined, though some workflow steps like review assignments and escalations still require manual coordination.'
            },
            {
              pct: 14,
              label: 'Automated CAPA',
              description: 'CAPA workflows run through Arena with automated assignments, escalation rules, and deadline tracking. Your quality team can trace any field issue back through the complete change history to pinpoint exactly when and why the problem was introduced.'
            },
            {
              pct: 20,
              label: 'Closed-Loop Quality',
              description: 'Your quality management system is fully integrated with Arena\'s product record. CAPAs automatically trigger change requests, corrective actions link directly to updated BOMs, and quality metrics provide real-time visibility into systemic issues — a true closed-loop system.'
            }
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
          currentDefault: 2,
          currentLowAnchor: 'Compliance tracked in email and spreadsheets — audit prep takes days or weeks',
          currentHighAnchor: 'Mature compliance program in place today — near-automated reporting already',
          defaultInclude: true,
          suggestedPct: 5,
          maturityLevels: [
            {
              pct: 2,
              label: 'Audit Scramble',
              description: 'Your compliance team dreads audits because assembling the required documentation means pulling records from multiple systems, shared drives, and email archives. Proving that correct approvals happened in the right sequence takes days of manual evidence gathering.'
            },
            {
              pct: 7,
              label: 'Centralized Trails',
              description: 'Arena provides a complete audit trail for product changes, significantly reducing audit preparation time. Your compliance team can generate basic reports, though substance compliance tracking (RoHS, REACH, Conflict Minerals) still relies on supplier spreadsheets.'
            },
            {
              pct: 14,
              label: 'Proactive Monitoring',
              description: 'Your team uses Arena to proactively monitor regulatory compliance across your product portfolio. Substance data is tracked at the component level, and automated alerts flag potential issues before they become violations — shifting from reactive to preventive compliance.'
            },
            {
              pct: 20,
              label: 'Automated Compliance',
              description: 'Compliance reporting is fully automated in Arena with real-time substance tracking, automated regulatory alerts, and audit-ready documentation generated on demand. Your compliance team focuses on strategy and emerging regulations rather than manual report assembly.'
            }
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
          currentDefault: 3,
          currentLowAnchor: 'Supplier AVLs live in spreadsheets — disconnected from product data entirely',
          currentHighAnchor: 'Strong supplier management system with solid product linkage today',
          defaultInclude: true,
          suggestedPct: 4,
          maturityLevels: [
            {
              pct: 3,
              label: 'Spreadsheet Sourcing',
              description: 'Your sourcing team maintains approved vendor lists in spreadsheets that quickly go stale. Qualifying a new supplier means emailing forms back and forth, and there is no reliable way to see which products depend on a supplier who just raised prices or reported a quality issue.'
            },
            {
              pct: 5,
              label: 'Centralized AVLs',
              description: 'Approved vendor lists now live in Arena alongside part data, giving sourcing teams a single place to check supplier status. New supplier qualification workflows are partially automated, though some steps still require manual follow-up.'
            },
            {
              pct: 7.5,
              label: 'Integrated Workflows',
              description: 'Sourcing workflows in Arena integrate with engineering change processes, so your team is automatically involved when component changes affect supplier selection. Impact analysis for supplier disruptions takes minutes instead of days.'
            },
            {
              pct: 10,
              label: 'Strategic Sourcing',
              description: 'Your sourcing function runs on fully integrated Arena workflows with automated AVL management, real-time supplier performance data, and instant impact analysis. Every sourcing decision is informed by live product data, enabling truly strategic supplier management.'
            }
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
          currentDefault: 6,
          currentLowAnchor: 'Constant fire drills — BOM errors and revision surprises drive regular expediting',
          currentHighAnchor: 'Disciplined process today — expediting events are already rare without Arena',
          defaultInclude: true,
          suggestedPct: 10,
          maturityLevels: [
            {
              pct: 6,
              label: 'Constant Fire Drills',
              description: 'Your operations team is perpetually expediting because late-breaking BOM changes and revision mismatches cause material shortages on the production line. Premium freight charges and supplier rush fees are a regular line item that everyone accepts as "normal."'
            },
            {
              pct: 12,
              label: 'Fewer Surprises',
              description: 'Better BOM accuracy through Arena means fewer unexpected shortages and build stoppages. Expediting still happens, but it is now driven by genuine demand changes rather than internal data errors and revision confusion.'
            },
            {
              pct: 19,
              label: 'Proactive Planning',
              description: 'Arena\'s change management process gives procurement early visibility into upcoming BOM changes, enabling proactive material planning. Your team orders ahead of changes rather than scrambling after them, and expediting costs have dropped dramatically.'
            },
            {
              pct: 25,
              label: 'Near-Zero Expediting',
              description: 'Your fully integrated Arena change process ensures procurement, manufacturing, and suppliers all see changes simultaneously as they are approved. Material planning is perfectly synchronized with design releases, virtually eliminating surprise expediting events.'
            }
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
          currentDefault: 5,
          currentLowAnchor: 'Regular build-to-wrong-revision events today — scrap and rework are weekly',
          currentHighAnchor: 'Clean change communication today — production always uses the latest data',
          defaultInclude: true,
          suggestedPct: 7,
          maturityLevels: [
            {
              pct: 5,
              label: 'Build-to-Wrong-Rev',
              description: 'Your manufacturing floor regularly builds to outdated BOMs or drawings because change notifications arrive late or get lost in email. Scrap bins fill with components that were correct last month but are now superseded, and rework is a weekly occurrence.'
            },
            {
              pct: 8,
              label: 'Fewer Rev Errors',
              description: 'Arena ensures the production floor always has access to the latest released BOM and work instructions. Build-to-wrong-revision errors have dropped significantly, though some rework still occurs from changes that were in-flight when builds started.'
            },
            {
              pct: 12,
              label: 'Change-Aware Builds',
              description: 'Manufacturing receives advance notice of pending changes through Arena, enabling them to plan material usage and build schedules around upcoming ECOs. Rework from stale data is rare, and scrap is primarily limited to normal process variation.'
            },
            {
              pct: 15,
              label: 'Zero Stale-Data Scrap',
              description: 'Real-time ECO propagation through Arena ensures manufacturing, suppliers, and quality all transition to new revisions simultaneously. Scrap and rework caused by stale BOMs or miscommunicated changes is virtually zero — only process-inherent variation remains.'
            }
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
          currentDefault: 10,
          currentLowAnchor: 'Field failures traced reactively — root cause is slow, same issues recur',
          currentHighAnchor: 'Strong service records with product linkage today — fast traceability, low recurrence',
          defaultInclude: true,
          suggestedPct: 12,
          maturityLevels: [
            {
              pct: 10,
              label: 'Reactive Service',
              description: 'When field failures occur, your service team struggles to determine which revision of which component is in the affected units. Root cause analysis is slow because product history is scattered across multiple systems, and the same failure modes often recur because corrective actions are not systematically linked back to design changes.'
            },
            {
              pct: 13,
              label: 'Traceable History',
              description: 'Arena\'s complete product record lets your service team quickly identify exactly which components and revisions are in affected units. Root cause analysis time has improved, and service engineers can access the full change history to understand why a design was modified.'
            },
            {
              pct: 17,
              label: 'Predictive Response',
              description: 'Your team uses Arena\'s quality and change data to identify products at risk before field failures occur. When a supplier quality issue is detected, you can instantly determine which finished goods are affected and proactively schedule service interventions.'
            },
            {
              pct: 20,
              label: 'Proactive Prevention',
              description: 'Arena\'s closed-loop integration of quality data, change history, and field service records enables true proactive warranty cost prevention. Patterns are caught early, corrective actions automatically trigger design improvements, and field failure rates steadily decline with each product generation.'
            }
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
          currentDefault: 1,
          currentLowAnchor: 'Compliance gaps found during audits — reactive posture, exposed to penalties',
          currentHighAnchor: 'Proactive monitoring in place today — regulatory exposure already minimal',
          defaultInclude: true,
          suggestedPct: 2,
          maturityLevels: [
            {
              pct: 1,
              label: 'Exposed & Unaware',
              description: 'Your team has limited visibility into regulatory compliance status across the product portfolio. Substance declarations from suppliers arrive as email attachments that may or may not get filed properly. You learn about compliance gaps reactively — often during audits or customer inquiries.'
            },
            {
              pct: 2,
              label: 'Basic Tracking',
              description: 'Arena provides a centralized record of approvals and change history, making audits less painful. Basic regulatory tracking is in place, but substance-level compliance (RoHS, REACH, Prop 65) still depends on periodic manual reviews of supplier data.'
            },
            {
              pct: 3.5,
              label: 'Active Monitoring',
              description: 'Your compliance program uses Arena to actively monitor substance declarations, track regulatory deadlines, and flag at-risk components before they become violations. Audit preparation that once took weeks now takes hours, and surprise findings are rare.'
            },
            {
              pct: 5,
              label: 'Full Prevention',
              description: 'Arena\'s automated compliance engine continuously validates your entire product portfolio against current regulations. Real-time substance alerts, automated supplier declaration collection, and proactive regulatory change tracking ensure you never face a non-compliance event.'
            }
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
          currentDefault: 6,
          currentLowAnchor: 'EOL notices arrive too late — panicked last-time buys and rushed redesigns',
          currentHighAnchor: 'Strong lifecycle tracking today — EOL transitions planned months in advance',
          defaultInclude: true,
          suggestedPct: 10,
          maturityLevels: [
            {
              pct: 6,
              label: 'Blindsided by EOL',
              description: 'Your team discovers component end-of-life notices too late — often after a supplier has already discontinued a part. Last-time buys are panicked and oversized, and redesigns to qualify alternate components are rushed, expensive, and disruptive to production schedules.'
            },
            {
              pct: 12,
              label: 'Improving Visibility',
              description: 'Arena gives your team better visibility into component lifecycle status, so EOL surprises happen less frequently. However, monitoring is still somewhat manual, and the impact analysis to determine which products are affected by a component EOL still takes significant effort.'
            },
            {
              pct: 19,
              label: 'Proactive Transitions',
              description: 'Your team uses Arena to proactively track component lifecycle data and plan product transitions well ahead of EOL dates. Impact analysis is fast — you know instantly which products use an at-risk component — and alternate qualification starts early.'
            },
            {
              pct: 25,
              label: 'Automated EOL Mgmt',
              description: 'Arena\'s automated lifecycle alerts and where-used analysis give you months of advance notice for every component EOL event. Product transitions are planned, orderly, and cost-optimized. Last-time buys are precisely sized, and alternate components are pre-qualified — EOL is a managed process, not a crisis.'
            }
          ]
        }

      ]
    },

    // ── Legacy TCO Tab ────────────────────────────────────────────────────────
    // Structure (confirmed via SheetAudit):
    //   E3  = On-prem / Perpetual license toggle (Yes/No dropdown)
    //   Row 4 = Column headers (Type, Expenses, Unit Cost, Qty, Total, Include in TCO, Total Ann.)
    //   Rows 5–11 = Line items:
    //     C{row} = Unit Cost ($)   — yellow input
    //     D{row} = Qty             — yellow input (count or decimal multiplier)
    //     F{row} = Include in TCO  — yellow Yes/No dropdown
    //   G12 = Legacy System Total Annual Costs (formula)
    legacyTco: {
      tab: SPREADSHEET_TABS.LEGACY_TCO,
      unitCostCol: 'C',
      qtyCol: 'D',
      includeCol: 'F',
      onPremCell: 'E3',
      rows: [
        {
          id: 'legacySoftware',
          label: 'PLM/QMS License / Subscriptions',
          row: 5,
          qtyLabel: '# of users/seats',
          qtyStoreAs: 'number',
          qtyDefault: null,
          defaultInclude: false,
          hint: 'Per-seat annual license fee for current PLM/QMS system'
        },
        {
          id: 'legacySoftwareSupport',
          label: 'Annual Support & Maintenance',
          row: 6,
          qtyLabel: '% of license cost',
          qtyStoreAs: 'decimal',
          qtyDefault: 20,
          defaultInclude: true,
          hint: 'Annual support contract — typically 18–22% of license cost'
        },
        {
          id: 'legacyIntegrations',
          label: 'CAD, ERP & Other Connectors',
          row: 7,
          qtyLabel: 'Count',
          qtyStoreAs: 'number',
          qtyDefault: 1,
          defaultInclude: true,
          hint: 'Annual cost per integration connector (CAD, ERP, Reporting tools)'
        },
        {
          id: 'legacyInfrastructure',
          label: 'Hosting, Backup & Security',
          row: 8,
          qtyLabel: '% of license cost',
          qtyStoreAs: 'decimal',
          qtyDefault: 10,
          defaultInclude: true,
          hint: 'IT infrastructure: servers, backup, security, managed services'
        },
        {
          id: 'legacyMaintenance',
          label: 'IT Resources & Labor',
          row: 9,
          qtyLabel: '% of infra cost',
          qtyStoreAs: 'decimal',
          qtyDefault: 10,
          defaultInclude: true,
          hint: 'Internal IT staff time: BDA, admin, hardware support'
        },
        {
          id: 'legacyUpgrades',
          label: 'Hardware, Software & Training',
          row: 10,
          qtyLabel: 'Count',
          qtyStoreAs: 'number',
          qtyDefault: 1,
          defaultInclude: true,
          hint: 'Annual upgrade costs: hardware refreshes, software updates, training'
        },
        {
          id: 'legacyOtherSubs',
          label: 'Other Subscriptions',
          row: 11,
          qtyLabel: 'Count',
          qtyStoreAs: 'number',
          qtyDefault: 1,
          defaultInclude: true,
          hint: 'Other third-party tools (e.g. SiliconExpert, component intelligence)'
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
    benefitsFields: config.benefitsCalc.fields,
    legacyTcoRows: config.legacyTco.rows,
    legacyTcoOnPremCell: config.legacyTco.onPremCell
  };
}
