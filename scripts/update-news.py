#!/usr/bin/env python3
"""Fetch a filtered GTA VI news digest from Google News RSS.
Only publishers in ALLOWED_DOMAINS are included. Items retain publisher attribution
and the Google News redirect URL; this is a discovery feed, not a fact-check.
"""
from __future__ import annotations
import datetime as dt
import html
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "news.json"
ALLOWED_DOMAINS = {
    "rockstargames.com", "ign.com", "gamespot.com", "pcgamer.com",
    "eurogamer.net", "videogameschronicle.com", "insider-gaming.com",
    "polygon.com", "gamesradar.com", "kotaku.com", "pushsquare.com",
    "purexbox.com", "destructoid.com", "thegamer.com", "gameinformer.com",
    "vg247.com", "dexerto.com", "comicbook.com"
}
QUERY = '"Grand Theft Auto VI" OR "GTA 6"'
FEED = "https://news.google.com/rss/search?" + urllib.parse.urlencode({
    "q": QUERY, "hl": "en-US", "gl": "US", "ceid": "US:en"
})

def clean(value: str) -> str:
    value = html.unescape(re.sub(r"<[^>]+>", " ", value or ""))
    return re.sub(r"\s+", " ", value).strip()

def allowed(domain: str) -> bool:
    domain = (domain or "").lower().replace("www.", "")
    return any(domain == d or domain.endswith("." + d) for d in ALLOWED_DOMAINS)

def main() -> None:
    req = urllib.request.Request(FEED, headers={"User-Agent": "GTA6CentralNewsBot/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read()
    root = ET.fromstring(raw)
    items = []
    channel = root.find("channel")
    if channel is None:
        raise RuntimeError("RSS response did not contain a channel")
    for item in channel.findall("item"):
        title = clean(item.findtext("title", ""))
        link = (item.findtext("link", "") or "").strip()
        description = clean(item.findtext("description", ""))
        source_el = item.find("source")
        source = clean(source_el.text or "") if source_el is not None else "Google News source"
        source_url = source_el.attrib.get("url", "") if source_el is not None else ""
        domain = urllib.parse.urlparse(source_url).netloc.lower().replace("www.", "")
        pub = item.findtext("pubDate", "")
        try:
            published = dt.datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %Z").replace(tzinfo=dt.timezone.utc)
            date = published.date().isoformat()
        except Exception:
            date = ""
        if not title or not link or not allowed(domain):
            continue
        if not re.search(r"\b(GTA\s*6|Grand Theft Auto VI|Grand Theft Auto 6)\b", title, re.I):
            continue
        items.append({
            "id": re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:72],
            "title": title, "source": source, "date": date,
            "summary": description[:420], "url": link,
            "official": domain == "rockstargames.com"
        })
    # Deduplicate and keep newest first.
    unique = {}
    for entry in items:
        unique[(entry["title"].lower(), entry["source"].lower())] = entry
    items = sorted(unique.values(), key=lambda x: x.get("date", ""), reverse=True)[:24]
    payload = {"updatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"), "items": items}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} articles to {OUT}")
    if not items:
        print("Warning: no results matched the publisher allow-list; existing feed may need manual review.")

if __name__ == "__main__":
    main()
