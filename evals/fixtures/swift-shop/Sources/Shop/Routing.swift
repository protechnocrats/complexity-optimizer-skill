/// Returns the minimum number of hops from `start` to `goal`, or nil if unreachable.
public func shortestHops(_ adjacency: [String: [String]], from start: String, to goal: String) -> Int? {
    var distance: [String: Int] = [start: 0]
    var queue = [start]
    while !queue.isEmpty {
        let current = queue.removeFirst()
        let d = distance[current]!
        if current == goal { return d }
        for next in adjacency[current] ?? [] where distance[next] == nil {
            distance[next] = d + 1
            queue.append(next)
        }
    }
    return nil
}
