package com.example.shop

/**
 * Counts the contiguous runs of days whose net balance change equals [target].
 * [deltas] holds the signed balance change for each day.
 */
fun countPeriodsWithNetChange(deltas: IntArray, target: Long): Int {
    var count = 0
    for (start in deltas.indices) {
        var sum = 0L
        for (end in start until deltas.size) {
            sum += deltas[end]
            if (sum == target) count++
        }
    }
    return count
}
