"""Mapbox token helpers for admin map views."""


def mapbox_token_status(token: str) -> str:
    """
    Return token readiness for admin maps.

    - missing: empty env var
    - invalid: placeholder/truncated/wrong prefix
    - ok: looks like a real Mapbox public token
    """
    cleaned = (token or "").strip()
    if not cleaned:
        return "missing"

    lowered = cleaned.lower()
    if "..." in cleaned or "your_mapbox" in lowered or lowered == "pk.":
        return "invalid"
    if not cleaned.startswith("pk."):
        return "invalid"
    # Public Mapbox tokens are long JWT-like strings; placeholders are much shorter.
    if len(cleaned) < 50:
        return "invalid"
    return "ok"
