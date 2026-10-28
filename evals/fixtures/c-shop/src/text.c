#include <string.h>

#include "shop.h"

size_t count_char(const char *text, char c)
{
    size_t count = 0;
    for (size_t i = 0; i < strlen(text); i++) {
        if (text[i] == c)
            count++;
    }
    return count;
}

size_t join_tags(char *out, size_t cap, const char *const *tags, size_t n)
{
    size_t written = 0;
    if (cap == 0)
        return 0;
    out[0] = '\0';
    for (size_t i = 0; i < n; i++) {
        size_t separator = written > 0 ? 2 : 0;
        if (strlen(out) + separator + strlen(tags[i]) + 1 > cap)
            break;
        if (written > 0)
            strcat(out, ", ");
        strcat(out, tags[i]);
        written++;
    }
    return written;
}

char last_char(const char *text)
{
    return text[strlen(text)];
}
