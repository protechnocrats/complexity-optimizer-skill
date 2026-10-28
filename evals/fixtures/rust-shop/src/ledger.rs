/// Loyalty points earned over a streak: day 1 earns 1 point, day 2 earns 2, and so on.
pub fn streak_points(days: u64) -> u64 {
    let mut total = 0u64;
    for day in 1..=days {
        total += day;
    }
    total
}
