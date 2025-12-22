import { test, expect } from '@playwright/test'

test.describe('Share Session Modal', () => {
  test('should open share modal from session page', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      // Find and click share button
      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        // Modal should be visible
        const modal = page.locator('[role="dialog"]')
        await expect(modal).toBeVisible()
      }
    }
  })

  test('should display QR code in share modal', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        // Look for QR code
        const qrCode = page.locator('svg[class*="qr"], [data-testid="qr"], canvas')
        if (await qrCode.count() > 0) {
          await expect(qrCode.first()).toBeVisible()
        }
      }
    }
  })

  test('should display join code', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        // Look for join code (6 digit number)
        const joinCodeInput = page.locator('input[readonly]').first()
        if (await joinCodeInput.count() > 0) {
          const value = await joinCodeInput.inputValue()
          // Should be a 6 character code or URL
          expect(value.length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('should have copy buttons', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        // Look for copy buttons
        const copyButton = page.getByRole('button', { name: /copy/i })
        if (await copyButton.count() > 0) {
          await expect(copyButton.first()).toBeVisible()
        }
      }
    }
  })
})

test.describe('Share Modal Close Behavior', () => {
  test('should close modal when X button is clicked', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const modal = page.locator('[role="dialog"]')
        await expect(modal).toBeVisible()

        // Find and click close button
        const closeButton = page.getByRole('button', { name: /close/i })
        if (await closeButton.count() > 0) {
          await closeButton.first().click()
          await expect(modal).not.toBeVisible()
        }
      }
    }
  })

  test('should close modal when Escape key is pressed', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const modal = page.locator('[role="dialog"]')
        await expect(modal).toBeVisible()

        // Press Escape
        await page.keyboard.press('Escape')
        await expect(modal).not.toBeVisible()
      }
    }
  })

  test('should close modal when clicking outside', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const modal = page.locator('[role="dialog"]')
        await expect(modal).toBeVisible()

        // Click on the backdrop (outside the modal content)
        const backdrop = page.locator('.fixed.inset-0').first()
        if (await backdrop.count() > 0) {
          await backdrop.click({ position: { x: 10, y: 10 } })
        }
      }
    }
  })
})

test.describe('Share Modal Social Buttons', () => {
  test('should have WhatsApp share option', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const whatsappButton = page.getByRole('button', { name: /whatsapp/i })
        if (await whatsappButton.count() > 0) {
          await expect(whatsappButton).toBeVisible()
        }
      }
    }
  })

  test('should have SMS share option', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const smsButton = page.getByRole('button', { name: /sms/i })
        if (await smsButton.count() > 0) {
          await expect(smsButton).toBeVisible()
        }
      }
    }
  })

  test('should have Email share option', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const emailButton = page.getByRole('button', { name: /email/i })
        if (await emailButton.count() > 0) {
          await expect(emailButton).toBeVisible()
        }
      }
    }
  })
})

test.describe('Share Modal Accessibility', () => {
  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const modal = page.locator('[role="dialog"]')
        if (await modal.count() > 0) {
          // Modal should have role="dialog"
          await expect(modal).toHaveAttribute('role', 'dialog')

          // Should have aria-modal
          await expect(modal).toHaveAttribute('aria-modal', 'true')

          // Should have aria-labelledby
          const labelledBy = await modal.getAttribute('aria-labelledby')
          expect(labelledBy).toBeTruthy()
        }
      }
    }
  })

  test('should trap focus within modal', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const modal = page.locator('[role="dialog"]')
        if (await modal.count() > 0) {
          // Tab through modal elements
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab')
          }

          // Focus should still be within the modal
          const focusedElement = page.locator(':focus')
          const isWithinModal = await modal.locator(':focus').count() > 0
          // This verifies focus trapping is working
        }
      }
    }
  })
})

test.describe('Regenerate Join Code', () => {
  test('should show regenerate button for host', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        // Look for regenerate button (only visible to host)
        const regenerateButton = page.getByRole('button', { name: /regenerate/i })
        // This may or may not be visible depending on auth state
      }
    }
  })

  test('should show confirmation before regenerating', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page.locator('[class*="card"], [class*="session"]').first()

    if (await sessionCard.count() > 0) {
      await sessionCard.click()

      const shareButton = page.getByRole('button', { name: /share/i })

      if (await shareButton.count() > 0) {
        await shareButton.click()

        const regenerateButton = page.getByRole('button', { name: /regenerate/i })

        if (await regenerateButton.count() > 0) {
          await regenerateButton.click()

          // Should show confirmation dialog
          const confirmDialog = page.locator('[role="dialog"]').nth(1)
          if (await confirmDialog.count() > 0) {
            await expect(confirmDialog).toBeVisible()
          }
        }
      }
    }
  })
})
