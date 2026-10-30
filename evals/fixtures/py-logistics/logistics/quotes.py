"""Collects carrier quotes for a batch of shipments."""

import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass


@dataclass(frozen=True)
class Shipment:
    id: str
    stops: tuple[str, ...]


class QuoteBook:
    def __init__(self, carrier):
        self._carrier = carrier
        self._lock = threading.Lock()
        self._quotes: dict[str, int] = {}
        self.requests_made = 0

    def _quote_one(self, shipment: Shipment) -> None:
        with self._lock:
            lanes: list[str] = []
            for stop in shipment.stops:
                if stop not in lanes:
                    lanes.append(stop)
            price = self._carrier.quote(shipment.id, lanes)
            self._quotes[shipment.id] = price
            self.requests_made += 1

    def quote_all(self, shipments: list[Shipment], workers: int = 8) -> dict[str, int]:
        """Quotes every shipment and returns the prices in shipment order."""
        with ThreadPoolExecutor(max_workers=workers) as pool:
            list(pool.map(self._quote_one, shipments))
        return {shipment.id: self._quotes[shipment.id] for shipment in shipments}
