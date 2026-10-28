#include "shop.h"

long first_index(const long *sorted, size_t n, long key)
{
    for (size_t i = 0; i < n; i++) {
        if (sorted[i] == key)
            return (long)i;
    }
    return -1;
}
