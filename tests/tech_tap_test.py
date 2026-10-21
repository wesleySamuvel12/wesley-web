"""Same-context fresh-coord real touch tap on tech node."""
import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--enable-unsafe-swiftshader'])
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(3600)
    page.evaluate("window.__scrollToScene(4)")
    page.wait_for_timeout(5200)  # glide itself takes ~3.8s — wait it out fully

    # loop: project fresh coords → immediately real-touch tap → read result
    for attempt in range(5):
        coords = page.evaluate("""(() => {
          const scene = window.__r3fscene;
          const cam = window.__r3fcam;
          const gl = window.__r3fgl; const r = gl.domElement.getBoundingClientRect();
          const nodes = [];
          scene.traverse(o => {
            if (o.type === 'Mesh' && o.geometry && o.geometry.type === 'SphereGeometry' && o.geometry.parameters && o.geometry.parameters.radius === 0.24) {
              const v = o.position.clone(); o.getWorldPosition(v);
              const p = v.clone().project(cam);
              nodes.push({ sx: Math.round(r.left + (p.x*0.5+0.5)*r.width), sy: Math.round(r.top + (-p.y*0.5+0.5)*r.height) });
            }
          });
          return nodes[Math.floor(nodes.length / 2)] || null;
        })()""")
        if not coords:
            print('no nodes'); break
        page.touchscreen.tap(coords['sx'], coords['sy'])
        time.sleep(0.5)
        state = page.evaluate("(() => ({ h: window.__r3fstore.getState().hoveredTech, c: window.__r3fstore.getState().cursorType, l: window.__r3fstore.getState().cursorLabel }))()")
        print('attempt %d: tap=(%d,%d) -> %s' % (attempt, coords['sx'], coords['sy'], state), flush=True)
        if state['h']:
            page.screenshot(path='/home/z/my-project/tests/shots/t04_tech_scan.png')
            time.sleep(4.4)
            print('auto-clear:', page.evaluate("window.__r3fstore.getState().hoveredTech"))
            break
    browser.close()
print('DONE')
