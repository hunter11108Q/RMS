# RMS Enterprise Database Design & Data Architecture Blueprint

This document serves as the official enterprise database architecture blueprint for the Restaurant Management System (RMS). It outlines naming conventions, core data type maps, complete physical tables design, relations schemas, indexing strategies, audit models, and synchronization architectures.

---

## 1. Naming Conventions & Baseline Data Types

### Naming Standards
- **Tables**: All table names must be plural and snake_case (e.g. `menu_items`, `audit_logs`).
- **Columns**: Column names must be singular and snake_case (e.g. `order_type`, `unit_price`).
- **Primary Keys**: Named `id` using the `UUIDv4` standard format.
- **Foreign Keys**: Named `<singular_referenced_table_name>_id` (e.g. `branch_id`, `role_id`).
- **Indexes**: Prefix `idx_<table_name>_<columns>` (e.g. `idx_orders_branch_status`).
- **Unique Constraints**: Prefix `uq_<table_name>_<columns>` (e.g. `uq_users_username`).
- **Check Constraints**: Prefix `chk_<table_name>_<columns>` (e.g. `chk_order_total_positive`).

### Standard Database Types Map (PostgreSQL)

| Data Class | Recommended Type | Rationale |
| :--- | :--- | :--- |
| **Identifications (IDs)** | `UUID` | Prevents collision across offline sync nodes, provides tenant obfuscation. |
| **Monetary / Money / Pricing** | `NUMERIC(12, 4)` | Avoids float rounding errors, allows precise inventory unit cost (e.g. ₹0.2345/gram). |
| **Quantity counts** | `NUMERIC(12, 4)` | Supports partial counts in inventory stock (e.g. 1.250 kg of chicken). |
| **Timestamps** | `TIMESTAMP WITH TIME ZONE` | Ensures accurate audit timings across branches running in different time zones. |
| **Text fields** | `VARCHAR(N)` | Enforces memory efficiency for structured strings. |
| **JSON metadata** | `JSONB` | Supports indexable, flexible schemaless attributes (e.g., config changes, raw logs). |

---

## 2. Core Modules Physical Table Designs

Below are the table designs grouped by logical domain modules. All tables contain audit hooks: `created_at` and `updated_at` timestamps.

---

### Module 2.1: Tenants & Restaurants (Multi-Branch SaaS Root)

#### 2.1.1 `tenants`
- **Purpose**: Enforces SaaS multi-tenancy logical isolation.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `name VARCHAR(100) NOT NULL`
  - `plan_id UUID NOT NULL` (FK -> `subscription_plans`)
  - `status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL` (Constraint: `ACTIVE`, `SUSPENDED`, `CANCELLED`)
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.1.2 `subscription_plans`
- **Purpose**: Defines system capabilities, branch caps, and licensing.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `name VARCHAR(50) UNIQUE NOT NULL`
  - `price NUMERIC(10, 2) NOT NULL`
  - `max_branches INT NOT NULL`
  - `max_users INT NOT NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.1.3 `restaurants`
- **Purpose**: Profile entity mapping a business under a tenant.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `tenant_id UUID NOT NULL` (FK -> `tenants` ON DELETE RESTRICT)
  - `name VARCHAR(100) NOT NULL`
  - `logo_url VARCHAR(255) NULL`
  - `tax_id VARCHAR(50) NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.1.4 `branches`
- **Purpose**: Physical locations, cloud kitchens, or bars belonging to a restaurant.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `restaurant_id UUID NOT NULL` (FK -> `restaurants` ON DELETE RESTRICT)
  - `name VARCHAR(100) NOT NULL`
  - `code VARCHAR(20) UNIQUE NOT NULL` (e.g. `MUM-01`, `PNE-02`)
  - `city VARCHAR(50) NOT NULL`
  - `address TEXT NOT NULL`
  - `phone VARCHAR(20) NOT NULL`
  - `email VARCHAR(100) NOT NULL`
  - `tax_registration_number VARCHAR(50) NOT NULL` (GSTIN/PAN)
  - `status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.1.5 `printers`
- **Purpose**: Local hardware setups mapped by branch.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(100) NOT NULL`
  - `type VARCHAR(50) NOT NULL` (Constraint: `KOT`, `RECEIPT`, `BARCODE`)
  - `connection_type VARCHAR(20) NOT NULL` (Constraint: `USB`, `NETWORK`, `BLUETOOTH`)
  - `ip_address VARCHAR(45) NULL`
  - `port INT DEFAULT 9100 NULL`
  - `is_active BOOLEAN DEFAULT TRUE NOT NULL`

