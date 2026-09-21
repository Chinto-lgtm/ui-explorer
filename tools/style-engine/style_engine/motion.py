"""
Motion tokens and component behaviour — mirrors materializeMotion(),
motionToBehavior() and materializeBehavior() in vocab.ts.
"""

MOTION_TOKENS = {
    "static": {"durationFast": "0ms", "durationNormal": "0ms", "durationSlow": "0ms", "easing": "linear", "hoverScale": 1, "activeScale": 1},
    "subtle": {"durationFast": "120ms", "durationNormal": "200ms", "durationSlow": "320ms", "easing": "ease-out", "hoverScale": 1.01, "activeScale": 0.99},
    "smooth": {"durationFast": "160ms", "durationNormal": "260ms", "durationSlow": "420ms", "easing": "cubic-bezier(0.4, 0, 0.2, 1)", "hoverScale": 1.02, "activeScale": 0.98},
    "physical": {"durationFast": "100ms", "durationNormal": "180ms", "durationSlow": "300ms", "easing": "cubic-bezier(0.2, 0.8, 0.2, 1)", "hoverScale": 1.03, "activeScale": 0.96},
    "expressive": {"durationFast": "200ms", "durationNormal": "380ms", "durationSlow": "650ms", "easing": "cubic-bezier(0.16, 1, 0.3, 1)", "hoverScale": 1.05, "activeScale": 0.97},
    "mechanical": {"durationFast": "80ms", "durationNormal": "120ms", "durationSlow": "200ms", "easing": "steps(4, end)", "hoverScale": 1, "activeScale": 1},
    "snappy": {"durationFast": "80ms", "durationNormal": "140ms", "durationSlow": "220ms", "easing": "cubic-bezier(0.2, 0, 0, 1)", "hoverScale": 1.02, "activeScale": 0.97},
    "elastic": {"durationFast": "180ms", "durationNormal": "320ms", "durationSlow": "560ms", "easing": "cubic-bezier(0.34, 1.56, 0.64, 1)", "hoverScale": 1.06, "activeScale": 0.94},
}
_DEFAULT_MOTION = {"durationFast": "150ms", "durationNormal": "250ms", "durationSlow": "400ms", "easing": "ease-out", "hoverScale": 1.02, "activeScale": 0.98}


def materialize_motion(motion):
    return dict(MOTION_TOKENS.get(motion, _DEFAULT_MOTION))


def motion_to_behavior(motion, depth):
    if depth == "glowing":
        return "glowing"
    return {
        "static": "instant", "mechanical": "mechanical", "elastic": "elastic",
        "physical": "physical", "expressive": "cinematic",
    }.get(motion, "soft")


_HOVER = {"soft": "lift", "physical": "shift", "mechanical": "invert", "elastic": "lift", "glowing": "glow", "instant": "none", "cinematic": "lift"}
_FOCUS = {"soft": "outline", "physical": "solid-border", "mechanical": "solid-border", "elastic": "outline", "glowing": "glow", "instant": "outline", "cinematic": "double-ring"}


def materialize_behavior(family, depth):
    card = "border" if depth == "flat" else "inset" if depth == "inset" else "gradient-border" if depth == "glowing" else "shadow"
    return {"buttonHoverAction": _HOVER[family], "cardElevationType": card, "focusRingStyle": _FOCUS[family]}
