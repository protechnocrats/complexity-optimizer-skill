public struct Order {
    public let id: String
    public let priority: Int
    public let isPaid: Bool

    public init(id: String, priority: Int, isPaid: Bool) {
        self.id = id
        self.priority = priority
        self.isPaid = isPaid
    }
}

/// Returns the IDs of paid orders, in order.
public func paidOrderIDs(_ orders: [Order]) -> [String] {
    orders.reduce([]) { ids, order in order.isPaid ? ids + [order.id] : ids }
}

/// Sorts orders by ascending priority. Orders with equal priority keep their relative order.
public func sortedByPriority(_ orders: [Order]) -> [Order] {
    var result = orders
    if result.count < 2 { return result }
    for i in 1..<result.count {
        let current = result[i]
        var j = i
        while j > 0 && result[j - 1].priority > current.priority {
            result[j] = result[j - 1]
            j -= 1
        }
        result[j] = current
    }
    return result
}
