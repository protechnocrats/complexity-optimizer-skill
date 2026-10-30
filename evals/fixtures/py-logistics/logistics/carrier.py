"""Client for the carrier's quoting API."""


class CarrierClient:
    """Thread-safe. Each call to `quote` is one HTTPS request to the carrier."""

    def __init__(self, session):
        self._session = session

    def quote(self, shipment_id: str, lanes: list[str]) -> int:
        """Price in cents for moving the shipment through `lanes`, in order."""
        response = self._session.post("/v2/quotes", json={"shipment": shipment_id, "lanes": lanes})
        return int(response["cents"])
