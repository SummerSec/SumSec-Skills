"""
Right.Codes /v1/images/generations — CLI wrapper.
Requires: GPT_API_TOKEN env var, Python 3, requests.
"""
import argparse
import base64
import os
import sys
import urllib.request

API_BASE = "https://www.right.codes/draw"
ENDPOINT = f"{API_BASE}/v1/images/generations"


def main():
    parser = argparse.ArgumentParser(description="Generate AI images via Right.Codes API")
    parser.add_argument("prompt", help="Image description (Chinese or English)")
    parser.add_argument("--model", default="gpt-image-2", help="Model name (default: gpt-image-2)")
    parser.add_argument("--size", default="1024x1024", help="Output size, e.g. 1024x1024, 1792x1024")
    parser.add_argument("--image", action="append", default=[],
                        help="Reference image path or URL (repeatable)")
    parser.add_argument("--output", "-o", help="Download image to this file path")
    parser.add_argument("--response-format", choices=["url", "b64_json"], default="url",
                        help="Response format (default: url)")
    parser.add_argument("--json", action="store_true", help="Print full JSON response")
    args = parser.parse_args()

    api_key = os.environ.get("GPT_API_TOKEN")
    if not api_key:
        print("Error: GPT_API_TOKEN environment variable not set.", file=sys.stderr)
        print("  Set it via: $env:GPT_API_TOKEN = 'sk-...' (PowerShell)", file=sys.stderr)
        print("  Or: export GPT_API_TOKEN='sk-...' (Bash)", file=sys.stderr)
        sys.exit(1)

    # Prepare reference images
    images = []
    for ref in args.image:
        if ref.startswith("http://") or ref.startswith("https://"):
            images.append(ref)
        elif os.path.isfile(ref):
            with open(ref, "rb") as f:
                b64 = base64.b64encode(f.read()).decode()
            images.append(f"data:image/png;base64,{b64}")
        else:
            print(f"Warning: reference image not found, skipping: {ref}", file=sys.stderr)

    payload = {
        "model": args.model,
        "prompt": args.prompt,
        "size": args.size,
        "response_format": args.response_format,
    }
    if images:
        payload["image"] = images

    try:
        import requests
    except ImportError:
        print("Error: 'requests' library required. Install: pip install requests", file=sys.stderr)
        sys.exit(1)

    resp = requests.post(
        ENDPOINT,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
    )

    if not resp.ok:
        print(f"API error {resp.status_code}: {resp.text}", file=sys.stderr)
        sys.exit(1)

    data = resp.json()

    if args.json:
        import json
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return

    # Extract image URL
    items = data.get("data", [])
    if not items:
        print("Error: no image data in response.", file=sys.stderr)
        sys.exit(1)

    url = items[0].get("url")
    if not url:
        print("Error: no URL in response data.", file=sys.stderr)
        sys.exit(1)

    print(url)

    # Download if requested
    if args.output:
        print(f"Downloading to {args.output}...", file=sys.stderr)
        urllib.request.urlretrieve(url, args.output)
        print(f"Saved: {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()
