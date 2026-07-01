import math
from dataclasses import dataclass
from datetime import date

from apps.complaints.models import Complaint


@dataclass
class Hotspot:
    latitude: float
    longitude: float
    area_name: str
    complaint_count: int
    resolved_count: int


def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 2 * radius * math.asin(math.sqrt(a))


def cluster_hotspots(
    complaints: list[Complaint],
    radius_meters: float = 500,
    min_cluster_size: int = 3,
) -> list[Hotspot]:
    located = [
        c
        for c in complaints
        if c.latitude is not None and c.longitude is not None
    ]
    clusters: list[list[Complaint]] = []
    visited: set = set()

    for i, complaint in enumerate(located):
        if i in visited:
            continue
        cluster = [complaint]
        visited.add(i)
        for j, other in enumerate(located):
            if j in visited:
                continue
            distance = haversine_meters(
                complaint.latitude,
                complaint.longitude,
                other.latitude,
                other.longitude,
            )
            if distance <= radius_meters:
                cluster.append(other)
                visited.add(j)
        if len(cluster) >= min_cluster_size:
            clusters.append(cluster)

    hotspots: list[Hotspot] = []
    for cluster in clusters:
        lat = sum(c.latitude for c in cluster) / len(cluster)
        lon = sum(c.longitude for c in cluster) / len(cluster)
        area_name = next((c.area_name for c in cluster if c.area_name), "")
        resolved = sum(1 for c in cluster if c.status == Complaint.STATUS_RESOLVED)
        hotspots.append(
            Hotspot(
                latitude=lat,
                longitude=lon,
                area_name=area_name,
                complaint_count=len(cluster),
                resolved_count=resolved,
            )
        )

    hotspots.sort(key=lambda h: h.complaint_count, reverse=True)
    return hotspots


def complaints_for_month(year: int, month: int):
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    return list(
        Complaint.objects.filter(
            submitted_at__date__gte=start,
            submitted_at__date__lt=end,
        )
    )
