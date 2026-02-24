from playwright.sync_api import sync_playwright

def verify_images():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the homepage
            response = page.goto("http://localhost:3000")
            print(f"Navigated to homepage: {response.status}")

            # Wait for games to load
            try:
                page.wait_for_selector(".games-grid", timeout=10000)
                page.wait_for_selector(".game-thumb", state="visible", timeout=10000)
            except Exception as e:
                print("Timed out waiting for games grid. Checking if error state is present.")
                if page.locator(".error-state").is_visible():
                    print("Error state is visible.")
                    print(page.locator(".error-state").inner_text())
                else:
                    print("Neither games grid nor error state found.")
                raise e

            # Get the first game thumbnail
            img = page.locator(".game-thumb").first

            # Get the src attribute
            src = img.get_attribute("src")
            print(f"Image src: {src}")

            # Get the srcset attribute (responsive images)
            srcset = img.get_attribute("srcset")
            print(f"Image srcset: {srcset}")

            # Verify it's an optimized image
            if src and ("/_ipx/" in src):
                print("SUCCESS: Image is being served via IPX (optimized).")
            elif srcset:
                print("SUCCESS: Image has srcset attribute (responsive).")
            else:
                print("WARNING: Image src does not appear to be optimized standardly.")

            # Take a screenshot
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_images()
