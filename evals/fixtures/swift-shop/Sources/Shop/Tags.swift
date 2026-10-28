public struct Post {
    public let id: String
    public let tags: [String]

    public init(id: String, tags: [String]) {
        self.id = id
        self.tags = tags
    }
}

/// Returns every distinct tag used across `posts`, in the order each tag first appears.
public func uniqueTags(_ posts: [Post]) -> [String] {
    var result: [String] = []
    for post in posts {
        for tag in post.tags where !result.contains(tag) {
            result.append(tag)
        }
    }
    return result
}
