#[derive(Debug, Clone)]
pub struct Order {
    pub region: String,
    pub cents: u64,
}

/// Returns the total per region, in the order each region first appears.
pub fn region_totals(orders: &[Order]) -> Vec<(String, u64)> {
    let mut totals: Vec<(String, u64)> = Vec::new();
    for order in orders {
        match totals.iter_mut().find(|(region, _)| *region == order.region) {
            Some((_, total)) => *total += order.cents,
            None => totals.push((order.region.clone(), order.cents)),
        }
    }
    totals
}
