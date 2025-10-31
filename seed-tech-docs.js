import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const technicalDocs = [
  {
    module_name: 'Reports Module - Column Visibility',
    category: 'Reports',
    description: 'Implemented dynamic column show/hide functionality for Product and Customer reports with real-time updates and click-outside detection.',
    tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
    implementation_details: `
# Component Architecture
- ReportsHeader: Manages column filter dropdown with click-outside detection using useRef and useEffect
- ProductReportTable: Conditionally renders table headers and cells based on column visibility
- CustomerReportTable: Implements same column visibility logic for customer view

# Key Features
- Real-time column visibility updates without closing dropdown
- Click-outside detection to close dropdown when clicking elsewhere
- Column configuration stored in state with ColumnConfig interface
- Smooth user experience with instant updates

# Files Modified
1. src/components/reports/ReportsHeader.tsx - Added refs and click-outside event listeners
2. src/components/reports/ProductReportTable.tsx - Added column visibility logic
3. src/pages/Reports.tsx - Pass column configuration to child components
    `.trim(),
    database_schema: {},
    api_endpoints: [],
    dependencies: ['react', 'lucide-react'],
    security_notes: 'No security concerns - purely frontend functionality',
    version: '1.1.0',
    status: 'Active',
    updated_by: 'System'
  },
  {
    module_name: 'Reports System',
    category: 'Reports',
    description: 'Comprehensive liquidation reporting system with Product, Customer, and MDO views. Supports filtering, pagination, and export functionality.',
    tech_stack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    implementation_details: `
# Architecture
Component-based design with clear separation of concerns:
- Reports.tsx: Main container with state management and data fetching
- ReportsHeader: View toggles, date filters, column filters
- ReportsFilters: Multi-select cascading filters for geography and products
- ProductReportTable: Product SKU view with aggregated metrics
- CustomerReportTable: Customer/outlet level transactions
- DistributorReportTable: MDO level with expandable outlet details

# Data Flow
1. Fetch from Supabase (distributor_inventory, mdo_summary, outlet_transactions)
2. Apply role-based filters (TSM, ZBH, MDO)
3. Client-side filtering by zone, region, state, territory, category, product
4. Pagination with 20 items per page
5. Real-time updates on filter changes

# Key Features
- Role-based data access
- Cascading filters (Zone -> Region -> State -> Territory)
- Multi-select filters with proper state management
- Search functionality across all views
- Export capabilities (handled by table components)
- Date range filtering
- Column show/hide
    `.trim(),
    database_schema: {
      tables: {
        distributor_inventory: ['id', 'distributor_id', 'product_code', 'sku_code', 'opening_value', 'opening_stock', 'ytd_sales_value', 'ytd_sales', 'balance_value', 'balance_stock', 'unit'],
        mdo_summary: ['id', 'mdo_id', 'mdo_name', 'zone', 'region', 'territory', 'opening_stock', 'ytd_sales', 'liquidation', 'balance_stock', 'outlet_count'],
        outlet_transactions: ['id', 'outlet_id', 'mdo_id', 'transaction_date', 'opening_stock', 'purchases', 'sales', 'liquidation', 'balance_stock']
      }
    },
    api_endpoints: [
      {
        method: 'GET',
        path: 'distributor_inventory.select()',
        description: 'Fetch product-level inventory data'
      },
      {
        method: 'GET',
        path: 'mdo_summary.select()',
        description: 'Fetch MDO-level summary data with role-based filtering'
      }
    ],
    dependencies: ['@supabase/supabase-js', 'react-router-dom', 'lucide-react'],
    security_notes: `
# RLS Policies
- Reports data restricted by user role and hierarchy
- TSM can only see their assigned territory
- ZBH can only see their zone
- MDO can only see their own data

# Frontend Security
- Role-based access control in ReportsFilters
- Query filters applied based on user.employeeCode
- No sensitive data exposed in client-side code
    `.trim(),
    version: '2.0.0',
    status: 'Active',
    updated_by: 'System'
  },
  {
    module_name: 'Liquidation Management',
    category: 'Liquidation',
    description: 'Stock verification and liquidation tracking system with distributor and retailer views. Supports batch updates, multi-SKU verification, and stock transfer workflows.',
    tech_stack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    implementation_details: `
# Core Components
- Liquidation.tsx: Main container with distributor-level view
- DistributorEntryCard: Individual distributor cards with metrics
- VerifyStockModal: Multi-SKU stock verification with photo proof
- BatchStockUpdateModal: Bulk stock updates for multiple SKUs
- LiquidationFilters: Geography and status filters
- LiquidationMetricsCards: Summary metrics display

# Verification Flow
1. User clicks "Verify Stock" on distributor card
2. Modal displays all SKUs for that distributor
3. User enters actual stock for each SKU
4. Upload proof documents (photos)
5. Calculate variances and liquidation percentages
6. Submit to database with timestamp

# Data Model
- distributor_inventory: Opening, YTD sales, balance stock
- stock_verification: Verification records with proof
- stock_transfers: Inter-distributor transfers

# Key Features
- Real-time stock updates
- Photo proof requirement for verification
- Automatic liquidation calculation
- Batch operations for efficiency
- Role-based access (TSM, ZBH, RMM, etc.)
- Pagination for large datasets
    `.trim(),
    database_schema: {
      tables: {
        distributor_inventory: ['id', 'distributor_id', 'product_code', 'sku_code', 'opening_stock', 'balance_stock', 'unit', 'period_start', 'period_end'],
        stock_verification: ['id', 'distributor_id', 'verified_by', 'verification_date', 'sku_verifications', 'proof_documents', 'status'],
        stock_transfers: ['id', 'from_distributor_id', 'to_distributor_id', 'product_code', 'sku_code', 'quantity', 'transfer_date', 'status']
      }
    },
    api_endpoints: [
      {
        method: 'GET',
        path: 'distributor_inventory.select()',
        description: 'Fetch inventory for all distributors'
      },
      {
        method: 'POST',
        path: 'stock_verification.insert()',
        description: 'Submit stock verification'
      },
      {
        method: 'PUT',
        path: 'distributor_inventory.update()',
        description: 'Update stock levels'
      }
    ],
    dependencies: ['@supabase/supabase-js', 'react', 'lucide-react'],
    security_notes: `
# Access Control
- Only TSM, RBH, RMM, ZBH, and higher roles can verify stock
- Verification records include verified_by for audit trail
- Proof documents required for all verifications

# Data Integrity
- Stock updates trigger automatic liquidation recalculation
- Validation ensures stock values are non-negative
- Concurrent update handling via Supabase transactions
    `.trim(),
    version: '3.0.0',
    status: 'Active',
    updated_by: 'System'
  },
  {
    module_name: 'Authentication System',
    category: 'Authentication',
    description: 'Role-based authentication system with 12+ role types and hierarchical access control.',
    tech_stack: ['React Context API', 'Local Storage', 'TypeScript'],
    implementation_details: `
# Architecture
- AuthContext: Centralized auth state management
- LoginForm: User authentication interface
- RoleBasedAccess: Component-level access control
- Mock authentication (localStorage-based)

# User Roles
1. MDO - Market Development Officer
2. TSM - Territory Sales Manager
3. RBH - Regional Business Head
4. RMM - Regional Marketing Manager
5. ZBH - Zonal Business Head
6. VP - Vice President
7. MD - Managing Director
8. CFO - Chief Financial Officer
9. CHRO - Chief Human Resources Officer
10. MH - Marketing Head
11. ADMIN - System Administrator

# Role Hierarchy
ADMIN > MD > CFO/CHRO/MH > VP > ZBH > RBH/RMM > TSM > MDO

# Authentication Flow
1. User enters employee code
2. System validates against mock user data
3. Create session with user profile
4. Store in localStorage and Context
5. Redirect to dashboard based on role

# Session Management
- Session persists in localStorage
- Auto-logout on token expiry
- Protected routes via useAuth hook
    `.trim(),
    database_schema: {},
    api_endpoints: [],
    dependencies: ['react', 'react-router-dom'],
    security_notes: `
# Current Implementation
- Mock authentication using localStorage (development only)
- No password encryption (mock data)
- Role-based access control enforced at component level

# Production Requirements
- Migrate to Supabase Auth
- Implement proper password hashing
- Add JWT token validation
- Enable RLS policies based on auth.uid()
- Add session timeout and refresh tokens
- Implement audit logging for auth events
    `.trim(),
    version: '1.0.0',
    status: 'In Development',
    updated_by: 'System'
  },
  {
    module_name: 'Database Architecture',
    category: 'Database',
    description: 'PostgreSQL database hosted on Supabase with RLS policies, comprehensive tables for inventory, transactions, work plans, and user management.',
    tech_stack: ['PostgreSQL', 'Supabase', 'SQL'],
    implementation_details: `
# Core Tables

## Inventory Management
- distributor_inventory: Product stock levels at distributor level
- retailer_inventory: Stock at retailer/outlet level
- stock_verification: Verification records with proof
- stock_transfers: Inter-location stock movements
- distributor_opening_stock: Historical opening stock records

## Transaction Tracking
- mdo_summary: Aggregated MDO performance metrics
- outlet_transactions: Outlet-level transaction history

## Work Planning
- work_plans: Monthly work plans for field teams
- work_plan_activities: Individual activities within work plans
- annual_work_plans (AWP): Yearly strategic plans

## Activity Management
- activity_reimbursement: Expense reimbursements
- travel_reimbursement: Travel expense claims

## Master Data
- outlets: Customer/retailer master data
- products: Product catalog
- users: User profiles (when migrated from mock data)

# Migration Strategy
- All migrations in supabase/migrations/
- Timestamped filenames for version control
- Idempotent migrations using IF NOT EXISTS
- Detailed comments in each migration
    `.trim(),
    database_schema: {
      core_tables: [
        'distributor_inventory',
        'retailer_inventory',
        'stock_verification',
        'stock_transfers',
        'mdo_summary',
        'outlet_transactions',
        'work_plans',
        'work_plan_activities',
        'activity_reimbursement',
        'outlets'
      ]
    },
    api_endpoints: [],
    dependencies: ['@supabase/supabase-js'],
    security_notes: `
# Row Level Security (RLS)
- All tables have RLS enabled
- Anonymous access allowed for development
- Production must restrict to authenticated users only
- Role-based policies needed for data isolation

# Data Protection
- No sensitive data in public schema
- Audit trails via created_at/updated_at timestamps
- Soft deletes preferred over hard deletes
- Foreign key constraints for referential integrity

# Security Recommendations
1. Enable authentication before production
2. Implement role-based RLS policies
3. Add audit logging table
4. Encrypt sensitive fields
5. Regular backup schedule
6. Monitor for SQL injection attempts
    `.trim(),
    version: '1.0.0',
    status: 'Active',
    updated_by: 'System'
  },
  {
    module_name: 'Frontend Architecture',
    category: 'Frontend',
    description: 'React-based SPA with TypeScript, component-driven architecture, and responsive design using Tailwind CSS.',
    tech_stack: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router'],
    implementation_details: `
# Project Structure
src/
├── components/          # Reusable UI components
│   ├── reports/        # Report-specific components
│   ├── liquidation/    # Liquidation module components
│   ├── activities/     # Activity tracking components
│   └── ui/            # Generic UI components (Modal, Loader, etc.)
├── pages/              # Route components
├── contexts/           # React Context providers
├── hooks/             # Custom React hooks
├── services/          # API services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── constants/         # Constants and config
└── data/              # Mock data

# Design Principles
1. Component Composition: Small, focused components
2. Single Responsibility: Each file has one clear purpose
3. Type Safety: Comprehensive TypeScript usage
4. Responsive Design: Mobile-first approach
5. Accessibility: ARIA labels and keyboard navigation

# State Management
- React Context for global state (Auth, Modal, Loader)
- Local state with useState for component-specific data
- useEffect for side effects and data fetching
- Custom hooks for reusable logic

# Routing
- React Router v7 for navigation
- Protected routes via auth check
- Role-based route access
- Nested routes for complex features

# Build & Deploy
- Vite for fast development and optimized production builds
- Code splitting for optimal bundle sizes
- Environment variables for configuration
- Static deployment (Netlify/Vercel compatible)
    `.trim(),
    database_schema: {},
    api_endpoints: [],
    dependencies: [
      'react',
      'react-dom',
      'react-router-dom',
      'typescript',
      'vite',
      'tailwindcss',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    security_notes: `
# Frontend Security
- No sensitive data in client-side code
- Environment variables for API keys
- XSS prevention via React's built-in escaping
- CSRF protection not needed (API-based)

# Best Practices
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement CSP headers
- Regular dependency updates
- Security audit via npm audit
    `.trim(),
    version: '1.0.0',
    status: 'Active',
    updated_by: 'System'
  }
];

async function seedDocumentation() {
  console.log('Starting technical documentation seeding...');

  try {
    for (const doc of technicalDocs) {
      console.log(`Inserting: ${doc.module_name}...`);

      const { data, error } = await supabase
        .from('technical_documentation')
        .insert([doc])
        .select();

      if (error) {
        console.error(`Error inserting ${doc.module_name}:`, error);
      } else {
        console.log(`✓ Successfully inserted: ${doc.module_name}`);
      }
    }

    console.log('\n✅ Technical documentation seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDocumentation();