---

### Module 2.2: Users, Roles, Permissions & Shifts

#### 2.2.1 `roles`
- **Purpose**: Configurable roles mapping access parameters.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `tenant_id UUID NOT NULL` (FK -> `tenants` ON DELETE CASCADE)
  - `name VARCHAR(50) NOT NULL`
  - `description VARCHAR(255) NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - **Constraints**: Composite unique `uq_roles_tenant_name(tenant_id, name)`.

#### 2.2.2 `permissions`
- **Purpose**: Fine-grained access parameters.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `name VARCHAR(50) UNIQUE NOT NULL` (e.g. `BILL_VOID`, `DISCOUNT_OVERRIDE`)
  - `module VARCHAR(50) NOT NULL`
  - `description VARCHAR(255) NULL`

#### 2.2.3 `role_permissions`
- **Purpose**: Many-to-many role permissions resolver.
- **Primary Key**: Composite `(role_id, permission_id)`
- **Columns**:
  - `role_id UUID NOT NULL` (FK -> `roles` ON DELETE CASCADE)
  - `permission_id UUID NOT NULL` (FK -> `permissions` ON DELETE CASCADE)

#### 2.2.4 `users`
- **Purpose**: Account entity for all staff and owners.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `tenant_id UUID NOT NULL` (FK -> `tenants` ON DELETE RESTRICT)
  - `username VARCHAR(50) NOT NULL`
  - `password_hash VARCHAR(255) NOT NULL`
  - `email VARCHAR(100) NOT NULL`
  - `status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL`
  - `role_id UUID NOT NULL` (FK -> `roles` ON DELETE RESTRICT)
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - **Constraints**: Unique `uq_users_username_tenant(tenant_id, username)`.

#### 2.2.5 `user_sessions`
- **Purpose**: Session registry tracking JWT refresh tokens.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `user_id UUID NOT NULL` (FK -> `users` ON DELETE CASCADE)
  - `refresh_token VARCHAR(500) UNIQUE NOT NULL`
  - `ip_address VARCHAR(45) NULL`
  - `user_agent VARCHAR(255) NULL`
  - `expires_at TIMESTAMP WITH TIME ZONE NOT NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.2.6 `employees`
- **Purpose**: Operational profile for staff members.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `user_id UUID UNIQUE NULL` (FK -> `users` ON DELETE SET NULL)
  - `first_name VARCHAR(50) NOT NULL`
  - `last_name VARCHAR(50) NOT NULL`
  - `phone VARCHAR(20) NOT NULL`
  - `email VARCHAR(100) NULL`
  - `base_salary NUMERIC(10, 2) DEFAULT 0.00 NOT NULL`
  - `commission_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL` (Percentage)
  - `status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL`
  - `deleted_at TIMESTAMP WITH TIME ZONE NULL`

#### 2.2.7 `shifts`
- **Purpose**: Standard shift timings setup.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(50) NOT NULL`
  - `start_time TIME NOT NULL`
  - `end_time TIME NOT NULL`

#### 2.2.8 `attendance_logs`
- **Purpose**: Operational shifts clock-in logs.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `employee_id UUID NOT NULL` (FK -> `employees` ON DELETE CASCADE)
  - `shift_id UUID NOT NULL` (FK -> `shifts` ON DELETE RESTRICT)
  - `date DATE NOT NULL`
  - `clock_in TIMESTAMP WITH TIME ZONE NOT NULL`
  - `clock_out TIMESTAMP WITH TIME ZONE NULL`
  - `gps_coordinates VARCHAR(100) NULL`

---

### Module 2.3: Customers, Loyalty & Credits

#### 2.3.1 `customers`
- **Purpose**: Guest database for profile and credits tracing.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `tenant_id UUID NOT NULL` (FK -> `tenants` ON DELETE RESTRICT)
  - `name VARCHAR(100) NOT NULL`
  - `phone VARCHAR(20) UNIQUE NOT NULL`
  - `email VARCHAR(100) NULL`
  - `credit_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL`
  - `loyalty_points INT DEFAULT 0 NOT NULL`
  - `birth_date DATE NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - `deleted_at TIMESTAMP WITH TIME ZONE NULL`

