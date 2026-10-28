import Foundation

/// Formats statement dates for display in the user's current locale and time zone.
public func formattedStatementDates(_ dates: [Date]) -> [String] {
    dates.map { date in
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}
