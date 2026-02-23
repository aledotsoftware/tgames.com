from playwright.sync_api import sync_playwright
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock Categories API
    def handle_categories(route):
        print("Mocking categories request")
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"success": True, "categories": ["Action", "Adventure", "Racing", "Puzzle", "Strategy"]})
        )

    page.route("**/api/categories", handle_categories)

    # Mock Games API
    def handle_games(route):
        url = route.request.url
        print(f"Mocking games request: {url}")
        if "category=Racing" in url:
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"success": True, "games": [
                    {"id": 2, "title": "Racing Game 1", "slug": "racing-game-1", "thumb_1": "https://via.placeholder.com/300"},
                    {"id": 3, "title": "Racing Game 2", "slug": "racing-game-2", "thumb_1": "https://via.placeholder.com/300"}
                ]})
            )
        else:
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"success": True, "games": [
                    {"id": 1, "title": "Featured Game 1", "slug": "game-1", "thumb_1": "https://via.placeholder.com/300"}
                ]})
            )

    page.route("**/api/games**", handle_games)

    try:
        # Navigate to home
        print("Navigating to home...")
        page.goto("http://localhost:3000")

        # Wait for sidebar to load
        print("Waiting for sidebar...")
        page.wait_for_selector(".category-sidebar", timeout=10000)

        # Take screenshot of home with sidebar
        page.screenshot(path="verification/verification_home.png")
        print("Home screenshot taken.")

        # Click on Racing category
        print("Clicking on Racing category...")
        page.click("text=Racing")

        # Wait for navigation and game load
        print("Waiting for navigation...")
        page.wait_for_url("**/category/Racing", timeout=10000)

        # Wait for game card to appear
        print("Waiting for game cards...")
        page.wait_for_selector(".game-card", timeout=10000)

        # Take screenshot of category page
        page.screenshot(path="verification/verification_category.png")
        print("Category screenshot taken.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