#### 2.3.2 `customer_visits`
- **Purpose**: Tracks occupancy counters and feedback scores.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `customer_id UUID NOT NULL` (FK -> `customers` ON DELETE CASCADE)
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `order_id UUID NULL` (FK -> `orders`)
  - `feedback_score INT NULL` (Constraint: `1-5` star check)
  - `feedback_text TEXT NULL`
  - `visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.3.3 `loyalty_ledger`
- **Purpose**: Points transaction history.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `customer_id UUID NOT NULL` (FK -> `customers` ON DELETE CASCADE)
  - `points_earned INT DEFAULT 0 NOT NULL`
  - `points_redeemed INT DEFAULT 0 NOT NULL`
  - `description VARCHAR(255) NULL`
  - `order_id UUID NULL`
  - `transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.3.4 `credit_logs`
- **Purpose**: Audit trails for prepaid customer credits.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `customer_id UUID NOT NULL` (FK -> `customers` ON DELETE CASCADE)
  - `amount_changed NUMERIC(10, 2) NOT NULL`
  - `type VARCHAR(10) NOT NULL` (Constraint: `CREDIT`, `DEBIT`)
  - `reason VARCHAR(255) NOT NULL`
  - `order_id UUID NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

---

### Module 2.4: Floor & Seating Layout

#### 2.4.1 `floors`
- **Purpose**: Defines levels / zones in a branch (e.g. Ground Floor, Rooftop).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(50) NOT NULL`
  - `level INT DEFAULT 0 NOT NULL`
  - `is_active BOOLEAN DEFAULT TRUE NOT NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`
    - `sync_status VARCHAR(20) DEFAULT 'SYNCED' NOT NULL`

#### 2.4.2 `tables`
- **Purpose**: Dining tables mapping.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `floor_id UUID NOT NULL` (FK -> `floors` ON DELETE CASCADE)
  - `number VARCHAR(10) NOT NULL`
  - `seating_capacity INT NOT NULL`
  - `status VARCHAR(20) DEFAULT 'AVAILABLE' NOT NULL` (Constraint: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `DIRTY`)
  - `current_order_id UUID NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`
    - `sync_status VARCHAR(20) DEFAULT 'SYNCED' NOT NULL`
  - **Constraints**: Composite unique `uq_tables_floor_number(floor_id, number)`.

#### 2.4.3 `table_bookings`
- **Purpose**: Advance seat booking management.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `table_id UUID NOT NULL` (FK -> `tables` ON DELETE CASCADE)
  - `customer_id UUID NOT NULL` (FK -> `customers` ON DELETE RESTRICT)
  - `booking_time TIMESTAMP WITH TIME ZONE NOT NULL`
  - `status VARCHAR(20) DEFAULT 'CONFIRMED' NOT NULL` (Constraint: `CONFIRMED`, `CANCELLED`, `SEATED`, `NOSHOW`)
  - `guest_count INT NOT NULL`
  - `notes VARCHAR(255) NULL`

---

### Module 2.5: Menu, Variants, Modifiers & Combos

#### 2.5.1 `categories`
- **Purpose**: Root menu grouping (e.g. Starters, Beverages).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(100) NOT NULL`
  - `is_active BOOLEAN DEFAULT TRUE NOT NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`
    - `sync_status VARCHAR(20) DEFAULT 'SYNCED' NOT NULL`

#### 2.5.2 `subcategories`
- **Purpose**: Fine menu grouping (e.g. Veg Starters, Non-Veg Starters).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `category_id UUID NOT NULL` (FK -> `categories` ON DELETE CASCADE)
  - `name VARCHAR(100) NOT NULL`
  - `is_active BOOLEAN DEFAULT TRUE NOT NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`
    - `sync_status VARCHAR(20) DEFAULT 'SYNCED' NOT NULL`

#### 2.5.3 `menu_items`
- **Purpose**: Core catalog items entity.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `category_id UUID NOT NULL` (FK -> `categories` ON DELETE RESTRICT)
  - `subcategory_id UUID NULL` (FK -> `subcategories` ON DELETE SET NULL)
  - `name VARCHAR(150) NOT NULL`
  - `description TEXT NULL`
  - `sku VARCHAR(50) NOT NULL`
  - `price NUMERIC(10, 2) NOT NULL`
  - `is_available BOOLEAN DEFAULT TRUE NOT NULL`
  - `is_veg BOOLEAN DEFAULT TRUE NOT NULL`
  - `tax_rate_percent NUMERIC(5,2) DEFAULT 5.00 NOT NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`
    - `sync_status VARCHAR(20) DEFAULT 'SYNCED' NOT NULL`
  - **Constraints**: Composite unique `uq_items_branch_sku(category_id, sku)`.

#### 2.5.4 `menu_item_variants`
- **Purpose**: Size overrides (e.g. Half, Full, 10 inch, 12 inch).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `menu_item_id UUID NOT NULL` (FK -> `menu_items` ON DELETE CASCADE)
  - `name VARCHAR(50) NOT NULL`
  - `price_override NUMERIC(10, 2) NOT NULL`
  - `sku VARCHAR(50) UNIQUE NOT NULL`
  - `is_available BOOLEAN DEFAULT TRUE NOT NULL`

#### 2.5.5 `modifiers`
- **Purpose**: Grouping options additions (e.g. Prep Instruction, Crust Type).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(100) NOT NULL`
  - `selection_type VARCHAR(20) DEFAULT 'SINGLE' NOT NULL` (Constraint: `SINGLE`, `MULTIPLE`)

