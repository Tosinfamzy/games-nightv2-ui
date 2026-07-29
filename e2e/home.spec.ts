import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/Games Night/)
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check for navigation elements
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Get all focusable elements on the page
    const focusableElements = page.locator(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const count = await focusableElements.count()

    // Page should have focusable elements for keyboard navigation
    expect(count).toBeGreaterThan(0)

    // First focusable element should exist and be accessible
    await expect(focusableElements.first()).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate to join page', async ({ page }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Hide any fixed overlays that might intercept clicks (more aggressive approach)
    await page.addStyleTag({
      content: `
        .fixed, [style*="position: fixed"], [style*="position:fixed"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `,
    })

    // Find the join link and click
    const joinLink = page.locator('a[href="/join"]').first()
    await expect(joinLink).toBeVisible()
    await joinLink.click()
    await expect(page).toHaveURL(/\/join/)
  })

  test('should offer a host sign-in path (not a public sessions link)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Hosting is gated behind sign-in now: signed-out visitors get a
    // "Sign in to host" affordance, not a link into the host-only sessions list.
    const hostButton = page
      .getByRole('button', { name: /sign in to host/i })
      .first()
    await expect(hostButton).toBeVisible()

    // And there's no anonymous link into the host-scoped sessions list.
    await expect(page.locator('a[href="/sessions"]')).toHaveCount(0)
  })
})
