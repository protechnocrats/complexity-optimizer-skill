//! Typical production volumes, from the operations runbook.

pub const USERS_PER_MODERATION_RUN: usize = 250_000;
pub const BLOCKED_IDS: usize = 40_000;
pub const WAREHOUSE_STATIONS: usize = 80_000;
pub const PRODUCT_NAME_CHARS: usize = 2_000;
pub const SKUS_PER_IMPORT: usize = 300_000;
pub const LONGEST_STREAK_DAYS: u64 = 5_000_000_000;
pub const PRICE_POINTS_PER_SEARCH: usize = 1_000_000;
pub const ORDERS_PER_REGION_REPORT: usize = 500_000;
pub const REGIONS: usize = 3_000;
/// Supplier feeds can nest categories deeply.
pub const MAX_CATEGORY_DEPTH_SEEN: usize = 200_000;
/// Delivery zones are mapped as square grids of this many cells per side.
pub const DELIVERY_GRID_SIDE: usize = 400;
pub const SKUS_PER_BUNDLE_SEED: usize = 3_000;
