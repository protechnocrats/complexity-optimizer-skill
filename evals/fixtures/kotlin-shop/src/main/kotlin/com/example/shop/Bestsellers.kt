package com.example.shop

/** Returns the [k] best-selling products, highest first. */
fun topSellers(products: List<Product>, k: Int): List<Product> =
    products.sortedByDescending { it.unitsSold }.take(k)