#### 2.5.6 `modifier_options`
- **Purpose**: Individual addon pricing (e.g. Extra Cheese, Wheat Crust).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `modifier_id UUID NOT NULL` (FK -> `modifiers` ON DELETE CASCADE)
  - `name VARCHAR(100) NOT NULL`
  - `price_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL`
  - `sku VARCHAR(50) NULL`

#### 2.5.7 `menu_item_modifiers`
- **Purpose**: Many-to-many relationship linking menu items to modifiers.
- **Primary Key**: Composite `(menu_item_id, modifier_id)`
- **Columns**:
  - `menu_item_id UUID NOT NULL` (FK -> `menu_items` ON DELETE CASCADE)
  - `modifier_id UUID NOT NULL` (FK -> `modifiers` ON DELETE CASCADE)

#### 2.5.8 `combo_meals`
- **Purpose**: Bundle meals configurations.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(150) NOT NULL`
  - `price NUMERIC(10, 2) NOT NULL`
  - `is_available BOOLEAN DEFAULT TRUE NOT NULL`

#### 2.5.9 `combo_items`
- **Purpose**: Child components of combo meals.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `combo_meal_id UUID NOT NULL` (FK -> `combo_meals` ON DELETE CASCADE)
  - `menu_item_id UUID NOT NULL` (FK -> `menu_items` ON DELETE RESTRICT)
  - `quantity INT DEFAULT 1 NOT NULL`

---

### Module 2.6: Orders & KOT (Kitchen Tickets)

#### 2.6.1 `orders`
- **Purpose**: Direct tickets sales cart registry.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `table_id UUID NULL` (FK -> `tables` ON DELETE SET NULL)
  - `order_type VARCHAR(20) NOT NULL` (Constraint: `DINE_IN`, `TAKEAWAY`, `DELIVERY`, `PARCEL`)
  - `status VARCHAR(20) DEFAULT 'PENDING' NOT NULL`
  - `total_amount NUMERIC(12, 4) DEFAULT 0.0000 NOT NULL`
  - `discount_amount NUMERIC(12, 4) DEFAULT 0.0000 NOT NULL`
  - `tax_amount NUMERIC(12, 4) DEFAULT 0.0000 NOT NULL`
  - `customer_id UUID NULL` (FK -> `customers` ON DELETE SET NULL)
  - `created_by_id UUID NOT NULL` (FK -> `users` ON DELETE RESTRICT)
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`
    - `version INT DEFAULT 1 NOT NULL`
    - `sync_status VARCHAR(20) DEFAULT 'SYNCED' NOT NULL`
    - `last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.6.2 `order_items`
- **Purpose**: Individual lines of items in an order.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `order_id UUID NOT NULL` (FK -> `orders` ON DELETE CASCADE)
  - `menu_item_id UUID NOT NULL` (FK -> `menu_items` ON DELETE RESTRICT)
  - `variant_id UUID NULL` (FK -> `menu_item_variants` ON DELETE RESTRICT)
  - `name VARCHAR(150) NOT NULL`
  - `quantity INT NOT NULL`
  - `unit_price NUMERIC(12, 4) NOT NULL`
  - `notes VARCHAR(255) NULL`
  - `kot_id UUID NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`

#### 2.6.3 `order_item_modifiers`
- **Purpose**: Modifiers chosen for a specific ordered item.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `order_item_id UUID NOT NULL` (FK -> `order_items` ON DELETE CASCADE)
  - `modifier_option_id UUID NOT NULL` (FK -> `modifier_options` ON DELETE RESTRICT)
  - `price NUMERIC(10, 2) NOT NULL`

#### 2.6.4 `kitchen_stations`
- **Purpose**: Categorization of prep locations (e.g. Bakery, Tandoor).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(50) NOT NULL`
  - `printer_id UUID NULL` (FK -> `printers` ON DELETE SET NULL)

