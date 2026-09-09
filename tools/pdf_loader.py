"""
tools/pdf_loader.py

Real script entry point for Member 1.
Extracts screenplay text from a PDF using Gemini document understanding.

Based on: Hackathon Phase 2 — Document Processing Guide
https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/use-cases/document-processing/document_processing.ipynb

Usage:
    from tools.pdf_loader import load_script
    script_text = load_script("scripts/my_screenplay.pdf")
    script_text = load_script("my raw story text")   # raw string passthrough
"""
import os
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types
from rich.console import Console

console = Console()

EXTRACTION_PROMPT = """
You are extracting a screenplay or story from this PDF document.
Extract ALL content in order: scene headings, action lines, character names, dialogue, transitions.
Preserve original structure and order.
Return plain text only — no markdown, no commentary, no preamble.
If this is prose rather than a screenplay, extract the full text as-is.
"""


def load_script_from_pdf(pdf_path: str, api_key: Optional[str] = None) -> str:
    """Extract screenplay text from a PDF using Gemini. Returns plain string."""
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY not set.")
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    console.print(f"[bold cyan]PDF Loader[/] reading {path.name} ({path.stat().st_size // 1024} KB)")
    client = genai.Client(api_key=key)
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
            EXTRACTION_PROMPT,
        ],
    )
    text = response.text.strip()
    console.print(f"[bold green]✓ Extracted[/] {len(text)} chars from {path.name}")
    return text


def load_script(source: str, api_key: Optional[str] = None) -> str:
    """
    Smart loader — auto-detects PDF, .txt file, or raw text string.
    Raw string is returned as-is (use for Week 1 quick testing).
    """
    p = Path(source)
    if p.exists():
        if p.suffix.lower() == ".pdf":
            return load_script_from_pdf(source, api_key)
        text = p.read_text(encoding="utf-8").strip()
        console.print(f"[bold green]✓ Loaded[/] {len(text)} chars from {p.name}")
        return text
    console.print(f"[bold yellow]PDF Loader[/] using raw text input ({len(source)} chars)")
    return source
