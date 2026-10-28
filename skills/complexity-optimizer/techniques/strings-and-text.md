# Strings and Text

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

## Strings

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many substring or repeated-pattern queries on a static text | Suffix array + LCP array | Text does not change; enough queries to amortize the build | Build: O(n log n), or O(n) with SA-IS; O(n) memory. Query: O(m log n) for a pattern of length m, plus O(k) to report k occurrences, instead of O(n·m) per scan |
| Distinct substrings, longest repeated or common substring | Suffix automaton | — | O(n²) or worse → O(n) build |
| Longest palindromic substring, all palindromes | Manacher's algorithm | — | O(n²) → O(n) |
| Border and period detection | Prefix function (KMP failure function) | — | O(n²) → O(n) |
| Edit distance when only small distances matter | Banded (Ukkonen) edit distance | A threshold k is known | O(n·m) → O(n·k) |
| Regular expression with nested or overlapping quantifiers (`(a+)+`, `(a\|a)*`, `.*.*x`), run by a backtracking engine on long or untrusted input | Rewrite the pattern to remove the ambiguity (atomic groups or possessive quantifiers where supported), or switch to a linear-time engine (Thompson NFA or lazy DFA, such as RE2, Rust's `regex`, Go's `regexp`) | Linear-time engines do not support backreferences or lookaround; match semantics must be checked one by one: leftmost-first versus leftmost-longest, capture group contents, Unicode classes, anchors and line modes. A new engine is usually a dependency (rule 7) | Exponential worst case → O(n·m) for text length n and pattern size m |
| Many regular expressions tried one after another on the same input | One combined alternation, or a regex set that reports every pattern that matched in one pass | Which pattern wins, and in which priority order, matches the original | k passes over the input → one pass |
| Keyword or term search across many documents by scanning each one | Inverted index: each term maps to a sorted list of the documents (and positions) containing it; ranking such as BM25 computed over those lists only; multi-term queries intersect lists | Tokenization, normalization, matching rules, and result order reproduce the original | O(total text) per query → O(length of the posting lists for the query terms) |
| Regular expression used only to find a fixed string or a fixed prefix | Plain substring search or prefix check | Same case sensitivity, escaping, and Unicode handling | Constant factor; no engine setup |

## Combinations

| Combination | Solves | Result |
|---|---|---|
| Aho-Corasick + failure links + DP | Counting or avoiding many patterns in generated strings | Repeated scans → linear in text and automaton size |
