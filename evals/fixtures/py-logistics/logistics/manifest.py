"""Truck unloading checks."""


def unmatched_parcels(scanned: list[str], manifest: list[str]) -> list[str]:
    """Scanned parcel codes that are not on the manifest, in scan order, keeping repeats."""
    return [code for code in scanned if code not in manifest]
