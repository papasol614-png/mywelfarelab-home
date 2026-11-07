"""Mobile prelaunch E2E audit (Chromium) with error, overflow, touch, focus and result checks."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, shutil, re, sys

BASE="http://127.0.0.1:8765/"
ART=Path("mobile-artifacts")
ART.mkdir(exist_ok=True)
SIZES=[(320,700),(360,780),(375,812),(390,844),(414,896),(430,932),(600,900),(768,1024),(844,390)]
TOPICS=["basic","disability","single","youth","work","scholarship"]
REPORT=[]

def audit(page,label):
    info=page.evaluate("""() => {
      const viewport=document.documentElement.clientWidth;
      const doc=document.documentElement.scrollWidth;
      const all=[...document.querySelectorAll('body *')];
      const wide=all.filter(el=> {
        let st=getComputedStyle(el),r=el.getBoundingClientRect();
        return st.position!=='fixed' && st.display!=='none' && r.width>0 &&
               r.right>window.innerWidth+2 && r.left>=-1 &&
               !el.closest('.outcome-details');
      }).slice(0,10).map(el=>el.tagName.toLowerCase()+'.'+el.className?.toString().slice(0,45));
      const smallestTap=[...document.querySelectorAll('button,.calc-tab,.quick-jump a')]
        .filter(el=>{let r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&s.display!=='none';})
        .map(el=>({t:el.textContent.trim().slice(0,24),w:Math.round(el.getBoundingClientRect().width),h:Math.round(el.getBoundingClientRect().height)}))
        .filter(t=>t.h<40 || t.w<40).slice(0,10);
      return {viewport,doc,wide,smallestTap};
    }""")
    REPORT.append({"screen":label,**info})
    print(label+" "+json.dumps(info,ensure_ascii=False),flush=True)
    assert info["doc"]<=info["viewport"]+2, f"Horizontal overflow: {label}: {info}"
    assert not info["smallestTap"], "Touch control smaller than 40 px: {}: {}".format(label,info["smallestTap"])
    return info

def fill_money_inputs(page):
    fields=page.locator('#calculator-form input[data-money="true"]:visible')
    for i in range(fields.count()):
        field=fields.nth(i)
        field.fill("0")
        assert field.input_value()=="0"

def test_topic(page,topic,width):
    page.locator(f'.calc-tab[data-id="{topic}"]').click()
    assert page.locator('#calculator-result').is_hidden(),f"Old result persists after {topic}"
    assert page.locator('#calculator-form').is_visible()
    assert page.locator('#calculator-form button[type="submit"]').is_visible()
    if topic=="basic":
        page.locator('select[name="year"]').select_option("2027")
        page.locator('select[name="persons"]').select_option("2")
        page.locator('select[name="region"]').select_option("gyeonggi")
        page.locator('select[name="workerType"]').select_option("disabled")
        page.locator('select[name="carType"]').select_option("none")
        page.locator('input[name="earned"]').fill("1100000")
        assert page.locator('input[name="earned"]').input_value()=="1,100,000"
        fill_money_inputs(page)
        page.locator('input[name="earned"]').fill("1100000")
    elif topic=="disability":
        page.locator('input[name="age"]').fill("50")
        page.locator('select[name="severity"]').select_option("yes")
        page.locator('select[name="amountMode"]').select_option("manual")
        page.locator('input[name="recognized"]').fill("1000000")
        assert page.locator('input[name="recognized"]').input_value()=="1,000,000"
    elif topic=="single":
        page.locator('input[name="parentAge"]').fill("40")
        page.locator('input[name="childAge"]').fill("7")
        page.locator('select[name="amountMode"]').select_option("manual")
        page.locator('input[name="recognized"]').fill("1200000")
    elif topic=="youth":
        page.locator('input[name="birthYear"]').fill("2001")
        for f in ("youngIncome","youngProperty","originIncome","originProperty","rent"):page.locator(f'input[name="{f}"]').fill("0")
        page.locator('input[name="rent"]').fill("300000")
    elif topic=="work":
        page.locator('select[name="household"]').select_option("one")
        for field in ("income","property"):page.locator(f'input[name="{field}"]').fill("10000000")
        page.locator('input[name="children"]').fill("1")
    elif topic=="scholarship":
        page.locator('select[name="segment"]').select_option("1")
        page.locator('input[name="tuition"]').fill("5000000")
    page.locator('#calculator-form button[type="submit"]').click()
    assert page.locator('#calculator-result').is_visible(),f"Result did not render for {topic}"
    assert page.locator('#calculator-result .outcome-panel').count()==2
    assert page.locator('#calculator-result summary').count()==1
    assert page.locator('#calculator-result .source-links a').count()>=1
    assert page.locator('#calculator-result .result-cafe').get_attribute("href").startswith("https://cafe.naver.com/")
    assert page.locator('#calculator-result .outcome-panel').first.is_visible()
    page.locator('#calculator-result summary').click()
    assert page.locator('#calculator-result .calc-table').is_visible()
    page.locator('#calculator-result summary').click()
    audit(page,f"result-{topic}-{width}")
    if width in (320,390):page.screenshot(path=str(ART/f"result-{topic}-{width}.png"),full_page=True)
    page.locator('#calcAgain').click()
    assert page.locator('#calculator-result').is_hidden()

with sync_playwright() as pw:
    exe=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
    browser=pw.chromium.launch(headless=True,args=["--no-sandbox"],executable_path=exe)
    for width,height in SIZES:
        page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1,is_mobile=width<=430,has_touch=width<=430)
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.goto(BASE+"index.html",wait_until="domcontentloaded")
        audit(page,f"home-{width}x{height}")
        cards=page.locator('a.calc-card[href^="calculator.html#"]')
        assert cards.count()==6
        for a in cards.all():
            assert (a.get_attribute("href").split("#")[-1] in TOPICS)
        if width==390:
            assert page.locator('#mobileMenu').is_visible()
            page.locator('#mobileMenu').click()
            assert page.locator('#mobileNav').is_visible()
            assert page.locator('#mobileNav a[href="calculator.html"]').count()==1
            page.locator('#mobileMenu').click()
            assert page.locator('#mobileNav').is_hidden()
        if width in (320,390,768):page.screenshot(path=str(ART/f"home-{width}.png"),full_page=True)
        page.goto(BASE+"calculator.html#basic",wait_until="domcontentloaded")
        audit(page,f"calculator-{width}x{height}")
        assert page.locator(".calc-tab").count()==6
        assert page.locator(".quick-jump a").count()==2
        assert page.locator(".calc-notice summary").count()==1
        assert page.locator(".calc-notice").get_attribute("open") is None
        if width in (320,390,768):page.screenshot(path=str(ART/f"calculator-{width}.png"),full_page=True)
        if width in (320,390,768):
            for topic in TOPICS:test_topic(page,topic,width)
        if width==390:
            for path in ("help.html","about.html","privacy.html","methodology.html"):
                page.goto(BASE+path)
                assert page.locator('main h1').count()==1
                audit(page,f"{path}-390")
        if width in (320,390,768):
            page.goto(BASE+"guides.html",wait_until="domcontentloaded")
            assert page.locator(".hub-card").count()==9
            audit(page,f"guides-{width}")
            if width==390:page.screenshot(path=str(ART/"guides-390.png"),full_page=True)
            for slug in ("basic-livelihood-2026","rental-deposit-assets","housing-benefit-2026",
                         "disability-pension-guide","single-parent-benefits-2026","earned-income-tax-credit",
                         "national-scholarship-2026","youth-rent-support-2026","median-income-2027"):
                page.goto(BASE+"guides/"+slug+".html",wait_until="domcontentloaded")
                assert page.locator('h1').count()==1
                assert page.locator('article a.primary[href^="../calculator.html#"]').count()==1
                assert page.locator('.article-body section').count()>=6
                audit(page,f"article-{slug}-{width}")
                if width==390 and slug in ("basic-livelihood-2026","rental-deposit-assets"):
                    page.screenshot(path=str(ART/f"article-{slug}-390.png"),full_page=True)
        assert not errors,f"Console JS errors on viewport {width}: {errors}"
        page.close()
    browser.close()
(ART/"report.json").write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"COMPLETED: {len(SIZES)} viewports, expanded guides + 6 calculators + static pages",flush=True)
