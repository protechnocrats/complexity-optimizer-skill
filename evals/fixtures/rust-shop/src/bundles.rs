/// Every pair of positions in `skus`, as SKU pairs, in the order the nightly "bought together"
/// job scores them: by the first position, then by the second.
pub fn candidate_pairs(skus: &[u32]) -> Vec<(u32, u32)> {
    let mut pairs = Vec::new();
    for i in 0..skus.len() {
        for j in i + 1..skus.len() {
            pairs.push((skus[i], skus[j]));
        }
    }
    pairs
}
