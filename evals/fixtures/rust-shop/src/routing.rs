use std::collections::HashMap;

/// Returns the minimum number of hops from `start` to `goal`, or `None` if unreachable.
pub fn shortest_hops(adjacency: &HashMap<u32, Vec<u32>>, start: u32, goal: u32) -> Option<usize> {
    let mut distance = HashMap::from([(start, 0usize)]);
    let mut queue = vec![start];
    while !queue.is_empty() {
        let current = queue.remove(0);
        let d = distance[&current];
        if current == goal {
            return Some(d);
        }
        for &next in adjacency.get(&current).map(Vec::as_slice).unwrap_or(&[]) {
            if !distance.contains_key(&next) {
                distance.insert(next, d + 1);
                queue.push(next);
            }
        }
    }
    None
}
