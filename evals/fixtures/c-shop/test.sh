#!/usr/bin/env sh
# Builds and runs the tests. Pass "sanitize" to build with AddressSanitizer and UBSan.
set -eu
cd "$(dirname "$0")"
mkdir -p build
flags="-std=c11 -Wall -Wextra -O2"
if [ "${1:-}" = "sanitize" ]; then
    flags="$flags -g -fsanitize=address,undefined -fno-omit-frame-pointer"
fi
${CC:-cc} $flags -Iinclude src/*.c tests/test_shop.c -o build/test_shop
./build/test_shop
