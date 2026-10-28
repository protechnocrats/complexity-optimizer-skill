/// Returns the average of `ratings`. `ratings` must not be empty.
public func averageRating(_ ratings: [Int]) -> Double {
    precondition(!ratings.isEmpty, "ratings must not be empty")
    return Double(ratings.reduce(0, +) / ratings.count)
}
