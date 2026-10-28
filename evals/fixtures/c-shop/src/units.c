#include <string.h>

#include "shop.h"

static const char *const UNITS[][2] = {
    {"g", "grams"}, {"kg", "kilograms"}, {"ml", "millilitres"}, {"l", "litres"},
};

const char *unit_name(const char *code)
{
    for (size_t i = 0; i < sizeof UNITS / sizeof UNITS[0]; i++) {
        if (strcmp(UNITS[i][0], code) == 0)
            return UNITS[i][1];
    }
    return code;
}
