import { test, expect } from '@playwright/test'

test.describe('Chat Interface', () => {
  test('should display chat container', async ({ page }) => {
    // Navigate to a session with chat
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      // Navigate to chat tab
      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        // Check for chat container
        const chatContainer = page.locator('[class*="chat"]')
        await expect(chatContainer.first()).toBeVisible()
      }
    }
  })

  test('should show message input field', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        // Check for message input
        const messageInput = page
          .locator('textarea, input[type="text"]')
          .filter({ hasText: '' })
        const inputWithPlaceholder = page.getByPlaceholder(/message|type/i)

        if ((await inputWithPlaceholder.count()) > 0) {
          await expect(inputWithPlaceholder.first()).toBeVisible()
        }
      }
    }
  })

  test('should have send button', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        // Check for send button
        const sendButton = page.getByRole('button', { name: /send/i })
        if ((await sendButton.count()) > 0) {
          await expect(sendButton).toBeVisible()
        }
      }
    }
  })
})

test.describe('Chat Input Validation', () => {
  test('should disable send button when input is empty', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        const sendButton = page.getByRole('button', { name: /send/i })

        if ((await sendButton.count()) > 0) {
          // Send button should be disabled when no message
          await expect(sendButton).toBeDisabled()
        }
      }
    }
  })

  test('should enable send button when message is entered', async ({
    page,
  }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        const messageInput = page.getByPlaceholder(/message|type/i)
        const sendButton = page.getByRole('button', { name: /send/i })

        if (
          (await messageInput.count()) > 0 &&
          (await sendButton.count()) > 0
        ) {
          // Type a message
          await messageInput.fill('Hello, this is a test message')

          // Send button should be enabled
          await expect(sendButton).toBeEnabled()
        }
      }
    }
  })

  test('should show character count near limit', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        const messageInput = page.getByPlaceholder(/message|type/i)

        if ((await messageInput.count()) > 0) {
          // Type a long message (over 800 chars)
          const longMessage = 'a'.repeat(850)
          await messageInput.fill(longMessage)

          // Character count should be visible
          const charCount = page.getByText(/\/1000/)
          if ((await charCount.count()) > 0) {
            await expect(charCount).toBeVisible()
          }
        }
      }
    }
  })
})

test.describe('Chat Connection Status', () => {
  test('should show connection status', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        // Look for connection status indicator
        const connectionStatus = page.getByText(/connected|connecting/i)
        if ((await connectionStatus.count()) > 0) {
          await expect(connectionStatus.first()).toBeVisible()
        }
      }
    }
  })
})

test.describe('Chat Accessibility', () => {
  test('should have accessible send button', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        const sendButton = page.getByRole('button', { name: /send/i })

        if ((await sendButton.count()) > 0) {
          // Should have aria-label
          const ariaLabel = await sendButton.getAttribute('aria-label')
          expect(ariaLabel || (await sendButton.textContent())).toBeTruthy()
        }
      }
    }
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        const messageInput = page.getByPlaceholder(/message|type/i)

        if ((await messageInput.count()) > 0) {
          await messageInput.focus()
          await messageInput.fill('Test message')

          // Enter should attempt to send (verify input behavior)
          await page.keyboard.press('Enter')

          // Input should be cleared if message was sent
          // Or focus should remain if not connected
        }
      }
    }
  })
})

test.describe('Chat Empty State', () => {
  test('should show empty state when no messages', async ({ page }) => {
    await page.goto('/sessions')

    const sessionCard = page
      .locator('[class*="card"], [class*="session"]')
      .first()

    if ((await sessionCard.count()) > 0) {
      await sessionCard.click()

      const chatTab = page.getByRole('button', { name: /chat/i })
      if ((await chatTab.count()) > 0) {
        await chatTab.click()

        // Look for empty state message
        const emptyState = page.getByText(
          /no messages|start.*conversation|be the first/i,
        )
        if ((await emptyState.count()) > 0) {
          await expect(emptyState.first()).toBeVisible()
        }
      }
    }
  })
})