#### 2.6.5 `kots`
- **Purpose**: Kitchen Order Tickets generated for prep screens.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `order_id UUID NOT NULL` (FK -> `orders` ON DELETE CASCADE)
  - `token_number INT NOT NULL`
  - `status VARCHAR(20) DEFAULT 'RECEIVED' NOT NULL` (Constraint: `RECEIVED`, `PREPARING`, `READY`, `SERVED`, `CANCELLED`)
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `kitchen_station_id UUID NOT NULL` (FK -> `kitchen_stations` ON DELETE RESTRICT)
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - **Offline Sync**:
    - `client_uuid UUID UNIQUE NULL`

#### 2.6.6 `kot_items`
- **Purpose**: Items bound to a KOT ticket.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `kot_id UUID NOT NULL` (FK -> `kots` ON DELETE CASCADE)
  - `order_item_id UUID NOT NULL` (FK -> `order_items` ON DELETE RESTRICT)
  - `quantity INT NOT NULL`
  - `status VARCHAR(20) DEFAULT 'RECEIVED' NOT NULL`

#### 2.6.7 `cooking_timers`
- **Purpose**: Logs target durations for kitchen efficiency metrics.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `kot_id UUID UNIQUE NOT NULL` (FK -> `kots` ON DELETE CASCADE)
  - `start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - `end_time TIMESTAMP WITH TIME ZONE NULL`
  - `elapsed_seconds INT DEFAULT 0 NULL`

---

### Module 2.7: Billing & Payments

#### 2.7.1 `bills`
- **Purpose**: Generates the commercial tax invoice.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `order_id UUID NOT NULL` (FK -> `orders` ON DELETE RESTRICT)
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `bill_number VARCHAR(50) NOT NULL` (Formatted: `INV/BRANCH/YEAR/SEQ`)
  - `subtotal NUMERIC(12, 4) NOT NULL`
  - `tax_amount NUMERIC(12, 4) NOT NULL`
  - `discount_amount NUMERIC(12, 4) NOT NULL`
  - `final_amount NUMERIC(12, 4) NOT NULL`
  - `status VARCHAR(20) DEFAULT 'PENDING' NOT NULL` (Constraint: `PENDING`, `SETTLED`, `VOIDED`)
  - `payment_status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL` (Constraint: `UNPAID`, `PARTIAL`, `PAID`)
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - **Constraints**: Composite unique `uq_bills_branch_number(branch_id, bill_number)`.

#### 2.7.2 `bill_taxes`
- **Purpose**: Breakdown of tax rates charged (CGST, SGST, Service Tax).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `bill_id UUID NOT NULL` (FK -> `bills` ON DELETE CASCADE)
  - `name VARCHAR(50) NOT NULL`
  - `rate NUMERIC(5, 2) NOT NULL`
  - `amount NUMERIC(12, 4) NOT NULL`

#### 2.7.3 `bill_discounts`
- **Purpose**: Details coupon codes/discounts applied.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `bill_id UUID NOT NULL` (FK -> `bills` ON DELETE CASCADE)
  - `code VARCHAR(50) NULL`
  - `description VARCHAR(100) NOT NULL`
  - `type VARCHAR(10) NOT NULL` (Constraint: `PERCENT`, `FIXED`)
  - `value NUMERIC(10, 2) NOT NULL`
  - `amount NUMERIC(12, 4) NOT NULL`

#### 2.7.4 `payments`
- **Purpose**: Transactions record per bill (supports split settlements).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `bill_id UUID NOT NULL` (FK -> `bills` ON DELETE RESTRICT)
  - `payment_method VARCHAR(20) NOT NULL`
  - `amount NUMERIC(12, 4) NOT NULL`
  - `status VARCHAR(20) DEFAULT 'COMPLETED' NOT NULL` (Constraint: `COMPLETED`, `FAILED`, `REFUNDED`)
  - `reference_number VARCHAR(100) NULL` (UPI transaction ID, card swipe trace)
  - `transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.7.5 `refunds`
