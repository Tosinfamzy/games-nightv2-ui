import { test, expect } from '@playwright/test'

test.describe('Join Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join')
  })

  test('should display the join session form', async ({ page }) => {
    // Check for form elements
    await expect(page.getByText(/join.*session/i)).toBeVisible()
    await expect(page.getByLabel(/session code/i)).toBeVisible()
    await expect(page.getByLabel(/your name/i)).toBeVisible()
  })

  test('should show demo mode hint', async ({ page }) => {
    // Check for demo mode message
    await expect(page.getByText(/demo mode/i)).toBeVisible()
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

  test('should only accept numeric input for session code', async ({ page }) => {
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
    await page.goto('/join/654321')

    // The code should be prefilled
    await expect(page.getByText('654321')).toBeVisible()
  })
})
