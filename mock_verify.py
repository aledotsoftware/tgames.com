from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("file:///app/index.html")
        page.screenshot(path="mock_preview.png")
        browser.close()

if __name__ == "__main__":
    verify()
