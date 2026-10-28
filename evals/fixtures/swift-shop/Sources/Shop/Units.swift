private let units: [(code: String, name: String)] = [
    ("g", "grams"), ("kg", "kilograms"), ("ml", "millilitres"), ("l", "litres"),
]

/// Labels for the unit picker. Built once when the product editor opens.
public func unitLabels(_ codes: [String]) -> [String] {
    codes.map { code in
        if let unit = units.first(where: { $0.code == code }) {
            return "\(unit.name) (\(code))"
        }
        return code
    }
}
