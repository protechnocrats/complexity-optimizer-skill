"""Business-day arithmetic for delivery promises."""

from datetime import date, timedelta

FIXED_HOLIDAYS = [(1, 1), (7, 4), (12, 25)]
FIRST_SUPPORTED = date(2000, 1, 1)
LAST_SUPPORTED = date(2099, 12, 31)


def observed_holidays(year: int) -> set[date]:
    """Days off for the company's fixed holidays in `year`.

    A holiday on a Saturday is observed on the Friday before it, and one on a
    Sunday on the Monday after it, even when that moves it into another year.
    """
    days = set()
    for month, day in FIXED_HOLIDAYS:
        holiday = date(year, month, day)
        if holiday.weekday() == 5:
            holiday -= timedelta(days=1)
        elif holiday.weekday() == 6:
            holiday += timedelta(days=1)
        days.add(holiday)
    return days


def business_days_between(start: date, end: date) -> int:
    """Business days d with start <= d < end: Monday to Friday, excluding
    observed holidays. Returns 0 when end <= start. Dates must lie between
    FIRST_SUPPORTED and LAST_SUPPORTED, inclusive; otherwise raises ValueError.
    Called for every shipment's delivery promise.
    """
    for d in (start, end):
        if not FIRST_SUPPORTED <= d <= LAST_SUPPORTED:
            raise ValueError(f"unsupported date: {d}")
    count = 0
    day = start
    while day < end:
        days_off = observed_holidays(day.year) | observed_holidays(day.year + 1)
        if day.weekday() < 5 and day not in days_off:
            count += 1
        day += timedelta(days=1)
    return count
