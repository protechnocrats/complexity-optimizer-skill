package com.example.shop

data class User(val id: String, val name: String)

data class Customer(val id: String, val name: String, val lastActiveDay: Int)

data class Order(val id: String, val customerId: String, val totalCents: Long)

data class Post(val id: String, val tags: List<String>)

data class Category(val name: String, val children: List<Category> = emptyList())

data class Product(val sku: String, val name: String, val unitsSold: Int)
