#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LUMINA CMS - Flask backend for editable landing page.
Serves public site, admin panel, and content API.
"""
import json
import os
import re
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_PATH = os.path.join(BASE_DIR, "content.json")
BACKUP_DIR = os.path.join(BASE_DIR, "backups")

app = Flask(__name__, static_folder="static")


def load_content():
    """Load content.json from disk."""
    with open(CONTENT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_content(data):
    """Save content.json with backup rotation."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"content_{timestamp}.json")

    # Keep last 20 backups
    backups = sorted(os.listdir(BACKUP_DIR))
    for old in backups[:-19]:
        os.remove(os.path.join(BACKUP_DIR, old))

    # Backup current before overwriting
    if os.path.exists(CONTENT_PATH):
        with open(CONTENT_PATH, "r", encoding="utf-8") as src:
            with open(backup_path, "w", encoding="utf-8") as dst:
                dst.write(src.read())

    with open(CONTENT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/admin")
def admin():
    return send_from_directory("static", "admin.html")


@app.route("/js/<path:path>")
def send_js(path):
    return send_from_directory("static/js", path)


@app.route("/api/content", methods=["GET"])
def get_content():
    return jsonify(load_content())


@app.route("/api/content", methods=["POST"])
def update_content():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Invalid JSON"}), 400

    # Simple validation: must match top-level keys of current content
    current = load_content()
    unknown_keys = set(data.keys()) - set(current.keys())
    if unknown_keys:
        return jsonify({"success": False, "error": f"Unknown keys: {unknown_keys}"}), 400

    save_content(data)
    return jsonify({"success": True})


@app.route("/api/restart", methods=["POST"])
def restart_hint():
    """Placeholder: production restart is handled by systemd."""
    return jsonify({"success": True, "message": "Content saved. systemd will reload the service on next check, or you can run: sudo systemctl restart lumina-cms"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=False)
