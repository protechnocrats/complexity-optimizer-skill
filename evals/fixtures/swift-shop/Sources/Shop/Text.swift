/// Returns the positions (in characters) where `needle` occurs in `text`.
/// Product names include accented letters and emoji.
public func characterPositions(in text: String, of needle: Character) -> [Int] {
    var positions: [Int] = []
    for i in 0..<text.count {
        if text[text.index(text.startIndex, offsetBy: i)] == needle {
            positions.append(i)
        }
    }
    return positions
}
