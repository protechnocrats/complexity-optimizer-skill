package com.example.shop

import java.time.Clock
import java.time.LocalTime

private const val RATE_TABLE_CSV = """
zone-a, 120
zone-b, 180
zone-c, 240
zone-d, 310
zone-e, 390
zone-f, 450
zone-g, 520
zone-h, 610
"""

class ShippingCalculator(private val clock: Clock = Clock.systemDefaultZone()) {

    /** Quotes shipping in cents for a parcel of [weightGrams] to [zone]. Evening dispatch costs 10% more. */
    fun quote(weightGrams: Int, zone: String): Long {
        val rates = parseRateTable(RATE_TABLE_CSV)
        val base = rates.getValue(zone) * weightGrams / 1000
        val hour = LocalTime.now(clock).hour
        val surcharge = if (hour in 17..20) base / 10 else 0
        return base + surcharge
    }

    fun quoteAll(parcels: List<Pair<Int, String>>): List<Long> =
        parcels.map { (weight, zone) -> quote(weight, zone) }
}

private fun parseRateTable(csv: String): Map<String, Long> =
    csv.lines()
        .filter { it.isNotBlank() }
        .associate { line ->
            val (zone, rate) = line.split(",")
            zone.trim() to rate.trim().toLong()
        }
