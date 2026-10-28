/// Loyalty points earned over a streak: day 1 earns 1 point, day 2 earns 2, and so on.
public func streakPoints(days: Int) -> Int {
    var total = 0
    var day = 1
    while day <= days {
        total += day
        day += 1
    }
    return total
}
