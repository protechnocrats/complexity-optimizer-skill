/// Returns each SKU once, keeping the order in which SKUs first appear.
pub fn unique_skus(skus: &[u32]) -> Vec<u32> {
    let mut result: Vec<u32> = Vec::new();
    for &sku in skus {
        if !result.contains(&sku) {
            result.push(sku);
        }
    }
    result
}
