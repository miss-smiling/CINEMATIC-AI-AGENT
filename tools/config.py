"""
tools/config.py
───────────────
Centralised config loader.

Week 1-3 local dev:  reads from .env file
Week 4 / Cloud Run:  reads from GCP Secret Manager when USE_SECRET_MANAGER=true

All agent code imports from here — never os.getenv() directly in agents.
"""
from __future__ import annotations
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Config:
    # Gemini
    gemini_api_key:        str
    google_cloud_project:  str
    google_cloud_location: str

    # Image model
    image_model:           str

    # ClickHouse (blank = local mode in Week 1)
    ch_host:               str
    ch_port:               int
    ch_user:               str
    ch_password:           str
    ch_database:           str

    # Flags
    use_secret_manager:    bool

    @property
    def clickhouse_ready(self) -> bool:
        """True when ClickHouse env vars are provided (Week 2+)."""
        return bool(self.ch_host and self.ch_password)


def load_config() -> Config:
    """
    Load config from environment.
    In Week 4 production, swap the os.getenv calls here with
    Secret Manager reads — everything else stays the same.
    """
    use_sm = os.getenv("USE_SECRET_MANAGER", "false").lower() == "true"

    if use_sm:
        # Phase 5: pull from GCP Secret Manager
        # Member 4 wires this in during deployment week
        from google.cloud import secretmanager  # type: ignore
        client  = secretmanager.SecretManagerServiceClient()
        project = os.getenv("GCP_SECRET_PROJECT", "")

        def _secret(name: str) -> str:
            path = f"projects/{project}/secrets/{name}/versions/latest"
            return client.access_secret_version(name=path).payload.data.decode()

        return Config(
            gemini_api_key        = _secret("GEMINI_API_KEY"),
            google_cloud_project  = _secret("GOOGLE_CLOUD_PROJECT"),
            google_cloud_location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
            image_model           = _secret("IMAGE_MODEL"),
            ch_host               = _secret("CH_HOST"),
            ch_port               = int(_secret("CH_PORT") or 8443),
            ch_user               = _secret("CH_USER"),
            ch_password           = _secret("CH_PASSWORD"),
            ch_database           = _secret("CH_DATABASE"),
            use_secret_manager    = True,
        )

    # Local dev — read from .env
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set.\n"
            "1. Copy .env.example → .env\n"
            "2. Add your key from https://aistudio.google.com/app/apikey"
        )

    return Config(
        gemini_api_key        = gemini_key,
        google_cloud_project  = os.getenv("GOOGLE_CLOUD_PROJECT", ""),
        google_cloud_location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        image_model           = os.getenv("IMAGE_MODEL", "imagen-4.0-fast-generate-001"),
        ch_host               = os.getenv("CH_HOST", ""),
        ch_port               = int(os.getenv("CH_PORT", 8443)),
        ch_user               = os.getenv("CH_USER", "default"),
        ch_password           = os.getenv("CH_PASSWORD", ""),
        ch_database           = os.getenv("CH_DATABASE", "agentic_cinema"),
        use_secret_manager    = False,
    )