- **Purpose**: Return logs for settlements overrides.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `bill_id UUID NOT NULL` (FK -> `bills` ON DELETE RESTRICT)
  - `payment_id UUID NOT NULL` (FK -> `payments` ON DELETE RESTRICT)
  - `amount NUMERIC(12, 4) NOT NULL`
  - `reason VARCHAR(255) NOT NULL`
  - `approved_by_id UUID NOT NULL` (FK -> `users` ON DELETE RESTRICT)
  - `transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

---

### Module 2.8: Inventory & Recipe Management

#### 2.8.1 `ingredients`
- **Purpose**: Core raw stock directory (e.g. Cheese, Chicken, Onion).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(150) NOT NULL`
  - `sku VARCHAR(50) NOT NULL`
  - `unit_of_measure VARCHAR(20) NOT NULL` (e.g. `KG`, `LTR`, `PCS`, `GRAM`)
  - `min_stock_threshold NUMERIC(12, 4) DEFAULT 0.0000 NOT NULL`
  - `cost_per_unit NUMERIC(12, 4) DEFAULT 0.0000 NOT NULL`
  - **Constraints**: Composite unique `uq_ingredients_branch_sku(branch_id, sku)`.

#### 2.8.2 `stock_ledger`
- **Purpose**: Append-only log calculating active stock balances (prevents concurrency locks).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `ingredient_id UUID NOT NULL` (FK -> `ingredients` ON DELETE CASCADE)
  - `quantity_change NUMERIC(12, 4) NOT NULL` (Can be negative for sales/wastage)
  - `cost NUMERIC(12, 4) NOT NULL` (Purchase rate or average cost)
  - `type VARCHAR(20) NOT NULL` (Constraint: `PURCHASE`, `SALE_DEDUCTION`, `WASTAGE`, `TRANSFER_IN`, `TRANSFER_OUT`, `RECONCILIATION`)
  - `supplier_id UUID NULL`
  - `ref_id UUID NULL` (Can link to purchase_items, order_items, transfers)
  - `expiration_date DATE NULL`
  - `transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

#### 2.8.3 `recipes`
- **Purpose**: Binds menu items/variants to ingredient maps.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `menu_item_id UUID NOT NULL` (FK -> `menu_items` ON DELETE CASCADE)
  - `variant_id UUID NULL` (FK -> `menu_item_variants` ON DELETE CASCADE)
  - **Constraints**: Composite unique `uq_recipes_item_variant(menu_item_id, variant_id)`.

#### 2.8.4 `recipe_ingredients`
- **Purpose**: Recipe line configurations.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `recipe_id UUID NOT NULL` (FK -> `recipes` ON DELETE CASCADE)
  - `ingredient_id UUID NOT NULL` (FK -> `ingredients` ON DELETE RESTRICT)
  - `quantity_required NUMERIC(12, 4) NOT NULL` (e.g. 0.0500 kg)

#### 2.8.5 `suppliers`
- **Purpose**: Supplier catalog database.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `tenant_id UUID NOT NULL` (FK -> `tenants` ON DELETE RESTRICT)
  - `name VARCHAR(150) NOT NULL`
  - `contact_name VARCHAR(100) NULL`
  - `phone VARCHAR(20) NOT NULL`
  - `email VARCHAR(100) NULL`
  - `address TEXT NULL`
  - `tax_id VARCHAR(50) NULL` (GSTIN)

#### 2.8.6 `purchases`
- **Purpose**: Supplier invoices registry.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `supplier_id UUID NOT NULL` (FK -> `suppliers` ON DELETE RESTRICT)
  - `invoice_number VARCHAR(100) NOT NULL`
  - `invoice_date DATE NOT NULL`
  - `total_amount NUMERIC(12, 4) NOT NULL`
  - `payment_status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL`

#### 2.8.7 `purchase_items`
- **Purpose**: Line item logs inside a purchase invoice.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `purchase_id UUID NOT NULL` (FK -> `purchases` ON DELETE CASCADE)
  - `ingredient_id UUID NOT NULL` (FK -> `ingredients` ON DELETE RESTRICT)
  - `quantity_received NUMERIC(12, 4) NOT NULL`
  - `unit_cost NUMERIC(12, 4) NOT NULL`
  - `expiration_date DATE NULL`

#### 2.8.8 `stock_transfers`
- **Purpose**: Multi-branch warehouse supply movement request.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `from_branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `to_branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `status VARCHAR(20) DEFAULT 'PENDING' NOT NULL` (Constraint: `PENDING`, `IN_TRANSIT`, `COMPLETED`, `REJECTED`)
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
  - `approved_at TIMESTAMP WITH TIME ZONE NULL`

#### 2.8.9 `stock_transfer_items`
- **Purpose**: Items mapped to stock transfers.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `transfer_id UUID NOT NULL` (FK -> `stock_transfers` ON DELETE CASCADE)
  - `ingredient_id UUID NOT NULL` (FK -> `ingredients` ON DELETE RESTRICT)
  - `quantity NUMERIC(12, 4) NOT NULL`

#### 2.8.10 `wastage_logs`
- **Purpose**: Logs expired or ruined raw ingredients.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `ingredient_id UUID NOT NULL` (FK -> `ingredients` ON DELETE RESTRICT)
  - `quantity NUMERIC(12, 4) NOT NULL`
  - `reason VARCHAR(255) NOT NULL` (e.g. Spillage, Expiry)
  - `reported_by_id UUID NOT NULL` (FK -> `users` ON DELETE RESTRICT)
  - `reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

