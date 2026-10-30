"""Bulk API helpers."""


def repeated_ids(request_ids: list[int]) -> list[int]:
    """IDs that appear more than once in a bulk request, in ascending order.

    `request_ids` is the body of a client's bulk request, as sent; the API
    accepts up to 100,000 IDs per request.
    """
    repeated = []
    for request_id in request_ids:
        if request_id not in repeated and request_ids.count(request_id) > 1:
            repeated.append(request_id)
    return sorted(repeated)
