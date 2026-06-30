#!/usr/bin/env python3
"""Apply data-cms attributes to static/index.html based on content.json."""
import json
import re
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(BASE, "static", "index.html")
JSON_PATH = os.path.join(BASE, "content.json")

with open(JSON_PATH, "r", encoding="utf-8") as f:
    content = json.load(f)

with open(HTML_PATH, "r", encoding="utf-8") as f:
    html = f.read()

# Mapping of CMS paths to regex patterns that uniquely identify text nodes.
# We replace the inner text/HTML of the containing tag with a data-cms marker.
replacements = [
    ("site.title", r"(<title>)[^<]+(</title>)", 1),
    ("nav.brand", r'(<span class="font-display text-2xl font-bold tracking-tight">)[^<]+(</span>)', 1),
    ("hero.headline", r'(<h1 class="font-display text-5xl md:text-7xl lg:text-8xl[^"]*">)[\s\S]*?(</h1>)', 1),
    ("hero.description", r'(<p class="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed reveal">)[\s\S]*?(</p>)', 1),
    ("hero.cta_primary", r'(<a href="#contact" class="btn-primary flex items-center gap-2">)[\s\S]*?(</a>)', 1),
    ("hero.cta_secondary", r'(<a href="#product" class="btn-outline flex items-center gap-2">)[\s\S]*?(</a>)', 1),
    ("hero.social_proof", r'(<p class="text-sm text-white/60">)[\s\S]*?(</p>)', 1),
    ("features.title", r'(<h2 class="font-display text-4xl md:text-6xl font-bold">)[\s\S]*?(</h2>)', 1),
    ("features.description", r'(<p class="text-lg text-white/60 max-w-2xl">)[\s\S]*?(</p>)', 1),
    ("workflow.title", r'(<h2 class="font-display text-4xl md:text-6xl font-bold mt-4">)[\s\S]*?(</h2>)', 1),
    ("cases.title", r'(<h2 class="font-display text-4xl md:text-6xl font-bold mt-4">)[\s\S]*?(</h2>)', 1),
    ("stats.title", r'(<h2 class="font-display text-4xl md:text-6xl font-bold">)[\s\S]*?(</h2>)', 1),
    ("cta.title", r'(<h2 class="font-display text-5xl md:text-7xl font-bold">)[\s\S]*?(</h2>)', 1),
    ("cta.description", r'(<p class="text-lg text-white/70 max-w-2xl">)[\s\S]*?(</p>)', 1),
    ("contact.title", r'(<h2 class="font-display text-4xl md:text-5xl font-bold mb-8">)[\s\S]*?(</h2>)', 1),
    ("footer.tagline", r'(<p class="text-white/50 max-w-xs">)[\s\S]*?(</p>)', 1),
    ("footer.copyright", r'(<p class="text-white/40 text-sm">)[\s\S]*?(</p>)', 1),
]

for path, pattern, group in replacements:
    def replacer(m, path=path, group=group):
        # preserve opening tag, inject data-cms, close
        open_tag = m.group(group)
        # add data-cms to opening tag
        if 'data-cms=' in open_tag:
            return m.group(0)
        if open_tag.endswith('>'):
            new_open = open_tag[:-1] + f' data-cms="{path}">'
        else:
            new_open = open_tag
        return new_open + ''.join(m.group(i+1) for i in range(group, len(m.groups()))) + m.group(len(m.groups())+1)

    new_html, count = re.subn(pattern, replacer, html, count=1)
    if count == 0:
        print(f"WARN: no match for {path}")
    else:
        html = new_html

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html)

print("Applied data-cms attributes to", HTML_PATH)
