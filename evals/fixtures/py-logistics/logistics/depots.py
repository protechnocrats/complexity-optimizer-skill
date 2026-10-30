"""Assigns orders to depots."""

import math

# The network's depots: (name, latitude, longitude).
DEPOTS = [
    ("SEA", 47.45, -122.31), ("SFO", 37.62, -122.38), ("LAX", 33.94, -118.41),
    ("PHX", 33.43, -112.01), ("DEN", 39.86, -104.67), ("DFW", 32.90, -97.04),
    ("ORD", 41.98, -87.90), ("ATL", 33.64, -84.43), ("MIA", 25.79, -80.29),
    ("JFK", 40.64, -73.78), ("BOS", 42.36, -71.01), ("MSP", 44.88, -93.22),
]

EARTH_RADIUS_KM = 6371.0


def _distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def nearest_depot(lat: float, lon: float) -> str:
    """Name of the depot closest to (lat, lon) by great-circle distance.
    Called for every order when orders are routed. On a tie, the depot listed first wins."""
    best_name, best_distance = None, None
    for name, depot_lat, depot_lon in DEPOTS:
        distance = _distance_km(lat, lon, depot_lat, depot_lon)
        if best_distance is None or distance < best_distance:
            best_name, best_distance = name, distance
    return best_name
