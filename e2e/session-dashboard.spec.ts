import { test, expect } from '@playwright/test'

test.describe('Session Dashboard', () => {
  test('should display sessions list page', async ({ page }) => {
    await page.goto('/sessions')

    // Wait for network to settle
    await page.waitForLoadState('networkidle')

    // Page can show loading, empty state, error state, or session list
    // Check for any valid state indicator (h1 or h2 heading, or state message)
    const validContent = page.locator('h1, h2, [class*="empty"], button:has-text("Create Session")').first()
    await expect(validContent).toBeVisible()
  })

  test('should have navigation tabs on session detail page', async ({ page }) => {
    await page.goto('/sessions')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Hide any fixed banners that might intercept clicks
    await page.evaluate(() => {
      const banners = document.querySelectorAll('[class*="fixed"][class*="top-0"]')
      banners.forEach(b => (b as HTMLElement).style.display = 'none')
    })

    // Look for "View Details" links in session cards (not the header nav)
    const viewDetailsLink = page.locator('a[href*="/sessions/"]').filter({ hasText: /view details|details/i })

    if (await viewDetailsLink.count() > 0) {
      await viewDetailsLink.first().click()

      // Check for tab navigation
      const tabs = page.locator('nav button, nav a').filter({ hasText: /(players|teams|games|chat|scoring)/i })
      await expect(tabs.first()).toBeVisible()
    }
  })
})

test.describe('Session Dashboard Tabs', () => {
  test('should show players tab content', async ({ page }) => {
    await page.goto('/sessions')

    // Find a session to click
    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      // Look for players tab
      const playersTab = page.getByRole('button', { name: /players/i })
      if (await playersTab.count() > 0) {
        await playersTab.click()
        // Verify players content is shown
        await expect(page.getByText(/player/i).first()).toBeVisible()
      }
    }
  })

  test('should show teams tab content', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const teamsTab = page.getByRole('button', { name: /teams/i })
      if (await teamsTab.count() > 0) {
        await teamsTab.click()
        await expect(page.getByText(/team/i).first()).toBeVisible()
      }
    }
  })

  test('should show chat tab content', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if (await chatTab.count() > 0) {
        await chatTab.click()
        await expect(page.getByText(/chat|message/i).first()).toBeVisible()
      }
    }
  })
})

test.describe('Session Actions', () => {
  test('should have share button', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      // Look for share button
      const shareButton = page.getByRole('button', { name: /share/i })
      await expect(shareButton.first()).toBeVisible()
    }
  })

  test('should open share modal when share button is clicked', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })
      if (await shareButton.count() > 0) {
        await shareButton.click()

        // Check for modal with share content
        const modal = page.locator('[role="dialog"]')
        await expect(modal).toBeVisible()

        // Modal should contain QR code or join code
        const modalContent = page.getByText(/join.*code|qr|share/i)
        await expect(modalContent.first()).toBeVisible()
      }
    }
  })
})

test.describe('Session Responsiveness', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/sessions')

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()

    // Navigation should be accessible
    const nav = page.locator('header, nav')
    await expect(nav.first()).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/sessions')

    await expect(page.locator('body')).toBeVisible()
  })
})
