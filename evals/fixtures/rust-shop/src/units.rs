const UNITS: [(&str, &str); 4] = [("g", "grams"), ("kg", "kilograms"), ("ml", "millilitres"), ("l", "litres")];

/// Labels for the unit picker. Built once when the product editor opens.
pub fn unit_labels(codes: &[&str]) -> Vec<String> {
    codes
        .iter()
        .map(|code| match UNITS.iter().find(|(c, _)| c == code) {
            Some((_, name)) => format!("{name} ({code})"),
            None => code.to_string(),
        })
        .collect()
}
