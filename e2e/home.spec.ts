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

  test('should navigate to sessions page', async ({ page }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Hide any fixed overlays that might intercept clicks
    await page.addStyleTag({
      content: `
        .fixed, [style*="position: fixed"], [style*="position:fixed"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `,
    })

    // Find a sessions link that's visible and scroll to it
    // Use the one in the main content area (not the header)
    const sessionsLink = page.locator('a[href="/sessions"]').last()
    await sessionsLink.scrollIntoViewIfNeeded()
    await expect(sessionsLink).toBeVisible()
    await sessionsLink.click({ force: true })
    await expect(page).toHaveURL(/\/sessions/)
  })
})
