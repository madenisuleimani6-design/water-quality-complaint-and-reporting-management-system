import json
import re

import requests

s = requests.Session()
login = s.get("http://127.0.0.1:8000/admin/login/")
csrf = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', login.text).group(1)
s.post(
    "http://127.0.0.1:8000/admin/login/",
    data={
        "username": "admin",
        "password": "ChangeMe123!",
        "csrfmiddlewaretoken": csrf,
        "next": "/admin/",
    },
    headers={"Referer": "http://127.0.0.1:8000/admin/login/"},
)
r = s.get("http://127.0.0.1:8000/admin/complaints/complaint/map/")
m = re.search(r'id="complaint-geojson"[^>]*>(.*?)</script>', r.text, re.S)
parsed = json.loads(m.group(1))
print("parsed type", type(parsed).__name__)
print("features", len(parsed.get("features", [])))
