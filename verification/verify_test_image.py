from playwright.sync_api import sync_playwright

def verify_test_image():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the test page
            url = "http://localhost:3000/es/test-image"
            print(f"Navigating to {url}")
            response = page.goto(url)
            print(f"Status: {response.status}")

            if response.status == 404:
                print("Trying /en/test-image")
                url = "http://localhost:3000/en/test-image"
                response = page.goto(url)
                print(f"Status: {response.status}")

            if response.status == 404:
                print("Trying /test-image")
                url = "http://localhost:3000/test-image"
                response = page.goto(url)
                print(f"Status: {response.status}")

            # Wait for the image
            page.wait_for_selector(".test-thumb", state="visible")

            img = page.locator(".test-thumb").first
            src = img.get_attribute("src")
            print(f"Image src: {src}")

            srcset = img.get_attribute("srcset")
            print(f"Image srcset: {srcset}")

            if src and ("/_ipx/" in src or "format=" in src):
                 print("SUCCESS: Image src contains optimization indicators.")
            else:
                 print("WARNING: Image src seems unoptimized.")

            # Take screenshot
            page.screenshot(path="verification/test-image.png")
            print("Screenshot saved to verification/test-image.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/test-error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_test_image()
