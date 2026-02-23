from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 375, "height": 812})

    try:
        # Navigate to home
        print("Navigating to home (mobile)...")
        page.goto("http://localhost:3000", timeout=60000)

        # Wait for something to load (even error)
        page.wait_for_selector(".layout-wrapper", timeout=10000)

        # Take screenshot
        page.screenshot(path="verification/verification_mobile.png")
        print("Mobile screenshot taken.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/mobile_error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
