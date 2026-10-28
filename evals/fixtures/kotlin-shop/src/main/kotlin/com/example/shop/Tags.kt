package com.example.shop

/** Returns every distinct tag used across [posts], in the order each tag first appears. */
fun uniqueTags(posts: List<Post>): List<String> {
    val result = mutableListOf<String>()
    for (post in posts) {
        for (tag in post.tags) {
            if (tag !in result) result.add(tag)
        }
    }
    return result
}
