"""Mobile touch E2E verification for Wesley portfolio — real touch emulation."""
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
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_timeout(3800)

    log('coarse-pointer', page.evaluate("matchMedia('(pointer: coarse)').matches"))
    log('maxTouchPoints', page.evaluate("navigator.maxTouchPoints"))
    log('store.isTouch', page.evaluate("window.__r3fstore?.getState().isTouch"))
    log('mode-touchRig', page.evaluate("!!window.__touchRig"))
    log('quality', page.evaluate("window.__r3fstore?.getState().quality"))
    log('dpr', page.evaluate("window.__r3fgl?.getPixelRatio()"))
    log('swipe-hint', page.evaluate("document.body.innerText.includes('SWIPE TO ENTER')"))
    log('badge-visible', page.evaluate(
        "() => { const b = document.querySelector('button[aria-label*=\"Scene 01\"]');"
        " if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; }"))
    page.screenshot(path=f'{SHOTS}/t01_intro.png')

    # --- touch reveal rig: tap empty area during intro (REAL touch) ---
    page.touchscreen.tap(150, 640)
    page.wait_for_timeout(300)
    rig1 = page.evaluate("""(() => {
      const dot = document.querySelector('.cursor-dot-idle');
      const plate = Array.from(document.querySelectorAll('.cursor-plate')).find(p => p.textContent.includes('WESLEY'));
      return { dot: dot ? dot.style.opacity : 'x', plate: plate ? plate.style.opacity : 'x' };
    })()""")
    log('rig-on-touch(dot/plate)', json.dumps(rig1))
    page.screenshot(path=f'{SHOTS}/t02_touch_rig.png')
    page.wait_for_timeout(1400)
    rig2 = page.evaluate("""(() => {
      const dot = document.querySelector('.cursor-dot-idle');
      const plate = Array.from(document.querySelectorAll('.cursor-plate')).find(p => p.textContent.includes('WESLEY'));
      return { dot: dot ? dot.style.opacity : 'x', plate: plate ? plate.style.opacity : 'x' };
    })()""")
    log('rig-dissolved-after-lift', json.dumps(rig2))

    # --- native scroll (touch scroll is native on phones; Lenis syncs) ---
    page.evaluate("window.__scrollToScene(1)")
    page.wait_for_timeout(2200)
    log('hero sceneFloat', page.evaluate("window.__ws.sceneFloat.toFixed(2)"))
    page.screenshot(path=f'{SHOTS}/t03_hero.png')

    # --- tech scene: tap-to-scan + auto clear ---
    page.evaluate("window.__scrollToScene(4)")
    page.wait_for_timeout(2200)
    hit = page.evaluate("""(() => {
      const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
      for (let gy = 0.30; gy <= 0.78; gy += 0.045) {
        for (let gx = 0.2; gx <= 0.85; gx += 0.045) {
          const x = r.left + gx * r.width, y = r.top + gy * r.height;
          const hits = window.__r3fray(x, y);
          const h = hits.find(o => o.t === 'Mesh' && o.vis);
          if (h) return { x: Math.round(x), y: Math.round(y) };
        }
      }
      return null;
    })()""")
    log('tech node probe', json.dumps(hit))
    if hit:
        page.touchscreen.tap(hit['x'], hit['y'])
        page.wait_for_timeout(600)
        log('tap-to-scan hoveredTech', page.evaluate("window.__r3fstore.getState().hoveredTech"))
        log('scan panel visible', page.evaluate("""(() => {
          const el = Array.from(document.querySelectorAll('div')).find(d => d.textContent.trim() === 'SCANNING');
          return !!el && el.getBoundingClientRect().width > 0;
        })()"""))
        page.screenshot(path=f'{SHOTS}/t04_tech_scan.png')
        page.wait_for_timeout(4400)
        log('scan auto-clears', page.evaluate("window.__r3fstore.getState().hoveredTech"))

    # --- web scene: touch window → real URL + focus, auto-return ---
    page.evaluate("window.__scrollToScene(10)")
    page.wait_for_timeout(2200)
    page.evaluate("window.__opened = []; window.open = (u) => { window.__opened.push(String(u)); return null; }")
    wh = page.evaluate("""(() => {
      const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
      for (let gy = 0.22; gy <= 0.85; gy += 0.04) {
        for (let gx = 0.12; gx <= 0.92; gx += 0.04) {
          const x = r.left + gx * r.width, y = r.top + gy * r.height;
          const hits = window.__r3fray(x, y);
          if (hits.length) return { x: Math.round(x), y: Math.round(y) };
        }
      }
      return null;
    })()""")
    log('web window probe', json.dumps(wh))
    if wh:
        page.touchscreen.tap(wh['x'], wh['y'])
        page.wait_for_timeout(1000)
        log('focusedWeb', page.evaluate("window.__r3fstore.getState().focusedWeb"))
        log('opened URL', page.evaluate("window.__opened.join(' | ')"))
        page.screenshot(path=f'{SHOTS}/t05_web_inspect.png')
        page.wait_for_timeout(7200)
        log('focus auto-returned', page.evaluate("window.__r3fstore.getState().focusedWeb"))

    # --- mobile scene badge: tap advances to next scene ---
    page.evaluate("window.__scrollToScene(11)")
    page.wait_for_timeout(2000)
    log('badge aria', page.evaluate("document.querySelector('button[aria-label*=Scene]')?.getAttribute('aria-label')"))
    log('badge box', page.evaluate("(() => { const b = document.querySelector('button[aria-label*=Scene]'); const r = b.getBoundingClientRect(); return JSON.stringify([r.x, r.y, r.width, r.height]); })()"))
    page.touchscreen.tap(195, 62)
    page.wait_for_timeout(2800)
    log('after badge tap sceneFloat', page.evaluate("window.__ws.sceneFloat.toFixed(2)"))
    page.screenshot(path=f'{SHOTS}/t06_after_badge.png')

    # --- contact: footer clearance ---
    page.evaluate("window.__scrollToScene(14)")
    page.wait_for_timeout(2400)
    page.screenshot(path=f'{SHOTS}/t07_contact.png')
    log('contact footer clearance', page.evaluate("""(() => {
      const btns = Array.from(document.querySelectorAll('a')).filter(a => a.textContent.includes('CONTACT ME'));
      if (!btns.length) return 'no-cta';
      const b = btns[0].getBoundingClientRect();
      const f = document.querySelector('footer').getBoundingClientRect();
      return b.bottom <= f.top + 4 ? 'ok' : 'overlap ' + b.bottom + '>' + f.top;
    })()"""))

    log('page-errors', json.dumps(errors[:6]) if errors else 'NONE')
    browser.close()

print('DONE')
