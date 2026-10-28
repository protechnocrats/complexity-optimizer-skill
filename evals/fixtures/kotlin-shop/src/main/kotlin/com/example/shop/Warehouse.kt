package com.example.shop

/**
 * Returns the minimum number of conveyor hops from [start] to [goal] in the warehouse,
 * or -1 if [goal] is unreachable.
 */
fun shortestHops(adjacency: Map<String, List<String>>, start: String, goal: String): Int {
    val distance = mutableMapOf(start to 0)
    val queue = mutableListOf(start)
    while (queue.isNotEmpty()) {
        val current = queue.removeAt(0)
        if (current == goal) return distance.getValue(current)
        for (next in adjacency[current].orEmpty()) {
            if (next !in distance) {
                distance[next] = distance.getValue(current) + 1
                queue.add(next)
            }
        }
    }
    return -1
}
