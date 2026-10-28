package com.example.shop

/** Returns the users whose IDs appear in [blockedIds], in the order they appear in [users]. */
fun blockedUsers(users: List<User>, blockedIds: List<String>): List<User> =
    users.filter { it.id in blockedIds }
