package com.example.shop

/** Compares an API token supplied by a client with the expected token. */
fun tokensMatch(provided: String, expected: String): Boolean {
    val a = provided.toByteArray()
    val b = expected.toByteArray()
    var diff = a.size xor b.size
    for (i in 0 until maxOf(a.size, b.size)) {
        val x = if (i < a.size) a[i].toInt() else 0
        val y = if (i < b.size) b[i].toInt() else 0
        diff = diff or (x xor y)
    }
    return diff == 0
}
