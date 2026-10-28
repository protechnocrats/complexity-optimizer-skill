#[derive(Debug, Clone)]
pub struct Category {
    pub name: String,
    pub children: Vec<Category>,
}

/// Returns the names of `root` and all of its descendants, each parent before its children.
pub fn all_category_names(root: &Category) -> Vec<String> {
    let mut names = vec![root.name.clone()];
    for child in &root.children {
        names.extend(all_category_names(child));
    }
    names
}
