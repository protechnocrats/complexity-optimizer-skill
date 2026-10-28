#include "shop.h"

long long dispatch_value(const struct line *lines, size_t n_lines,
                         const struct price *prices, size_t n_prices)
{
    long long total = 0;
    for (size_t i = 0; i < n_lines; i++) {
        long cents = price_of(prices, n_prices, lines[i].sku);
        if (cents >= 0)
            total += (long long)cents * lines[i].quantity;
    }
    return total;
}
