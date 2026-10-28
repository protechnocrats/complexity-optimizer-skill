import Foundation
import XCTest
@testable import Shop

final class ShopTests: XCTestCase {
    func testShortestHops() {
        let graph = ["a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []]
        XCTAssertEqual(shortestHops(graph, from: "a", to: "d"), 2)
        XCTAssertNil(shortestHops(graph, from: "d", to: "a"))
    }

    func testCharacterPositions() {
        XCTAssertEqual(characterPositions(in: "café crème", of: "è"), [7])
    }

    func testUniqueTagsFirstSeenOrder() {
        let posts = [Post(id: "p1", tags: ["b", "a"]), Post(id: "p2", tags: ["a", "c", "b"])]
        XCTAssertEqual(uniqueTags(posts), ["b", "a", "c"])
    }

    func testStreakPoints() {
        XCTAssertEqual(streakPoints(days: 4), 10)
        XCTAssertEqual(streakPoints(days: 0), 0)
    }

    func testAverageRatingWholeNumbers() {
        XCTAssertEqual(averageRating([4, 4, 4]), 4.0)
    }

    func testPaidOrderIDs() {
        let orders = [Order(id: "1", priority: 1, isPaid: true), Order(id: "2", priority: 1, isPaid: false),
                      Order(id: "3", priority: 2, isPaid: true)]
        XCTAssertEqual(paidOrderIDs(orders), ["1", "3"])
    }

    func testSortedByPriorityKeepsTies() {
        let orders = [Order(id: "1", priority: 3, isPaid: true), Order(id: "2", priority: 1, isPaid: true),
                      Order(id: "3", priority: 3, isPaid: true), Order(id: "4", priority: 2, isPaid: true)]
        XCTAssertEqual(sortedByPriority(orders).map(\.id), ["2", "4", "1", "3"])
    }

    func testFormattedStatementDatesCount() {
        let dates = [Date(timeIntervalSince1970: 0), Date(timeIntervalSince1970: 86_400)]
        XCTAssertEqual(formattedStatementDates(dates).count, 2)
    }

    func testCategoryNamesParentFirst() {
        let tree = Category(name: "root", children: [Category(name: "a", children: [Category(name: "a1")]),
                                                     Category(name: "b")])
        XCTAssertEqual(allCategoryNames(tree), ["root", "a", "a1", "b"])
    }

    func testUnitLabels() {
        XCTAssertEqual(unitLabels(["kg", "oz"]), ["kilograms (kg)", "oz"])
    }
}
