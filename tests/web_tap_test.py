"""Identify web window meshes, then real-touch tap at freshly projected centers."""
import time, json
from playwright.sync_api import sync_playwright

SHOTS = '/home/z/my-project/tests/shots'

def log(k, v):
    print(f'  [{k}] {v}', flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--enable-unsafe-swiftshader'])
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(3600)
    page.evaluate("window.__scrollToScene(10)")
    page.wait_for_timeout(5600)

    inv = page.evaluate("""(() => {
      const scene = window.__r3fscene;
      const cam = window.__r3fcam;
      const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
      const out = {};
      scene.traverse(o => {
        if (o.type !== 'Mesh' || !o.visible) return;
        const g = o.geometry;
        const key = g ? g.type : 'null';
        out[key] = (out[key] || 0) + 1;
      });
      return out;
    })()""")
    log('web mesh inventory', json.dumps(inv))

    for attempt in range(4):
        coords = page.evaluate("""(() => {
          const scene = window.__r3fscene;
          const cam = window.__r3fcam;
          const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
          let best = null, bestD = 1e9;
          scene.traverse(o => {
            if (o.type !== 'Mesh' || !o.visible) return;
            const g = o.geometry;
            if (!g || g.type.indexOf('Box') === -1) return;
            const bs = g.boundingSphere || (g.computeBoundingSphere(), g.boundingSphere);
            if (bs.radius < 0.5) return; // window frames are big
            const v = o.position.clone(); o.getWorldPosition(v);
            const p = v.clone().project(cam);
            if (p.z < -1 || p.z > 1) return;
            if (Math.abs(p.x) > 0.92 || Math.abs(p.y) > 0.92) return; // must be on screen
            const sx = r.left + (p.x*0.5+0.5)*r.width, sy = r.top + (-p.y*0.5+0.5)*r.height;
            const d = Math.hypot(sx - (r.left + r.width/2), sy - (r.top + r.height/2));
            if (d < bestD) { bestD = d; best = { sx: Math.round(sx), sy: Math.round(sy), rad: +bs.radius.toFixed(2) }; }
          });
          return best;
        })()""")
        if not coords:
            print('no box mesh'); break
        page.touchscreen.tap(coords['sx'], coords['sy'])
        time.sleep(0.8)
        state = page.evaluate("(() => ({ f: window.__r3fstore.getState().focusedWeb, o: window.__opened ? window.__opened.join('|') : '?' }))()")
        print('attempt %d: tap=(%d,%d) r=%s -> %s' % (attempt, coords['sx'], coords['sy'], coords['rad'], state), flush=True)
        if state['f']:
            page.screenshot(path=f'{SHOTS}/t05_web_inspect.png')
            time.sleep(7.2)
            print('auto-returned:', page.evaluate("window.__r3fstore.getState().focusedWeb"))
            break
    browser.close()
print('DONE')
