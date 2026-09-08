"""
setup.py — run this once to verify your environment is correct.

Usage:  python setup.py
"""
import subprocess, sys, os

REQUIRED = [
    ("google-genai",        "google.genai",       "2.0.0"),
    ("clickhouse-connect",  "clickhouse_connect", "0.7.0"),
    ("pydantic",            "pydantic",           "2.0.0"),
    ("python-dotenv",       "dotenv",             "0.19.0"),
    ("rich",                "rich",               "13.0.0"),
    ("pytest",              "pytest",             "8.0.0"),
]

MUST_REMOVE = ["google-generativeai"]

print("\n── Agentic Cinema — Environment Setup Check ──\n")

# 1. Remove deprecated packages
for pkg in MUST_REMOVE:
    result = subprocess.run(
        [sys.executable, "-m", "pip", "show", pkg],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(f"  Removing deprecated package: {pkg}")
        subprocess.run(
            [sys.executable, "-m", "pip", "uninstall", pkg, "-y"],
            capture_output=True
        )
    else:
        print(f"  OK   {pkg} not present (good)")

print()

# 2. Install / verify required packages
missing = []
for pip_name, import_name, min_ver in REQUIRED:
    try:
        mod = __import__(import_name)
        ver = getattr(mod, "__version__", getattr(mod, "VERSION", "ok"))
        print(f"  OK   {pip_name:<28} {ver}")
    except ImportError:
        missing.append(pip_name)
        print(f"  MISS {pip_name}")

if missing:
    print(f"\n  Installing missing: {missing}")
    subprocess.run(
        [sys.executable, "-m", "pip", "install"] + missing + ["--quiet"],
        check=True
    )
    print("  Done. Re-run setup.py to confirm.")
    sys.exit(0)

print()

# 3. Check .env
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("  WARN  GEMINI_API_KEY not found in .env")
    print("        Copy .env.example → .env and add your key")
    print("        Get it from: https://aistudio.google.com/app/apikey")
else:
    masked = api_key[:6] + "..." + api_key[-4:]
    print(f"  OK   GEMINI_API_KEY found ({masked})")

print()

# 4. Live API smoke test
if api_key:
    print("  Running live API smoke test (gemini-3.6-flash)...")
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        r = client.models.generate_content(
            model="gemini-3.6-flash",
            contents="Respond with exactly: PIPELINE READY"
        )
        print(f"  OK   Gemini response: {r.text.strip()}")
    except Exception as e:
        print(f"  FAIL Gemini API error: {e}")
        print("       Check: API key valid, billing enabled, Gemini API enabled in GCP")
        sys.exit(1)
else:
    print("  SKIP Live API test (no key set)")

print()
print("── All checks passed. Run: python scripts/run_pipeline.py --dry-run ──\n")