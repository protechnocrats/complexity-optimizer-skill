use std::collections::HashMap;

use rust_shop::bundles::candidate_pairs;
use rust_shop::catalog::{all_category_names, Category};
use rust_shop::dedupe::unique_skus;
use rust_shop::ledger::streak_points;
use rust_shop::moderation::{blocked_users, User};
use rust_shop::pricing::percent_of;
use rust_shop::routes::delivery_routes;
use rust_shop::routing::shortest_hops;
use rust_shop::search::first_position;
use rust_shop::text::char_positions;
use rust_shop::totals::{region_totals, Order};
use rust_shop::units::unit_labels;

fn user(id: u64, name: &str) -> User {
    User { id, name: name.to_string() }
}

#[test]
fn blocked_users_keep_order() {
    let users = vec![user(3, "C"), user(1, "A"), user(2, "B")];
    assert_eq!(blocked_users(&users, &[2, 3]), vec![user(3, "C"), user(2, "B")]);
}

#[test]
fn hops() {
    let graph = HashMap::from([(1, vec![2, 3]), (2, vec![4]), (3, vec![4]), (4, vec![])]);
    assert_eq!(shortest_hops(&graph, 1, 4), Some(2));
    assert_eq!(shortest_hops(&graph, 4, 1), None);
}

#[test]
fn positions_count_characters() {
    assert_eq!(char_positions("café crème", 'è'), vec![7]);
}

#[test]
fn skus_first_seen_order() {
    assert_eq!(unique_skus(&[5, 3, 5, 1, 3]), vec![5, 3, 1]);
}

#[test]
fn streak() {
    assert_eq!(streak_points(4), 10);
}

#[test]
fn first_match() {
    assert_eq!(first_position(&[1, 2, 2, 2, 5], 2), Some(1));
    assert_eq!(first_position(&[1, 2, 5], 3), None);
}

#[test]
fn totals_in_first_seen_order() {
    let orders = vec![
        Order { region: "west".into(), cents: 100 },
        Order { region: "east".into(), cents: 50 },
        Order { region: "west".into(), cents: 25 },
    ];
    assert_eq!(region_totals(&orders), vec![("west".to_string(), 125), ("east".to_string(), 50)]);
}

#[test]
fn percent() {
    assert_eq!(percent_of(25, 200), 12);
}

#[test]
fn category_names_parent_first() {
    let leaf = |name: &str| Category { name: name.into(), children: vec![] };
    let tree = Category {
        name: "root".into(),
        children: vec![Category { name: "a".into(), children: vec![leaf("a1")] }, leaf("b")],
    };
    assert_eq!(all_category_names(&tree), vec!["root", "a", "a1", "b"]);
}

#[test]
fn units() {
    assert_eq!(unit_labels(&["kg", "oz"]), vec!["kilograms (kg)", "oz"]);
}

#[test]
fn delivery_routes_avoid_blocked_cells() {
    let open = vec![vec![false; 3]; 3];
    assert_eq!(delivery_routes(&open), 6);
    let mut blocked = open.clone();
    blocked[1][1] = true;
    assert_eq!(delivery_routes(&blocked), 2);
}

#[test]
fn candidate_pairs_in_scoring_order() {
    assert_eq!(candidate_pairs(&[7, 3, 9]), vec![(7, 3), (7, 9), (3, 9)]);
}
