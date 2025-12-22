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

    // Tab through the page
    await page.keyboard.press('Tab')

    // Skip link should be visible when focused
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeFocused()
  })
})

test.describe('Navigation', () => {
  test('should navigate to join page', async ({ page }) => {
    await page.goto('/')

    // Find and click join link
    const joinLink = page.getByRole('link', { name: /join/i })
    if (await joinLink.count() > 0) {
      await joinLink.first().click()
      await expect(page).toHaveURL(/\/join/)
    }
  })

  test('should navigate to sessions page', async ({ page }) => {
    await page.goto('/')

    // Find and click sessions link
    const sessionsLink = page.getByRole('link', { name: /sessions/i })
    if (await sessionsLink.count() > 0) {
      await sessionsLink.first().click()
      await expect(page).toHaveURL(/\/sessions/)
    }
  })
})
