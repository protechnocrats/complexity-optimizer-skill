# Math and Numerics

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

## Number theory and math

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many primality or divisibility checks up to N | Sieve of Eratosthenes | N fits in memory | Per-query trial division → O(N log log N) once, then O(1) |
| Many factorizations up to N | Smallest-prime-factor sieve | N fits in memory | O(√n) per query → O(log n) per query |
| Primality of large individual numbers | Miller-Rabin with deterministic bases for 64-bit integers | Use the known deterministic base set; otherwise the result is probabilistic and a behavior change | O(√n) → O(log³ n) |
| GCD, LCM, linear Diophantine equations, modular inverses | Euclidean and extended Euclidean algorithm | — | O(log min(a, b)) |
| Combinations, factorial ratios modulo a prime | Precomputed factorials and inverse factorials | The modulus is prime and larger than n | O(n) per query → O(1) after O(n) setup |
| Large powers, modular exponentiation | Binary exponentiation | — | O(n) → O(log n) multiplications |
| Linear recurrences for large n | Matrix exponentiation | Recurrence of fixed order k | O(n·k) → O(k³ log n) |
| Polynomial multiplication, convolution, counting pair sums | FFT or NTT | Floating-point FFT rounds, so results can differ (behavior change) unless values are small enough to round back exactly, with a stated error bound. NTT computes the result **modulo a prime**: it equals the exact integer result only when the prime exceeds every possible output coefficient, or when several primes are combined with the Chinese remainder theorem | O(n²) → O(n log n) |
| XOR constraints, parity systems, maximum subset XOR | XOR basis; Gaussian elimination over GF(2) | — | Exponential subset search → O(n · bits), or O(n³/w) with bitsets |

## Numerical computation

Floating-point results depend on the order and form of every operation. Most techniques here change results, usually for the better: they are behavior changes under rule 5, never reasons to skip the technique. Report the before and after values on representative and adversarial inputs (for example, the error against a high-precision reference), and let the developer decide. Compilers must not reassociate the new code (no fast-math flags on it), or the technique can silently stop working.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Summing many floating-point values where accumulated rounding error matters | Kahan or Neumaier compensated summation (Neumaier also handles terms larger than the running sum) | Behavior change: results differ, usually closer to the exact sum. Strict floating-point semantics in the compiled code | Same O(n), a few more operations per element. Worst-case error bound grows with n for naive summation, and is nearly independent of n with compensation |
| Floating-point sum that should be vectorized or parallelized | Pairwise (cascade) summation | Behavior change: results differ | O(n); error bound grows as O(log n) instead of O(n); splits naturally into independent chunks |
| Sum must be identical regardless of order, chunking, or thread count | Reproducible summation: fixed-point integer accumulation, or an exact (superaccumulator) sum rounded once | Behavior change unless the original order was already fixed; value range is known for fixed point | Deterministic results that allow parallel and vectorized evaluation |
| Variance or standard deviation computed as mean of squares minus square of mean, or in two passes | Welford's online algorithm | Behavior change: avoids catastrophic cancellation, so results differ | Two passes → one pass, O(1) memory |
| Polynomial evaluated by computing each power separately | Horner's method | Behavior change in floating point (different rounding); exact for integers without overflow | O(n²) or O(n log n) multiplications → O(n) |
| Same linear system solved for many right-hand sides | Factorize once (LU, Cholesky, QR), then solve per right-hand side | Matrix does not change between solves; results may differ in the last bits | O(n³) per solve → O(n³) once + O(n²) per solve |
| Matrices or vectors that are mostly zeros | Sparse formats (CSR, CSC, COO) and sparse kernels | Density below a measured threshold (dense kernels win above it); summation order in the kernel may change floating-point results | O(n²) per matrix-vector product → O(nnz), with O(nnz) memory |
| Tight numeric loops in floating point | SIMD-friendly kernels: contiguous data, no aliasing, no data-dependent branches; vectorized math libraries | Vectorized reductions reorder additions (behavior change); vectorized math functions may round differently | Several times faster per core |
| Repeated exact arithmetic on integers or rationals carried in floating point | Integer or fixed-point arithmetic | Value ranges fit without overflow; switching from floating point is a behavior change | Faster on many platforms, and exact; required where floating point is unavailable (for example, most kernel code) |
