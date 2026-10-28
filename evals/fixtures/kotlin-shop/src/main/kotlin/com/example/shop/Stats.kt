package com.example.shop

/** Returns the median of [sorted], which must be sorted in ascending order and not empty. */
fun median(sorted: IntArray): Double {
    require(sorted.isNotEmpty()) { "sorted must not be empty" }
    return sorted[sorted.size / 2].toDouble()
}
