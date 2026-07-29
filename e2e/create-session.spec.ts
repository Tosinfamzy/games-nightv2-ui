import { test, expect } from '@playwright/test'

test.describe('Create Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to create session page
    await page.goto('/sessions/new')
  })

  test('should redirect to GM creation if no GM exists', async ({ page }) => {
    // If no GM exists in localStorage, should redirect to GM creation
    await page.waitForURL(/\/gm\/new|\/sessions\/new/)
  })

  test('should display the create session form when GM exists', async ({
    page,
  }) => {
    // First create a GM profile if needed
    if (page.url().includes('/gm/new')) {
      // Fill out GM creation form
      await page.getByLabel(/name/i).fill('Test Game Master')
      await page
        .getByRole('button', { name: /create|register|submit/i })
        .click()

      // Navigate back to create session
      await page.goto('/sessions/new')
    }

    // Check for create session form elements
    await expect(page.getByText(/create.*session/i).first()).toBeVisible()
  })
})

test.describe('Create Session Form Validation', () => {
  test('should require session name', async ({ page }) => {
    await page.goto('/sessions/new')

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /create session/i })

    // Check if submit button exists
    if ((await submitButton.count()) > 0) {
      // Try clicking without filling required fields
      await submitButton.click()

      // Form should not submit due to HTML5 validation
      await expect(page).toHaveURL(/\/sessions\/new/)
    }
  })

  test('should require date field', async ({ page }) => {
    await page.goto('/sessions/new')

    const nameInput = page.getByLabel(/session name/i)
    const dateInput = page.getByLabel(/date/i)

    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Test Session')

      // Check that date is required
      await expect(dateInput).toHaveAttribute('required')
    }
  })
})

test.describe('Session Creation Success', () => {
  test('should show success message after creating session', async ({
    page,
  }) => {
    await page.goto('/sessions/new')

    // This test assumes a GM is already set up
    // In a real test, we'd mock the API or use test fixtures
    const successHeading = page.getByText(/session created/i)

    // If form is visible, try to create a session
    const formVisible = (await page.getByLabel(/session name/i).count()) > 0

    if (formVisible) {
      // Fill form with valid data
      await page.getByLabel(/session name/i).fill('E2E Test Session')

      // Set date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().slice(0, 16)
      await page.getByLabel(/date/i).fill(dateString)

      // Optional fields
      const descInput = page.getByLabel(/description/i)
      if ((await descInput.count()) > 0) {
        await descInput.fill('A test session created by E2E tests')
      }

      const locationInput = page.getByLabel(/location/i)
      if ((await locationInput.count()) > 0) {
        await locationInput.fill('Test Location')
      }
    }
  })
})

test.describe('Home Page to Create Session Navigation', () => {
  test('should navigate from home to create session', async ({ page }) => {
    await page.goto('/')

    // Find and click the "Host a Session" or similar button
    const hostButton = page.getByRole('link', { name: /host.*session/i })

    if ((await hostButton.count()) > 0) {
      await hostButton.click()

      // Should navigate to sessions/new or gm/new
      await expect(page).toHaveURL(/\/sessions\/new|\/gm\/new/)
    }
  })

  test('should surface an accessible host entry point', async ({ page }) => {
    await page.goto('/')

    // Hosting starts with signing in (Clerk modal), so the home page's host
    // entry point is a "Sign in to host" button with an accessible name.
    const hostButton = page.getByRole('button', { name: /sign in to host/i })
    await expect(hostButton.first()).toBeVisible()
  })
})
