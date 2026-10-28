/// Counts the delivery routes from the top-left cell of `grid` to the bottom-right cell that
/// move only right or down and avoid blocked cells (`true`). The count is reported modulo
/// 1_000_000_007. The grid is rectangular.
pub fn delivery_routes(grid: &[Vec<bool>]) -> u64 {
    const MODULUS: u64 = 1_000_000_007;

    fn walk(grid: &[Vec<bool>], row: usize, col: usize) -> u64 {
        if grid[row][col] {
            return 0;
        }
        let last_row = grid.len() - 1;
        let last_col = grid[0].len() - 1;
        if row == last_row && col == last_col {
            return 1;
        }
        let mut total = 0;
        if row < last_row {
            total += walk(grid, row + 1, col);
        }
        if col < last_col {
            total += walk(grid, row, col + 1);
        }
        total % MODULUS
    }

    if grid.is_empty() || grid[0].is_empty() {
        return 0;
    }
    walk(grid, 0, 0)
}
