"""Builds the GitHub Pages apps from the Apps Script page files in src/.

Usage: python3 tools/build.py
Copy an updated page from Apps Script into src/ (same file name), run this, commit, push.
"""
import hashlib, json, os, re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS = [
    # folder, source page, ?app id, home-screen name, icon
    ('guest', '10_GuestDetails_Page.html', 'guest-details', 'Guest Details', 'guest'),
    ('travel', '40_Logistics_Page.html', 'logistics', 'Travel desk', 'travel'),
    ('driver', '40_Logistics_Page.html', 'driver', 'My trips', 'travel'),
    ('hotel', '50_Hotel_Page.html', 'hotel', 'Check-in desk', 'hotel'),
    ('checklist', '50_Checklist_Page.html', 'checklist', 'Checklist', 'checklist'),
]


def ver(path):
    return hashlib.md5(open(path, 'rb').read()).hexdigest()[:8]


def icon_color(icon):
    im = Image.open(os.path.join(ROOT, 'icons', icon + '-192.png')).convert('RGB')
    return '#%02x%02x%02x' % im.getpixel((4, 4))


def build(folder, src, app, name, icon):
    sp = os.path.join(ROOT, 'src', src)
    if not os.path.exists(sp):
        print('skip', folder, '(no src/' + src + ')')
        return
    html = open(sp, encoding='utf-8').read()
    color = icon_color(icon)

    html = html.replace("JSON.parse('<?!= params ?>' || '{}')", 'window.__PARAMS')
    html = html.replace('JSON.parse("<?!= params ?>" || "{}")', 'window.__PARAMS')
    html = html.replace('<?!= params ?>', 'window.__PARAMS')
    if '<?' in html:
        raise SystemExit(folder + ': template code left in ' + src + ' - handle it in build.py')

    html = re.sub(r'<html[^>]*>', '<html lang="en" data-app="%s">' % app, html, count=1)
    html = re.sub(r'<meta name="viewport"[^>]*>\s*', '', html)
    html = re.sub(r'<meta name="theme-color"[^>]*>\s*', '', html)
    html = re.sub(r'<title>[^<]*</title>\s*', '', html)
    head = '\n'.join([
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        '<title>%s</title>' % name,
        '<meta name="theme-color" content="%s">' % color,
        '<link rel="manifest" href="manifest.webmanifest">',
        '<link rel="icon" type="image/png" sizes="192x192" href="../icons/%s-192.png">' % icon,
        '<link rel="apple-touch-icon" href="../icons/%s-180.png">' % icon,
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="%s">' % name,
        '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
        '<script src="../shared/bridge.js?v=%s"></script>' % ver(os.path.join(ROOT, 'shared', 'bridge.js')),
    ])
    html = re.sub(r'<head>', '<head>\n' + head, html, count=1)

    out = os.path.join(ROOT, folder)
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
    manifest = {
        'name': name, 'short_name': name, 'scope': './',  # no start_url: the saved icon opens the exact link (with its key)
        'display': 'standalone', 'background_color': color, 'theme_color': color,
        'icons': [
            {'src': '../icons/%s-192.png' % icon, 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
            {'src': '../icons/%s-512.png' % icon, 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
            {'src': '../icons/%s-512.png' % icon, 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
        ],
    }
    open(os.path.join(out, 'manifest.webmanifest'), 'w').write(json.dumps(manifest, indent=2))
    print('built', folder)


for a in APPS:
    build(*a)
