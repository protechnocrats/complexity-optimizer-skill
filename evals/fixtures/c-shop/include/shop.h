#ifndef SHOP_H
#define SHOP_H

#include <stddef.h>

/* Typical production volumes, from the operations runbook:
 * product descriptions up to 200,000 characters; up to 20,000 tags per export;
 * up to 1,000,000 IDs per import; price lists up to 2,000,000 entries;
 * up to 100,000 orders per dispatch run; streaks up to 4,000,000,000 days. */

size_t count_char(const char *text, char c);

/* Joins tags with ", " into out (capacity cap). Stops before a tag that would not fit.
 * Returns the number of tags written. */
size_t join_tags(char *out, size_t cap, const char *const *tags, size_t n);

/* Returns a newly allocated array of the IDs in ids that are greater than min_id,
 * in their original order. Stores the count in *out_count. The caller frees the result. */
int *ids_above(const int *ids, size_t n, int min_id, size_t *out_count);

/* Returns the index of the first element equal to key in sorted (ascending), or -1. */
long first_index(const long *sorted, size_t n, long key);

struct order {
    int id;
    int priority;
};

/* Sorts orders by ascending priority. Orders with equal priority keep their relative order. */
void sort_by_priority(struct order *orders, size_t n);

/* Loyalty points for a streak: day 1 earns 1 point, day 2 earns 2, and so on. */
long long streak_points(long long days);

/* Returns the last character of text, or '\0' for an empty string. */
char last_char(const char *text);

/* Returns 1 if any ID appears more than once in ids, otherwise 0. */
int has_duplicate_ids(const int *ids, size_t n);

/* Long name for a unit code. Used once when the product editor opens. */
const char *unit_name(const char *code);

#endif
