"""
tools/image_generator.py

Gemini image generation integration — the locked image model for this project.

Based on: Hackathon Phase 2 — Imagen 3 Image Generation Guide
https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/getting-started/intro_gemini_3_image_gen.ipynb

Model: gemini-2.5-flash-image
Cost:  $0.02 per image (project estimate)
Budget:$200 credits → ~180 full 50-shot pipeline runs at 2 regen attempts/shot

This replaces the `image_url=None` stub in cinematographer_agent.py.

How to wire it in:
    from tools.image_generator import generate_shot_image
    image_path = generate_shot_image(prompt, shot_number)
"""
import os
from pathlib import Path
from typing import Optional

from rich.console import Console

console = Console()

# ── Model constants ───────────────────────────────────────────────────────────
IMAGE_MODEL = "gemini-2.5-flash-image"
COST_PER_IMAGE = 0.02
DEFAULT_RATIO = "16:9"


def generate_shot_image(
    prompt: str,
    shot_number: int,
    output_dir: str = "output/images",
    aspect_ratio: str = DEFAULT_RATIO,
    project_id: Optional[str] = None,
    location: str = "us-central1",
) -> str:
    """
    Generate one image for a shot using Gemini image generation.

    Args:
        prompt:       The grounded image prompt from CinematographerAgent
        shot_number:  Used for output filename
        output_dir:   Local directory to save the PNG
        aspect_ratio: "16:9" for cinematic widescreen
        project_id:   GCP project ID (falls back to GCP_PROJECT env var)
        location:     Vertex AI region

    Returns:
        Local file path to the saved PNG, e.g. "output/images/shot_003.png"

    Raises:
        RuntimeError: if the API call fails or no image is returned
        ValueError:   if GCP_PROJECT is not set
    """
    # ── lazy import so SDK is only needed when actually called ────────────────
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise ImportError(
            "google-genai not installed.\n"
            "Run: pip install google-genai"
        )

    pid = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
    if not pid:
        raise ValueError(
            "GCP_PROJECT not set. Add it to your .env file:\n"
            "GCP_PROJECT=your-project-id"
        )

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    output_path = str(Path(output_dir) / f"shot_{shot_number:03d}.png")

    console.print(
        f"  [cyan]Gemini Image[/] generating shot {shot_number} "
        f"[dim]({COST_PER_IMAGE:.2f} estimated credit)[/]"
    )

    try:
        client = genai.Client(
            vertexai=True,
            project=pid,
            location=location,
        )

        response = client.models.generate_content(
            model=IMAGE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                ),
            ),
        )
    except Exception as e:
        raise RuntimeError(
            f"Gemini image generation failed on shot {shot_number}: {e}\n"
            f"Check: GCP project billing, Vertex AI API enabled, region={location}"
        ) from e
    
    generated_image = None

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            generated_image = part.inline_data.data
            break

    if generated_image is None:
        raise RuntimeError(
            f"Gemini returned no image for shot {shot_number}.\n"
            f"Prompt may have triggered safety filters. Prompt:\n{prompt[:300]}"
        )

    with open(output_path, "wb") as f:
        f.write(generated_image)
    console.print(f"  [bold green]✓[/] Shot {shot_number} saved → {output_path}")
    return output_path

    generated_image.save(output_path)
    console.print(f"  [bold green]✓[/] Shot {shot_number} saved → {output_path}")
    return output_path


def cost_estimate(num_shots: int, regen_attempts: int = 2) -> dict:
    """
    Quick cost estimate before a run — call this to sanity-check.

    Args:
        num_shots:       total shots in the pipeline run
        regen_attempts:  average image attempts per shot (default 2)

    Returns:
        dict with cost breakdown
    """
    total_images = num_shots * regen_attempts
    total_cost   = total_images * COST_PER_IMAGE
    runs_per_200 = int(200 / total_cost) if total_cost > 0 else 0

    return {
        "model":          IMAGE_MODEL,
        "cost_per_image": COST_PER_IMAGE,
        "shots":          num_shots,
        "regen_attempts": regen_attempts,
        "total_images":   total_images,
        "total_cost_usd": round(total_cost, 4),
        "runs_within_200_credits": runs_per_200,
    }


# ── Quick self-test (no API call) ─────────────────────────────────────────────
if __name__ == "__main__":
    import json
    estimate = cost_estimate(num_shots=50, regen_attempts=2)
    console.print("\n[bold]Cost estimate for 50-shot run:[/]")
    console.print(json.dumps(estimate, indent=2))
    console.print(
        f"\n[bold green]✓ At $0.02/image:[/] "
        f"{estimate['runs_within_200_credits']} full runs within $200 credits"
    )
