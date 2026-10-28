public struct Category {
    public let name: String
    public let children: [Category]

    public init(name: String, children: [Category] = []) {
        self.name = name
        self.children = children
    }
}

/// Returns the names of `root` and all of its descendants, each parent before its children.
public func allCategoryNames(_ root: Category) -> [String] {
    [root.name] + root.children.flatMap { allCategoryNames($0) }
}
