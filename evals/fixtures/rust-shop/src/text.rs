/// Returns the positions (in characters) where `needle` occurs in `text`.
/// Product names include accented letters and emoji.
pub fn char_positions(text: &str, needle: char) -> Vec<usize> {
    let mut positions = Vec::new();
    for i in 0..text.chars().count() {
        if text.chars().nth(i) == Some(needle) {
            positions.push(i);
        }
    }
    positions
}
