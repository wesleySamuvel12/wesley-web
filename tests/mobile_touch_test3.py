"""Mobile touch E2E: web window → real URL + auto-return; creative → focus + auto-return."""
import time, json
from playwright.sync_api import sync_playwright

SHOTS = '/home/z/my-project/tests/shots'

PROBE_MESH = """(() => {
  const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
  for (let gy = 0.20; gy <= 0.86; gy += 0.015) {
    for (let gx = 0.10; gx <= 0.92; gx += 0.015) {
      const x = r.left + gx * r.width, y = r.top + gy * r.height;
      const hits = window.__r3fray(x, y);
      const m = hits.find(h => h.t === 'Mesh' && h.vis);
      if (m) return { x: Math.round(x), y: Math.round(y), d: m.d };
    }
  }
  return null;
})()"""

def log(k, v):
    print(f'  [{k}] {v}', flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--enable-unsafe-swiftshader'])
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(3600)

    # ---------- WEB scene ----------
    page.evaluate("window.__scrollToScene(10)")
    page.wait_for_timeout(5600)
    log('web sf', page.evaluate("window.__ws.sceneFloat.toFixed(2)"))
    page.evaluate("window.__opened = []; window.open = (u) => (window.__opened.push(String(u)), null)")
    coords = page.evaluate(PROBE_MESH)
    log('web mesh probe', json.dumps(coords))
    if coords:
        page.touchscreen.tap(coords['x'], coords['y'])
        page.wait_for_timeout(1000)
        log('focusedWeb', page.evaluate("window.__r3fstore.getState().focusedWeb"))
        log('opened URL', page.evaluate("window.__opened.join(' | ') || '(none)'"))
        log('inspect card', page.evaluate("document.body.innerText.includes('OPEN LIVE SITE')"))
        page.screenshot(path=f'{SHOTS}/t05_web_inspect.png')
        page.wait_for_timeout(7300)
        log('web auto-returned', page.evaluate("window.__r3fstore.getState().focusedWeb"))

    # ---------- CREATIVE scene ----------
    page.evaluate("window.__scrollToScene(12)")
    page.wait_for_timeout(5600)
    coords = page.evaluate(PROBE_MESH)
    log('creative mesh probe', json.dumps(coords))
    if coords:
        page.touchscreen.tap(coords['x'], coords['y'])
        page.wait_for_timeout(1100)
        log('focusedCreative', page.evaluate("window.__r3fstore.getState().focusedCreative"))
        page.screenshot(path=f'{SHOTS}/t09_creative_touch.png')
        page.wait_for_timeout(7200)
        log('creative auto-returned', page.evaluate("window.__r3fstore.getState().focusedCreative"))

    # ---------- hardware (embedded lab) touch ----------
    page.evaluate("window.__scrollToScene(8)")
    page.wait_for_timeout(5600)
    coords = page.evaluate(PROBE_MESH)
    log('hardware mesh probe', json.dumps(coords))
    if coords:
        page.touchscreen.tap(coords['x'], coords['y'])
        page.wait_for_timeout(1100)
        log('focusedHardware', page.evaluate("window.__r3fstore.getState().focusedHardware"))
        page.screenshot(path=f'{SHOTS}/t10_hw_touch.png')
        page.wait_for_timeout(7200)
        log('hardware auto-returned', page.evaluate("window.__r3fstore.getState().focusedHardware"))

    log('page-errors', json.dumps(errors[:6]) if errors else 'NONE')
    browser.close()
print('DONE')
