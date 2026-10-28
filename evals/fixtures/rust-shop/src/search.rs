/// Returns the index of the first element equal to `key` in `sorted` (ascending), if any.
pub fn first_position(sorted: &[i64], key: i64) -> Option<usize> {
    sorted.iter().position(|&value| value == key)
}
