"""Focused re-test: tech tap-to-scan + web touch navigation (real touch)."""
import json, time
from playwright.sync_api import sync_playwright

URL = 'http://localhost:3000'
SHOTS = '/home/z/my-project/tests/shots'

def log(k, v):
    print(f'  [{k}] {v}', flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--enable-unsafe-swiftshader'])
    ctx = browser.new_context(
        viewport={'width': 390, 'height': 844},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True,
    )
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_timeout(3800)

    # ---------- TECH: finer sweep, Mesh-only ----------
    page.evaluate("window.__scrollToScene(4)")
    page.wait_for_timeout(2400)
    hit = page.evaluate("""(() => {
      const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
      let best = null;
      for (let gy = 0.30; gy <= 0.72; gy += 0.018) {
        for (let gx = 0.22; gx <= 0.80; gx += 0.018) {
          const x = r.left + gx * r.width, y = r.top + gy * r.height;
          const hits = window.__r3fray(x, y);
          if (hits.length && hits[0].t === 'Mesh' && hits[0].vis) return { x: Math.round(x), y: Math.round(y), d: hits[0].d };
        }
      }
      return null;
    })()""")
    log('tech node probe', json.dumps(hit))
    if hit:
        page.touchscreen.tap(hit['x'], hit['y'])
        page.wait_for_timeout(650)
        log('tap-to-scan hoveredTech', page.evaluate("window.__r3fstore.getState().hoveredTech"))
        log('scan panel visible', page.evaluate("""(() => {
          const el = Array.from(document.querySelectorAll('div')).find(d => d.textContent.trim() === 'SCANNING');
          return !!el && el.getBoundingClientRect().width > 0;
        })()"""))
        log('cursor label revealed', page.evaluate("window.__r3fstore.getState().cursorLabel"))
        page.screenshot(path=f'{SHOTS}/t04_tech_scan.png')
        page.wait_for_timeout(4500)
        log('scan auto-clears (4s)', page.evaluate("window.__r3fstore.getState().hoveredTech"))

    # ---------- WEB: Mesh-only probe, capture URL ----------
    page.evaluate("window.__scrollToScene(10)")
    page.wait_for_timeout(2400)
    page.evaluate("window.__opened = []; window.open = (u) => (window.__opened.push(String(u)), null)")
    wh = page.evaluate("""(() => {
      const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
      for (let gy = 0.20; gy <= 0.86; gy += 0.018) {
        for (let gx = 0.10; gx <= 0.92; gx += 0.018) {
          const x = r.left + gx * r.width, y = r.top + gy * r.height;
          const hits = window.__r3fray(x, y);
          if (hits.length && hits[0].t === 'Mesh' && hits[0].vis) return { x: Math.round(x), y: Math.round(y), d: hits[0].d };
        }
      }
      return null;
    })()""")
    log('web window probe', json.dumps(wh))
    if wh:
        page.touchscreen.tap(wh['x'], wh['y'])
        page.wait_for_timeout(1100)
        log('focusedWeb', page.evaluate("window.__r3fstore.getState().focusedWeb"))
        log('opened URL', page.evaluate("window.__opened.join(' | ') || '(empty)'"))
        log('inspect card shown', page.evaluate("document.body.innerText.includes('OPEN LIVE SITE')"))
        page.screenshot(path=f'{SHOTS}/t05_web_inspect.png')
        page.wait_for_timeout(7300)
        log('focus auto-returned (7s)', page.evaluate("window.__r3fstore.getState().focusedWeb"))

    # ---------- creative: touch inspect (regression) ----------
    page.evaluate("window.__scrollToScene(12)")
    page.wait_for_timeout(2400)
    ch = page.evaluate("""(() => {
      const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
      for (let gy = 0.2; gy <= 0.86; gy += 0.018) {
        for (let gx = 0.1; gx <= 0.92; gx += 0.018) {
          const x = r.left + gx * r.width, y = r.top + gy * r.height;
          const hits = window.__r3fray(x, y);
          if (hits.length && hits[0].t === 'Mesh' && hits[0].vis) return { x: Math.round(x), y: Math.round(y) };
        }
      }
      return null;
    })()""")
    log('creative display probe', json.dumps(ch))
    if ch:
        page.touchscreen.tap(ch['x'], ch['y'])
        page.wait_for_timeout(1100)
        log('focusedCreative', page.evaluate("window.__r3fstore.getState().focusedCreative"))
        page.screenshot(path=f'{SHOTS}/t09_creative_touch.png')
        page.wait_for_timeout(7200)
        log('creative auto-returned', page.evaluate("window.__r3fstore.getState().focusedCreative"))

    log('page-errors', json.dumps(errors[:6]) if errors else 'NONE')
    browser.close()

print('DONE')
