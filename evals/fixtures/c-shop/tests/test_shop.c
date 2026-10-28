#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "shop.h"

static void test_count_char(void)
{
    assert(count_char("banana", 'a') == 3);
    assert(count_char("", 'a') == 0);
}

static void test_join_tags(void)
{
    const char *tags[] = {"red", "blue", "green"};
    char out[32];
    assert(join_tags(out, sizeof out, tags, 3) == 3);
    assert(strcmp(out, "red, blue, green") == 0);
    char small[10];
    assert(join_tags(small, sizeof small, tags, 3) == 2);
    assert(strcmp(small, "red, blue") == 0);
}

static void test_ids_above(void)
{
    int ids[] = {5, 1, 9, 7, 2};
    size_t count = 0;
    int *above = ids_above(ids, 5, 4, &count);
    assert(count == 3);
    assert(above[0] == 5 && above[1] == 9 && above[2] == 7);
    free(above);
}

static void test_first_index(void)
{
    long sorted[] = {1, 2, 2, 2, 5};
    assert(first_index(sorted, 5, 2) == 1);
    assert(first_index(sorted, 5, 3) == -1);
}

static void test_sort_by_priority(void)
{
    struct order orders[] = {{1, 3}, {2, 1}, {3, 3}, {4, 2}};
    sort_by_priority(orders, 4);
    assert(orders[0].id == 2 && orders[1].id == 4 && orders[2].id == 1 && orders[3].id == 3);
}

static void test_streak_points(void)
{
    assert(streak_points(4) == 10);
    assert(streak_points(0) == 0);
}

static void test_has_duplicate_ids(void)
{
    int dup[] = {4, 8, 4, 1};
    int unique[] = {4, 8, 1, 2};
    assert(has_duplicate_ids(dup, 4) == 1);
    assert(has_duplicate_ids(unique, 4) == 0);
}

static void test_unit_name(void)
{
    assert(strcmp(unit_name("kg"), "kilograms") == 0);
    assert(strcmp(unit_name("oz"), "oz") == 0);
}

static void test_dispatch_value(void)
{
    struct price prices[] = {{10, 250}, {20, 100}, {30, 75}};
    struct line lines[] = {{20, 3}, {99, 4}, {10, 1}};
    assert(price_of(prices, 3, 30) == 75);
    assert(price_of(prices, 3, 31) == -1);
    assert(dispatch_value(lines, 3, prices, 3) == 550);
    assert(dispatch_value(lines, 0, prices, 3) == 0);
}

int main(void)
{
    test_count_char();
    test_join_tags();
    test_ids_above();
    test_first_index();
    test_sort_by_priority();
    test_streak_points();
    test_has_duplicate_ids();
    test_unit_name();
    test_dispatch_value();
    puts("all tests passed");
    return 0;
}
