/// Typical production volumes, from the operations runbook.
public enum Volumes {
    public static let warehouseStations = 80_000
    public static let productNameCharacters = 2_000
    public static let postsPerTagIndex = 100_000
    public static let longestStreakDays = 4_000_000_000
    public static let ratingsPerProduct = 50_000
    public static let ordersPerExport = 200_000
    public static let datesPerStatement = 20_000
    public static let ordersPerDispatchRun = 100_000
    /// Supplier feeds can nest categories deeply.
    public static let maxCategoryDepthSeen = 200_000
}
