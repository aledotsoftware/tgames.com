from playwright.sync_api import sync_playwright

def verify_images():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mock the API so we don't depend on the DB being populated
        context = browser.new_context()
        page = context.new_page()

        page.route("**/api/games*", lambda route: route.fulfill(
            status=200,
            json={
                "success": True,
                "games": [
                    {
                        "id": 1,
                        "slug": "test-game",
                        "title": "Test Game",
                        "thumb_1": "test-thumb.jpg",
                        "category": "Action",
                        "views": 100
                    }
                ]
            }
        ))

        page.route("**/api/search*", lambda route: route.fulfill(
            status=200,
            json={
                "success": True,
                "games": [
                    {
                        "id": 1,
                        "slug": "test-game",
                        "title": "Test Game",
                        "thumb_1": "test-thumb.jpg",
                        "category": "Action"
                    }
                ]
            }
        ))

        try:
            print("Navigating to homepage...")
            # Using server-side mock for the initial page load is tricky if SSR tries to hit DB,
            # so we'll wait for the client-side app to initialize and mock the fetch
            response = page.goto("http://localhost:3000")
            print(f"Navigated to homepage: {response.status}")

            # Wait for games to load
            try:
                page.wait_for_selector(".game-thumb", state="visible", timeout=10000)
            except Exception as e:
                print("Timed out waiting for games grid. Checking if error state is present.")
                if page.locator(".error-state").is_visible():
                    print("Error state is visible.")
                    print(page.locator(".error-state").inner_text())
                else:
                    print("Neither games grid nor error state found.")
                # We can still check the search bar

            # Get the first game thumbnail if present
            if page.locator(".game-thumb").is_visible():
                img = page.locator(".game-thumb").first
                src = img.get_attribute("src")
                print(f"Index Page Image src: {src}")
                if src and "/_ipx/w_300&f_webp/" in src:
                    print("SUCCESS: Index page image is being served via expected IPX path.")
                else:
                    print("ERROR: Index page image src does not contain expected IPX path.")

            # Test SearchBar
            print("\nTesting SearchBar...")
            page.locator(".premium-search-input").fill("test")
            page.wait_for_selector(".premium-search-item", state="visible", timeout=5000)
            search_img = page.locator(".item-thumb").first
            search_src = search_img.get_attribute("src")
            print(f"Search Image src: {search_src}")
            if search_src and "/_ipx/w_300&f_webp/" in search_src:
                print("SUCCESS: Search image is being served via expected IPX path.")
            else:
                print("ERROR: Search image src does not contain expected IPX path.")

            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_images()
