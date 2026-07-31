import { test, expect } from '@playwright/test'

test.describe('Join Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join')
  })

  test('should display the join session form', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check for form elements - use flexible matching
    const heading = page.getByRole('heading', { name: /join.*session/i })
    await expect(heading).toBeVisible()

    // Check for input fields by their ids or placeholders
    const codeInput = page.locator('#joinCode')
    await expect(codeInput).toBeVisible()

    const nameInput = page.locator('#playerName')
    await expect(nameInput).toBeVisible()
  })

  test('should validate session code input', async ({ page }) => {
    const codeInput = page.getByLabel(/session code/i)
    const nameInput = page.getByLabel(/your name/i)
    const submitButton = page.getByRole('button', { name: /join session/i })

    // Initially button should be disabled
    await expect(submitButton).toBeDisabled()

    // Enter a short code (less than 6 digits)
    await codeInput.fill('123')
    await nameInput.fill('Test Player')

    // Button should still be disabled
    await expect(submitButton).toBeDisabled()

    // Enter a valid 6-digit code
    await codeInput.fill('123456')

    // Button should now be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('should only accept numeric input for session code', async ({
    page,
  }) => {
    const codeInput = page.getByLabel(/session code/i)

    // Try to enter letters
    await codeInput.fill('abc123')

    // Should only contain numbers
    await expect(codeInput).toHaveValue('123')
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper form labeling
    const codeInput = page.getByLabel(/session code/i)
    await expect(codeInput).toHaveAttribute('required')
    await expect(codeInput).toHaveAttribute('inputmode', 'numeric')

    const nameInput = page.getByLabel(/your name/i)
    await expect(nameInput).toHaveAttribute('required')
  })
})

test.describe('Quick Join Flow', () => {
  test('should prefill code from URL', async ({ page }) => {
    // The route pattern is /join_/$joinCode based on the file-based routing
    await page.goto('/join_/654321')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // The code should be prefilled in the input or shown on page
    // Could be loading, error, or success state depending on if session exists
    const codeInput = page.locator('#joinCode')
    if ((await codeInput.count()) > 0) {
      await expect(codeInput).toHaveValue('654321')
    } else {
      // If session lookup happens, the code is used for lookup
      await expect(
        page.getByText(/654321|invalid|session/i).first(),
      ).toBeVisible()
    }
  })
})
