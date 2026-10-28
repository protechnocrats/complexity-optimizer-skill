#include "shop.h"

long price_of(const struct price *prices, size_t n, int sku)
{
    for (size_t i = 0; i < n; i++) {
        if (prices[i].sku == sku)
            return prices[i].cents;
    }
    return -1;
}
