"""Gate for the design system: WCAG contrast on every token pair + CSS-variable name audit vs globals.css.

Usage: python3 scripts/check-tokens.py [path/to/globals.css]   (exits 1 on any contrast failure)
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(HERE, '..', 'docs', 'design-system', 'tokens.json')))
C = T['color']

def val(path, theme):
    node = C
    for k in path.split('.'):
        node = node[k]
    if 'alias' in node:
        return val(node['alias'], theme)
    return node[theme]

def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]

def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + .05) / (min(la, lb) + .05)

TEXT, UI = 4.5, 3.0
BGS = ['background.canvas', 'background.sidebar', 'background.sunken', 'background.raised', 'background.hover']
PAIRS = []
for bg in BGS:
    for fg in ('text.primary', 'text.secondary', 'text.muted'):
        PAIRS.append((fg, bg, TEXT))
    PAIRS += [('status.warning', bg, TEXT), ('status.danger', bg, TEXT), ('focus.ring', bg, UI)]
PAIRS += [
    ('accent.default', 'background.canvas', TEXT),        # teal text links / "New"
    ('text.onAccent', 'accent.default', TEXT),            # primary button label
    ('text.onAccent', 'accent.hover', TEXT),
    ('text.onAccent', 'accent.pressed', TEXT),
    ('status.onDanger', 'status.danger', TEXT),           # danger button label
    ('status.onDanger', 'status.dangerHover', TEXT),
    ('text.primary', 'status.warningSubtle', TEXT),       # banner text
    ('status.warning', 'status.warningSubtle', UI),       # banner icon
    ('text.primary', 'status.dangerSubtle', TEXT),
    ('status.danger', 'status.dangerSubtle', UI),
    ('text.primary', 'accent.subtle', TEXT),
    ('accent.default', 'accent.subtle', UI),
    ('border.control', 'background.canvas', UI),          # WCAG 1.4.11 input boundary
    ('border.control', 'background.sunken', UI),
    ('data.barFill', 'data.barTrack', UI),                # score bar fill vs track
    ('data.barFill', 'background.canvas', UI),
    ('tier.applyImmediately', 'background.sunken', UI),   # tier markers on group headers
    ('tier.strongOpportunity', 'background.sunken', UI),
]

fails = 0
for theme in ('dark', 'light'):
    print(f'\n== {theme}')
    for fg, bg, need in PAIRS:
        r = ratio(val(fg, theme), val(bg, theme))
        ok = r >= need
        fails += not ok
        if not ok or '-v' in sys.argv:
            print(f"  {'OK ' if ok else 'FAIL'} {r:5.2f} (need {need}) {fg} on {bg}")
    print(f'  {len(PAIRS)} pairs checked')

# CSS name audit: which token variables exist in globals.css today, which are new
css_path = next((a for a in sys.argv[1:] if a.endswith('.css')), None)
if css_path:
    css = open(css_path).read()
    existing = set(re.findall(r'(--[a-z0-9-]+)\s*:', css))
    names = []
    def walk(n):
        if isinstance(n, dict):
            if 'css' in n:
                names.append(n['css'])
            for v in n.values():
                walk(v)
    walk(C); walk(T['elevation'])
    names = sorted(set(names))
    print('\n== CSS variables')
    print('  reused :', ' '.join(x for x in names if x in existing))
    print('  new    :', ' '.join(x for x in names if x not in existing))

print(f'\n{"PASS" if not fails else f"FAIL: {fails} pair(s) below threshold"}')
sys.exit(1 if fails else 0)
