#[derive(Debug, Clone, PartialEq, Eq)]
pub struct User {
    pub id: u64,
    pub name: String,
}

/// Returns the users whose IDs appear in `blocked_ids`, in the order they appear in `users`.
pub fn blocked_users(users: &[User], blocked_ids: &[u64]) -> Vec<User> {
    users
        .iter()
        .filter(|user| blocked_ids.contains(&user.id))
        .cloned()
        .collect()
}
