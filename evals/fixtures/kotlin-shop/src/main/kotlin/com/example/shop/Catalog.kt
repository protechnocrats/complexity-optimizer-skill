package com.example.shop

/** Returns the names of [root] and all of its descendants, each parent before its children. */
fun allCategoryNames(root: Category): List<String> =
    listOf(root.name) + root.children.flatMap { allCategoryNames(it) }
