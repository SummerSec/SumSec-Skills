"""
OpenAI-compatible /v1/images/generations CLI wrapper.
Supports: OpenAI, Azure OpenAI, Right.Codes, and any OpenAI-compatible endpoint.
Requires: API key env var + Python 3 + requests.
"""
import argparse
import base64
import os
import sys
import urllib.request

DEFAULT_BASE_URL = "https://www.right.codes/draw"


def resolve_api_key():
    for var in ("OPENAI_API_KEY", "GPT_API_TOKEN"):
        key = os.environ.get(var)
        if key:
            return key
    return None


def resolve_base_url(cli_override=None):
    if cli_override:
        return cli_override.rstrip("/")
    url = os.environ.get("OPENAI_BASE_URL", DEFAULT_BASE_URL)
    return url.rstrip("/")


def main():
    parser = argparse.ArgumentParser(
        description="Generate AI images via OpenAI-compatible API"
    )
    parser.add_argument("prompt", help="Image description (Chinese or English)")
    parser.add_argument("--model", default="gpt-image-2",
                        help="Model name (default: gpt-image-2)")
    parser.add_argument("--size", default="1024x1024",
                        help="Output size, e.g. 1024x1024, 1792x1024, 1024x1792")
    parser.add_argument("-n", type=int, default=1,
                        help="Number of images to generate (default: 1)")
    parser.add_argument("--quality", choices=["auto", "low", "medium", "high", "hd", "standard"],
                        help="Image quality (model-dependent)")
    parser.add_argument("--style", choices=["vivid", "natural"],
                        help="Image style (DALL-E 3 only)")
    parser.add_argument("--image", action="append", default=[],
                        help="Reference image path or URL (repeatable)")
    parser.add_argument("--output", "-o", help="Download image to this file path")
    parser.add_argument("--response-format", choices=["url", "b64_json"], default="url",
                        help="Response format (default: url)")
    parser.add_argument("--json", action="store_true", help="Print full JSON response")
    parser.add_argument("--base-url", help="Override API base URL")
    args = parser.parse_args()

    api_key = resolve_api_key()
    if not api_key:
        print("Error: API key not set.", file=sys.stderr)
        print("  Set one of: OPENAI_API_KEY or GPT_API_TOKEN", file=sys.stderr)
        print("  Example: export OPENAI_API_KEY='sk-...'", file=sys.stderr)
        sys.exit(1)

    base_url = resolve_base_url(args.base_url)
    endpoint = f"{base_url}/v1/images/generations"

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
        "n": args.n,
        "response_format": args.response_format,
    }
    if args.quality:
        payload["quality"] = args.quality
    if args.style:
        payload["style"] = args.style
    if images:
        payload["image"] = images

    try:
        import requests
    except ImportError:
        print("Error: 'requests' library required. Install: pip install requests", file=sys.stderr)
        sys.exit(1)

    resp = requests.post(
        endpoint,
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

    items = data.get("data", [])
    if not items:
        print("Error: no image data in response.", file=sys.stderr)
        sys.exit(1)

    for i, item in enumerate(items):
        url = item.get("url")
        if not url:
            b64_data = item.get("b64_json")
            if b64_data and args.output:
                suffix = f"_{i}" if len(items) > 1 else ""
                out_path = _insert_suffix(args.output, suffix)
                with open(out_path, "wb") as f:
                    f.write(base64.b64decode(b64_data))
                print(f"Saved: {out_path}", file=sys.stderr)
            elif b64_data:
                print(f"[image {i+1}] b64_json returned (use --output to save)")
            else:
                print(f"Warning: no URL or b64_json in item {i+1}", file=sys.stderr)
            continue

        print(url)

        if args.output:
            suffix = f"_{i}" if len(items) > 1 else ""
            out_path = _insert_suffix(args.output, suffix)
            print(f"Downloading to {out_path}...", file=sys.stderr)
            urllib.request.urlretrieve(url, out_path)
            print(f"Saved: {out_path}", file=sys.stderr)


def _insert_suffix(path, suffix):
    if not suffix:
        return path
    dot = path.rfind(".")
    if dot == -1:
        return path + suffix
    return path[:dot] + suffix + path[dot:]


if __name__ == "__main__":
    main()
