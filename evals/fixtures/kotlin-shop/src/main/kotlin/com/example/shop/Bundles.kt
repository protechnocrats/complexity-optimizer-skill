package com.example.shop

/** Counts the ways to pick three different products whose prices add up to exactly [budgetCents]. */
fun countBundles(pricesCents: IntArray, budgetCents: Long): Long {
    var count = 0L
    for (i in pricesCents.indices) {
        for (j in i + 1 until pricesCents.size) {
            for (k in j + 1 until pricesCents.size) {
                if (pricesCents[i].toLong() + pricesCents[j] + pricesCents[k] == budgetCents) count++
            }
        }
    }
    return count
}
