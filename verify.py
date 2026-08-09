from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/es")
        page.wait_for_timeout(2000)
        page.screenshot(path="preview.png", full_page=True)

        # Test changing language to HI
        page.locator("select").select_option("hi")
        page.wait_for_timeout(2000)
        page.screenshot(path="preview_hi.png", full_page=True)

        # Test changing language to AR
        page.locator("select").select_option("ar")
        page.wait_for_timeout(2000)
        page.screenshot(path="preview_ar.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    verify()
