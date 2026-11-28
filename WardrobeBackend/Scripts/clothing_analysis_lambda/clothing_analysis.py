import io
import colorsys
from collections import defaultdict

import numpy as np
import torch
from PIL import Image, ImageFilter
from transformers import AutoImageProcessor, AutoModelForImageClassification

NAME = "dima806/clothes_image_detection"

processor = AutoImageProcessor.from_pretrained(NAME)
model = AutoModelForImageClassification.from_pretrained(NAME)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()

id2label = model.config.id2label

id2label = {int(k): v for k, v in id2label.items()}

categories = {
    "head": [],

    "undershirt": [
        "Polo",
        "Shirt",
        "T-shirt",
    ],

    "overshirt": [
        "Blazer",
        "Coat",
        "Denim Jacket",
        "Hoodie",
        "Jacket",
        "Sports Jacket",
        "Sweater",
    ],

    "legs": [
        "Jeans",
        "Long Pants",
        "Shorts",
        "Skirt",
    ],

    "shoe": [],

    "misc": [
        "Dresses",
    ],
}

label_to_category = {
    label: category
    for category, labels in categories.items()
    for label in labels
}

id_to_category = {
    idx: label_to_category[label]
    for idx, label in id2label.items()
}

def color_name(rgb):
    r, g, b = (v / 255 for v in rgb)

    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h *= 360

    if v < 0.15:
        return "black"

    if s < 0.12:
        return (
            "white" if v > 0.9 else
            "light gray" if v > 0.7 else
            "gray" if v > 0.35 else
            "charcoal"
        )

    if h < 15 or h >= 345:
        base = "red"
    elif h < 40:
        base = "orange"
    elif h < 65:
        base = "yellow"
    elif h < 165:
        base = "green"
    elif h < 195:
        base = "teal"
    elif h < 255:
        base = "blue"
    elif h < 290:
        base = "purple"
    else:
        base = "pink"

    if base in ("red", "orange", "yellow") and v < 0.6:
        base = "brown"

    elif base in ("orange", "yellow") and s < 0.35 and v >= 0.6:
        base = "tan" if v < 0.85 else "beige"

    if base in ("brown", "tan", "beige"):
        return base

    if v < 0.38:
        return "dark " + base

    if s < 0.3:
        return "muted " + base

    if v > 0.85 and s < 0.5:
        return "light " + base

    return base

def color_family(palette):
    fam = defaultdict(float)

    for c in palette:
        fam[c["name"].split()[-1]] += c["share"]

    return dict(
        sorted(
            fam.items(),
            key=lambda kv: kv[1],
            reverse=True
        )
    )

def get_palette(cutout, max_colors=6, min_share=0.10, merge_names=True):
    if cutout.mode != "RGBA":
        cutout = cutout.convert("RGBA")

    alpha = cutout.getchannel("A").filter(
        ImageFilter.MinFilter(9)
    )

    mask = np.array(alpha) > 250

    pixels = np.array(cutout.convert("RGB"))[mask]

    if len(pixels) == 0:
        return []

    if len(pixels) > 50000:
        pixels = pixels[np.random.default_rng(0).choice(len(pixels), 50000, replace=False)]

    small = Image.fromarray(pixels.reshape(-1, 1, 3).astype("uint8"))

    q = small.quantize(colors=max_colors, method=Image.Quantize.MEDIANCUT)

    pal = q.getpalette()

    clusters = []

    for count, idx in sorted(q.getcolors(), reverse=True):
        rgb = tuple(int(v) for v in pal[idx * 3:idx * 3 + 3])

        clusters.append({
            "rgb": rgb,
            "name": color_name(rgb),
            "share": count / len(pixels)
        })

    if merge_names:
        merged = {}

        for c in clusters:
            if c["name"] in merged:
                merged[c["name"]]["share"] += c["share"]
            else:
                merged[c["name"]] = dict(c)

        clusters = sorted(merged.values(), key=lambda c: c["share"], reverse=True)

    kept = [c for c in clusters if c["share"] >= min_share]

    if not kept:
        kept = clusters[:1]

    return [
        {
            "hex": "#%02x%02x%02x" % c["rgb"],
            "rgb": c["rgb"],
            "name": c["name"],
            "share": round(c["share"], 3)
        }
        for c in kept
    ]

def classify(img_rgba, min_color_share=0.10):
    palette = get_palette(
        img_rgba,
        min_share=min_color_share
    )

    white = Image.new(
        "RGBA",
        img_rgba.size,
        (255, 255, 255, 255)
    )

    img_rgb = Image.alpha_composite(
        white,
        img_rgba
    ).convert("RGB")

    inputs = processor(
        images=img_rgb,
        return_tensors="pt"
    )

    inputs = {
        k: v.to(device)
        for k, v in inputs.items()
    }

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = logits.softmax(-1)[0]
    cat_probs = defaultdict(float)

    for i, p in enumerate(probs.tolist()):
        cat_probs[id_to_category[i]] += p

    best_cat = max(
        cat_probs,
        key=cat_probs.get
    )

    ids = [
        i for i in id2label
        if id_to_category[i] == best_cat
    ]

    top_id = max(
        ids,
        key=lambda i: probs[i].item()
    )

    return {
        "category": best_cat,
        "item": id2label[top_id],
        "palette": palette,
        "color_family": color_family(palette),
    }

def analyze_image(image_bytes: bytes) -> dict:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    r = classify(img)

    names = [
        c["name"]
        for c in r["palette"]
    ]

    item = r["item"].strip().title()

    if names:
        description = f"{names[0]} {item}"

        if len(names) > 1:
            description += (
                " with "
                + " and ".join(names[1:3])
            )

        name = f"{names[0].title()} {item}"

    else:
        description = item
        name = item

    description = (
        description[0].upper()
        + description[1:]
    )

    tags = [
        item,
        r["category"],
        *names,
        *r["color_family"].keys()
    ]

    tags = list(
        dict.fromkeys(
            t.lower() for t in tags
        )
    )

    tags = ", ".join(tags)

    return {
        "category": r["category"],
        "description": description,
        "palette": ", ".join(names),
        "tags": tags,
        "name": name
    }