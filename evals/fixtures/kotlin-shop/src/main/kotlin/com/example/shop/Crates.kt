package com.example.shop

data class CrateItem(val sku: String, val weightKg: Int, val valueCents: Long)

/**
 * Highest total value of [items] that fit in a crate holding [capacityKg].
 * Each item is packed at most once. Item weights are positive.
 */
fun maxCrateValue(items: List<CrateItem>, capacityKg: Int): Long {
    fun best(index: Int, remainingKg: Int): Long {
        if (index == items.size) return 0
        val skip = best(index + 1, remainingKg)
        val item = items[index]
        if (item.weightKg > remainingKg) return skip
        return maxOf(skip, item.valueCents + best(index + 1, remainingKg - item.weightKg))
    }
    return best(0, capacityKg)
}
