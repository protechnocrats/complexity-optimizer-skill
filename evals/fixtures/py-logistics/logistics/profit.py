"""Depot profit analysis."""


def best_run(daily_profit: list[int]) -> int:
    """Largest total profit over a run of consecutive days.

    The planner may drop at most one day from the run (a day the depot could
    have stayed closed). A run always keeps at least one day after dropping.
    Raises ValueError for an empty list. Run nightly for every depot.
    """
    if not daily_profit:
        raise ValueError("no days")
    best = None
    for i in range(len(daily_profit)):
        for j in range(i, len(daily_profit)):
            window = daily_profit[i:j + 1]
            total = sum(window)
            candidates = [total]
            if len(window) > 1:
                for k in range(len(window)):
                    candidates.append(total - window[k])
            for candidate in candidates:
                if best is None or candidate > best:
                    best = candidate
    return best
