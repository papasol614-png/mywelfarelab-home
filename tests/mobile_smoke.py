"""Real Chromium mobile viewport smoke test for the live source tree."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os

BASE="http://127.0.0.1:8765/"
SIZES=[(360,780),(390,844),(430,932),(768,1024)]
ART=Path("mobile-artifacts")
ART.mkdir(exist_ok=True)

def check_overflow(page, label):
    info=page.evaluate("""() => ({
       viewport: document.documentElement.clientWidth,
       doc: document.documentElement.scrollWidth,
       body: document.body.scrollWidth,
       oversized: [...document.querySelectorAll('body *')].filter(e=>{
         const r=e.getBoundingClientRect(),style=getComputedStyle(e);
         return style.position!=='fixed' && r.width>0 && r.left< -2 || (r.right>window.innerWidth+2 && r.width>0 && style.position!=='fixed');
       }).slice(0,8).map(e=>({tag:e.tagName,cls:e.className?.toString().slice(0,60)}))
    })""")
    print(label+": "+json.dumps(info,ensure_ascii=False))
    assert info["doc"] <= info["viewport"]+2, f"Horizontal scrolling on {label}: {info}"

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
    for width,height in SIZES:
        page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1,is_mobile=width<=430,has_touch=width<=430)
        errors=[]
        page.on("pageerror",lambda error: errors.append(str(error)))
        page.goto(BASE+"index.html",wait_until="load")
        check_overflow(page,f"home {width}")
        page.screenshot(path=str(ART/f"home-{width}.png"),full_page=True)
        page.goto(BASE+"calculator.html#basic",wait_until="load")
        check_overflow(page,f"calculator {width}")
        assert page.locator("#calculator-form").is_visible()
        assert page.locator('.calc-tab').count()==6
        assert page.locator('.quick-jump a').count()==2
        assert page.locator('.quick-jump a').first.is_visible()
        page.screenshot(path=str(ART/f"calculator-{width}.png"),full_page=True)
        if width==390:
            page.locator('select[name="year"]').select_option("2027")
            page.locator('select[name="persons"]').select_option("2")
            money=page.locator('input[name="earned"]')
            money.fill("1100000")
            assert money.input_value()=="1,100,000",money.input_value()
            for field in page.locator('input[data-money="true"]').all():
                if not field.input_value():field.fill("0")
            page.locator('button[type="submit"]').click()
            assert page.locator('#calculator-result').is_visible()
            assert page.locator('#calculator-result .outcome-panel').count()==2
            assert '2027년 기준' in page.locator('.outcome-kicker').inner_text()
            check_overflow(page,"result 390")
            page.screenshot(path=str(ART/"result-390.png"),full_page=True)
            page.locator('.calc-tab[data-id="scholarship"]').click()
            assert page.locator('#calculator-result').is_hidden()
            page.locator('input[name="tuition"]').fill("6000000")
            assert page.locator('input[name="tuition"]').input_value()=="6,000,000"
            page.locator('button[type="submit"]').click()
            assert page.locator('#calculator-result').is_visible()
            check_overflow(page,"scholarship result 390")
            page.screenshot(path=str(ART/"scholarship-result-390.png"),full_page=True)
        assert not errors, f"JavaScript errors at {width}: {errors}"
        page.close()
    browser.close()
print("Mobile Chromium smoke tests passed.")
