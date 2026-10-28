package com.example.shop

private val DAY_CODES = listOf("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN")

/** Labels for the working days shown in the delivery-slot picker. Built once at startup. */
fun workingDayLabels(closedDays: List<String> = listOf("SAT", "SUN")): List<String> =
    DAY_CODES
        .filter { it !in closedDays }
        .map { code -> code.lowercase().replaceFirstChar { it.uppercase() } }