---

### Module 2.9: Daily Expenses

#### 2.9.1 `expense_categories`
- **Purpose**: Category tags for cash outflow (e.g. Petty Cash, Fuel, Rent).
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `name VARCHAR(100) NOT NULL`

#### 2.9.2 `expenses`
- **Purpose**: Logs daily petty cash outflows.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE RESTRICT)
  - `category_id UUID NOT NULL` (FK -> `expense_categories` ON DELETE RESTRICT)
  - `amount NUMERIC(12, 4) NOT NULL`
  - `description VARCHAR(255) NOT NULL`
  - `payment_method VARCHAR(20) NOT NULL`
  - `attachments_url VARCHAR(255) NULL`
  - `expense_date DATE NOT NULL`
  - `reported_by_id UUID NOT NULL` (FK -> `users` ON DELETE RESTRICT)

---

### Module 2.10: Alerts & Notifications

#### 2.10.1 `notifications`
- **Purpose**: System messages, KOT ready cues, low-stock warnings.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `user_id UUID NULL` (Target user; if null, broadcasts to branch)
  - `branch_id UUID NOT NULL` (FK -> `branches` ON DELETE CASCADE)
  - `type VARCHAR(20) NOT NULL` (Constraint: `ALERT`, `MESSAGE`, `KOT_TRIGGER`)
  - `title VARCHAR(150) NOT NULL`
  - `message TEXT NOT NULL`
  - `is_read BOOLEAN DEFAULT FALSE NOT NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

---

### Module 2.11: Audit Logs

#### 2.11.1 `audit_logs`
- **Purpose**: Immutable registry for security audit trails.
- **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
- **Columns**:
  - `user_id UUID NOT NULL` (FK -> `users` ON DELETE RESTRICT)
  - `tenant_id UUID NOT NULL` (FK -> `tenants` ON DELETE RESTRICT)
  - `branch_id UUID NULL` (FK -> `branches` ON DELETE SET NULL)
  - `action VARCHAR(50) NOT NULL` (e.g. `BILL_VOID`, `DISCOUNT_OVERRIDE`)
  - `table_name VARCHAR(50) NOT NULL`
  - `record_id UUID NOT NULL`
  - `old_values JSONB NULL`
  - `new_values JSONB NULL`
  - `ip_address VARCHAR(45) NULL`
  - `user_agent VARCHAR(255) NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`

---

## 3. Relationships & Cascading Constraints Matrix

To maintain referential integrity without risking accidental loss of financial/auditing metrics, we apply distinct cascading parameters.

| Dependent Table | Referenced Table | Relation Type | Cascade Policy | Context / Reason |
| :--- | :--- | :--- | :--- | :--- |
| `branches` | `restaurants` | Many-to-One | `ON DELETE RESTRICT` | Branches cannot be deleted if a restaurant is disabled. |
| `users` | `roles` | Many-to-One | `ON DELETE RESTRICT` | Prevent role deletion if users are still assigned. |
| `order_items` | `orders` | Many-to-One | `ON DELETE CASCADE` | Deleting an order parent purges its individual order line items. |
| `order_item_modifiers` | `order_items` | Many-to-One | `ON DELETE CASCADE` | Purges selected addons when item line is removed. |
| `bills` | `orders` | One-to-One | `ON DELETE RESTRICT` | Invoices cannot be purged once generated. |
| `payments` | `bills` | Many-to-One | `ON DELETE RESTRICT` | Prevent payment transaction wipes once committed. |
| `recipe_ingredients` | `recipes` | Many-to-One | `ON DELETE CASCADE` | Purges line item targets when recipe header is removed. |
| `attendance_logs` | `employees` | Many-to-One | `ON DELETE CASCADE` | Purges attendance logs only if the employee profile is hard deleted. |

---

## 4. Offline Synchronization Data Architecture

Offline-first operations utilize five core parameters on synchronizing tables (`floors`, `tables`, `categories`, `subcategories`, `menu_items`, `orders`, `order_items`, `kots`):

1. **`client_uuid` (`UUID UNIQUE NULL`)**:
   - Generated client-side (UUIDv4) upon item insertion.
   - Serves as the primary identifier for conflict tracking during batch sync requests.
2. **`sync_status` (`VARCHAR(20) DEFAULT 'SYNCED'`)**:
   - `PENDING`: Written locally, queueing replication.
   - `SYNCING`: Currently flushes batch mutation payload.
   - `SYNCED`: Database record validated and mirrored on the cloud server.
3. **`version` (`INT DEFAULT 1`)**:
   - Incrementing integer tracks modifications. Server checks if incoming client version matches expected state version to prevent overrides.
4. **`last_modified_at` (`TIMESTAMP WITH TIME ZONE DEFAULT NOW()`)**:
   - Microsecond-level timestamp triggers Last-Write-Wins evaluations.

---

## 5. Multi-Branch & SaaS Tenant Strategy

Tenant isolation and multi-branch structures are enforced at the query level via foreign keys mapping:

- **SaaS Tenant Isolation**:
  - The root tables `restaurants`, `users`, `customers`, `suppliers`, and `roles` contain a mandatory `tenant_id` foreign key.
  - This guarantees that no user can scan or join data outside their tenant boundary.
- **Multi-Branch Operations**:
  - The operational tables `branches`, `floors`, `menu_items`, `orders`, `bills`, `ingredients`, `expenses`, and `printers` contain a `branch_id` foreign key.
  - **Branch-wise inventory**: Tracked via `branch_id` in `ingredients` and `stock_ledger` tables.
  - **Branch-wise pricing**: Managed by mapping menu items to branch categories. If a multi-branch business overrides pricing, items contain branch-specific overrides.
  - **Franchise management ready**: Restaurants map to independent tenant blocks, allowing franchise owners to view only their restaurant profiles while the master franchise tenant runs cross-restaurant reports.

---

## 6. Indexing & Optimization Strategy

To support millions of sales records and hundreds of concurrent operations, PostgreSQL indexes are defined as follows:

### Primary Search Indexes
```sql
CREATE INDEX idx_menu_items_sku ON menu_items (sku);
CREATE INDEX idx_ingredients_sku ON ingredients (sku);
CREATE INDEX idx_customers_phone ON customers (phone);
```

### POS Billing & Table Status Optimization
```sql
CREATE INDEX idx_orders_branch_status ON orders (branch_id, status);
CREATE INDEX idx_tables_floor_status ON tables (floor_id, status);
CREATE INDEX idx_kots_branch_status ON kots (branch_id, status);
```

### Financial & Analytics Reports Optimization
```sql
CREATE INDEX idx_bills_branch_date ON bills (branch_id, created_at DESC);
CREATE INDEX idx_payments_method_date ON payments (payment_method, transaction_date DESC);
CREATE INDEX idx_stock_ledger_ingredient_date ON stock_ledger (ingredient_id, transaction_date DESC);
CREATE INDEX idx_expenses_branch_date ON expenses (branch_id, expense_date DESC);
```

---

## 7. Soft Delete Strategy

To preserve historical metrics and financial trails, tables follow specific deletion rules:

- **Soft Delete (uses `deleted_at TIMESTAMP`)**:
  - `customers`, `menu_items`, `employees`, `ingredients`, `floors`, `tables`, `printers`.
  - *Rule*: Repository classes filter out records where `deleted_at IS NOT NULL`.
- **Hard Delete (Physical Purging)**:
  - `user_sessions`, `role_permissions`, `combo_items`, `recipe_ingredients`.
- **Immutable Archive (Deletion Prohibited)**:
  - `orders`, `order_items`, `bills`, `payments`, `refunds`, `stock_ledger`, `audit_logs`.
  - *Rule*: Deleting records in these tables is blocked by database constraints.

---

## 8. Security Considerations

1. **Sensitive Data Storage**:
   - User passwords must never be stored in plain text. Use `bcrypt` (minimum 12 rounds) or `Argon2id` in the auth handler, writing only the hash value to `users.password_hash`.
2. **Personally Identifiable Information (PII) Encryption**:
   - Customer phone numbers, emails, and address strings should be encrypted at the application level using AES-256-GCM before database insertion if tenant compliance policies are active.
3. **Audit Log Integrity**:
   - The `audit_logs` table has select-only permissions for operational roles. Inserts are written automatically by server middleware hooks, and update/delete commands on the audit table are blocked.
