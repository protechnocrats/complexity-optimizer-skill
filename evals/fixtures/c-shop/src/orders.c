#include "shop.h"

void sort_by_priority(struct order *orders, size_t n)
{
    for (size_t i = 1; i < n; i++) {
        struct order current = orders[i];
        size_t j = i;
        while (j > 0 && orders[j - 1].priority > current.priority) {
            orders[j] = orders[j - 1];
            j--;
        }
        orders[j] = current;
    }
}

long long streak_points(long long days)
{
    long long total = 0;
    for (long long day = 1; day <= days; day++)
        total += day;
    return total;
}
