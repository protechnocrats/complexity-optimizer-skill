#include <stdlib.h>

#include "shop.h"

int *ids_above(const int *ids, size_t n, int min_id, size_t *out_count)
{
    int *result = NULL;
    size_t count = 0;
    for (size_t i = 0; i < n; i++) {
        if (ids[i] > min_id) {
            int *grown = realloc(result, (count + 1) * sizeof *result);
            if (grown == NULL) {
                free(result);
                *out_count = 0;
                return NULL;
            }
            result = grown;
            result[count++] = ids[i];
        }
    }
    *out_count = count;
    return result;
}

int has_duplicate_ids(const int *ids, size_t n)
{
    for (size_t i = 0; i < n; i++) {
        for (size_t j = i + 1; j < n - 1; j++) {
            if (ids[i] == ids[j])
                return 1;
        }
    }
    return 0;
}
