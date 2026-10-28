package com.example.shop

interface CustomerRepository {
    fun findById(id: String): Customer?

    /** Returns the customers that exist among [ids]. Order is not guaranteed. */
    fun findByIds(ids: Collection<String>): List<Customer>
}

class InMemoryCustomerRepository(customers: List<Customer>) : CustomerRepository {
    private val byId = customers.associateBy { it.id }

    override fun findById(id: String): Customer? = byId[id]

    override fun findByIds(ids: Collection<String>): List<Customer> = ids.mapNotNull { byId[it] }
}

class OrderSummaryService(private val repository: CustomerRepository) {

    /** Returns the customer name for each order, or "Unknown" when the customer no longer exists. */
    fun customerNamesForOrders(orders: List<Order>): List<String> =
        orders.map { order -> repository.findById(order.customerId)?.name ?: "Unknown" }
}
