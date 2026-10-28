package com.example.shop

/** Returns the orders placed by customers who were active on or after [cutoffDay]. */
fun ordersFromActiveCustomers(
    orders: List<Order>,
    customers: List<Customer>,
    cutoffDay: Int,
): List<Order> =
    orders.filter { order ->
        val customer = customers.firstOrNull { it.id == order.customerId }
        customer != null && customer.lastActiveDay > cutoffDay
    }
