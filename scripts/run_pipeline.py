"""
scripts/run_pipeline.py

Week 1 proof script — updated to use pdf_loader and image_generator.
Run this and it should work end-to-end on a 5-shot test case.

Usage:
    python scripts/run_pipeline.py                         # default story, 5 shots
    python scripts/run_pipeline.py --script path/to.pdf   # real PDF screenplay
    python scripts/run_pipeline.py --script story.txt      # plain text file
    python scripts/run_pipeline.py --shots 10              # more shots
    python scripts/run_pipeline.py --dry-run               # skip image generation
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from rich.console import Console
from rich.rule import Rule
from rich.table import Table
# add this line alongside the other imports
from tools.config import load_config

load_dotenv()

from agents.director_agent        import DirectorAgent
from agents.cinematographer_agent import CinematographerAgent
from tools.memory_client          import MemoryClient
from tools.pdf_loader             import load_script
from tools.image_generator        import cost_estimate

console = Console()

DEFAULT_STORY = """
A woman named Elena discovers an ancient journal in her grandmother's attic.
She opens it and reads a name she recognises — her own.
Terrified, she runs outside into the rain.
A stranger in a black coat is already standing at her gate, waiting.
Elena and the stranger face each other across the fence as lightning flashes.
"""


def main():
    parser = argparse.ArgumentParser(description="Agentic Cinema — Week 1 Pipeline")
    parser.add_argument("--script",  type=str, default=None,  help="PDF / txt path or raw story text")
    parser.add_argument("--shots",   type=int, default=5,     help="Number of shots")
    parser.add_argument("--output",  type=str, default="output/week1_results.json")
    parser.add_argument("--dry-run", action="store_true",     help="Skip image generation (saves credits)")
    args = parser.parse_args()

    os.makedirs("output", exist_ok=True)

    console.print(Rule("[bold cyan]Agentic Cinema — Week 1 Pipeline[/]"))

    # ── Cost preview ──────────────────────────────────────────────────────────
    est = cost_estimate(num_shots=args.shots, regen_attempts=2)
    console.print(
        f"\n[dim]Cost estimate:[/] "
        f"${est['total_cost_usd']:.4f} for this run  |  "
        f"{est['runs_within_200_credits']} runs within $200 credits\n"
    )

    # ── Step 1: Load script ───────────────────────────────────────────────────
    console.print(Rule("[bold]Step 1 — Load script[/]"))
    raw_script = load_script(args.script or DEFAULT_STORY)
    console.print()

    # ── Step 2: Director Agent ────────────────────────────────────────────────
    console.print(Rule("[bold]Step 2 — Director Agent[/]"))
    config   = load_config()
    director = DirectorAgent(config)
    shot_list = director.generate_shot_list(raw_script, num_shots=args.shots)
    with open("output/shot_list.json", "w") as f:
        f.write(shot_list.model_dump_json(indent=2))
    console.print(f"[dim]Shot list saved → output/shot_list.json[/]\n")

    # ── Step 3: Memory client ─────────────────────────────────────────────────
    console.print(Rule("[bold]Step 3 — Memory client[/]"))
    memory = MemoryClient(config)
    console.print(f"Status: {memory.status()}\n")

    # ── Step 4: Cinematographer Agent ─────────────────────────────────────────
    console.print(Rule("[bold]Step 4 — Cinematographer Agent[/]"))
    cinematographer = CinematographerAgent(config=config, memory=memory)

    results = []
    for shot in shot_list.shots:
        result      = cinematographer.process_shot(shot, shot_list.total_shots)
        prompt      = result.image_prompt
        used_memory = result.used_memory
        image_path  = result.image_url

        results.append({
            "shot_number": shot.shot_number,
            "prompt":      prompt,
            "image_path":  image_path,
            "used_memory": used_memory,
    })

    console.print()

    # ── Summary ───────────────────────────────────────────────────────────────
    console.print(Rule("[bold green]Week 1 Results[/]"))
    t = Table(title="Pipeline output", show_lines=True, header_style="bold cyan")
    t.add_column("Shot", width=5,  justify="center")
    t.add_column("Memory?", width=10, justify="center")
    t.add_column("Image", width=22)
    t.add_column("Prompt (first 100 chars)", min_width=50)
    for r in results:
        t.add_row(
            str(r["shot_number"]),
            "[green]Yes[/]" if r["used_memory"] else "[yellow]First[/]",
            r["image_path"] or "[dim]dry-run[/]",
            r["prompt"][:100] + "…"
        )
    console.print(t)

    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)
    console.print(f"\n[bold green]✓ Done.[/] Full results → {args.output}")

    # ── Week 1 checklist ──────────────────────────────────────────────────────
    console.print()
    console.print("[dim]Week 1 checklist:[/]")
    console.print("  [green]✓[/] PDF loader — real screenplay input supported")
    console.print("  [green]✓[/] Director Agent — structured shot list from script")
    console.print("  [green]✓[/] MemoryClient — local mode (switch to ClickHouse MCP in Week 2)")
    console.print("  [green]✓[/] Cinematographer Agent — memory-grounded prompts")
    img_status = "[green]✓[/]" if not args.dry_run else "[yellow]○[/] (dry-run)"
    console.print(f"  {img_status} Imagen 4 Fast — real images generated")
    console.print("  [yellow]○[/] BullMQ queue — add before Week 2 integration")
    console.print("  [yellow]○[/] ClickHouse MCP swap — coordinate with Member 2")
    console.print()


if __name__ == "__main__":
    main()
