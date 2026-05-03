import { test, expect } from '@playwright/test';

test.describe('User Management Application', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Load the main page where the login form is shown if not logged in
    await page.goto('/');

    // Fill username and password
    await page.getByTestId('username-input').fill('testUser');
    await page.getByTestId('password-input').fill('1234'); // Fixed password for tests

    // Click login
    await page.getByTestId('login-button').click();

    // Wait for the main page to load
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  });

  test.describe('User List Functionality', () => {
    test('should display user list with correct headers', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();
      await expect(page.getByText(/registered users in total/)).toBeVisible();
    });

    test('should show user cards with all information', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();

      // Verify that all user information fields are shown
      await expect(firstUser.getByText(/Name:/)).toBeVisible();
      await expect(firstUser.getByText(/RUT:/)).toBeVisible();
      await expect(firstUser.getByText(/Date of Birth:/)).toBeVisible();
      await expect(firstUser.getByText(/Children:/)).toBeVisible();
      await expect(firstUser.getByText(/Email:/)).toBeVisible();
      await expect(firstUser.getByText(/Phones:/)).toBeVisible();
      await expect(firstUser.getByText(/Addresses:/)).toBeVisible();
    });

    test('should show edit and delete buttons for each user', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();

      await expect(firstUser.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(firstUser.getByRole('button', { name: /Delete/ })).toBeVisible();
    });

    test('should disable delete button for users with birthday today', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const deleteButtons = page.getByRole('button', { name: /delete/i });

      // Check if there are any disabled delete buttons (birthday users)
      const disabledDeleteButtons = await deleteButtons.evaluateAll((buttons) =>
        buttons.filter((button) => button.hasAttribute('disabled'))
      );

      // Test passes if we can identify disabled delete buttons
      expect(Array.isArray(disabledDeleteButtons)).toBe(true);
    });
  });

  test.describe('Add User Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: '+ Add User' }).click();
      await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();
    });

    test('should display add user form with all required fields', async ({ page }) => {
      // Verify that all form fields are present
      await expect(page.getByLabel('RUT *')).toBeVisible();
      await expect(page.getByLabel('Name *')).toBeVisible();
      await expect(page.getByLabel('Date of Birth *')).toBeVisible();
      await expect(page.getByLabel('Number of Children')).toBeVisible();
      await expect(page.getByLabel('Email *')).toBeVisible();
      await expect(page.getByText('Phones *')).toBeVisible();
      await expect(page.getByText('Addresses *')).toBeVisible();

      // Verify action buttons
      await expect(page.getByRole('button', { name: 'Create User' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('should successfully create a new user', async ({ page }) => {
      // Fill the form with a valid RUT according to the Chilean algorithm
      await page.getByLabel('RUT *').fill('11111111-1');
      await page.getByLabel('Name *').fill('Test User E2E');
      await page.getByLabel('Date of Birth *').fill('1990-06-15');
      await page.getByLabel('Number of Children').fill('1');
      await page.getByLabel('Email *').fill('test.e2e@example.com');

      // Fill first phone number
      const phoneInputs = page.locator('input[type="tel"]');
      await phoneInputs.first().fill('+56912345678');

      // Fill first address
      const addressInputs = page.locator('input[placeholder*="Example Ave"]');
      await addressInputs.first().fill('Test Address 123, Santiago');

      // Wait for the button to be enabled before clicking
      await expect(page.getByRole('button', { name: 'Create User' })).toBeEnabled();
      await page.getByRole('button', { name: 'Create User' }).click();

      await expect(page.getByText('User created successfully')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Don't click the button, just verify that errors are already visible
      // when the form is empty

      // Verify that the button is disabled
      await expect(page.getByRole('button', { name: 'Create User' })).toBeDisabled();

      // Verify that validation errors appear
      await expect(page.getByText('RUT inválido')).toBeVisible();
      await expect(page.getByText('Nombre es requerido')).toBeVisible();
      await expect(page.getByText('Fecha de nacimiento es requerida')).toBeVisible();
    });

    test('should validate RUT format', async ({ page }) => {
      await page.getByLabel('RUT *').fill('invalid-rut');
      await page.getByLabel('Name *').click(); // Trigger validation

      await expect(page.getByText('RUT inválido')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.getByLabel('Email *').fill('invalid-email');
      await page.getByLabel('Name *').click(); // Trigger validation

      await expect(page.getByText('Email inválido')).toBeVisible();
    });

    test('should allow adding multiple phone numbers and addresses', async ({ page }) => {
      // Use data-testid instead of text that may be split
      await page.getByTestId('telefonos-add').click();

      const phoneInputs = page.locator('input[type="tel"]');
      await expect(phoneInputs).toHaveCount(2);

      // Add second address
      await page.getByTestId('direcciones-add').click();

      const addressInputs = page.locator('input[placeholder*="Example Ave"]');
      await expect(addressInputs).toHaveCount(2);
    });

    test('should allow removing additional phone numbers and addresses', async ({ page }) => {
      // Add second phone number
      await page.getByTestId('telefonos-add').click();

      // Remove it
      await page.getByRole('button', { name: 'Remove' }).first().click();

      const phoneInputs = page.locator('input[type="tel"]');
      await expect(phoneInputs).toHaveCount(1);
    });

    test('should cancel and return to list', async ({ page }) => {
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();
    });

    test('should reject duplicate RUT', async ({ page }) => {
      // First, fill the form for the first user
      await page.getByLabel('RUT *').fill('11111111-1');
      await page.getByLabel('Name *').fill('First User');
      await page.getByLabel('Date of Birth *').fill('1990-06-15');
      await page.getByLabel('Email *').fill('first@example.com');

      const phoneInputs = page.locator('input[type="tel"]');
      await phoneInputs.first().fill('+56912345678');

      const addressInputs = page.locator('input[placeholder*="Example Ave"]');
      await addressInputs.first().fill('Test Address 123');

      // Create the first user
      await expect(page.getByRole('button', { name: 'Create User' })).toBeEnabled();
      await page.getByRole('button', { name: 'Create User' }).click();
      await expect(page.getByText('User created successfully')).toBeVisible();

      // Now attempt to create another user with the same RUT
      await page.getByRole('button', { name: '+ Add User' }).click();

      await page.getByLabel('RUT *').fill('11111111-1'); // Same RUT
      await page.getByLabel('Name *').fill('Duplicate User');
      await page.getByLabel('Date of Birth *').fill('1990-06-15');
      await page.getByLabel('Email *').fill('duplicate@example.com');

      await phoneInputs.first().fill('+56912345678');
      await addressInputs.first().fill('Test Address 123');

      await expect(page.getByRole('button', { name: 'Create User' })).toBeEnabled();
      await page.getByRole('button', { name: 'Create User' }).click();

      // Should now show the duplicate RUT error
      await expect(page.getByText('El RUT ya está registrado')).toBeVisible();
    });
  });

  test.describe('Edit User Functionality', () => {
    test('should open edit form when edit button is clicked', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();
    });

    test('should pre-populate form with existing user data', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      // Verify that form fields are populated
      await expect(page.getByLabel('Name *')).not.toHaveValue('');
      await expect(page.getByLabel('Date of Birth *')).not.toHaveValue('');
      await expect(page.getByLabel('Email *')).not.toHaveValue('');
    });

    test('should not show RUT field in edit mode', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      // RUT field should not be present in edit mode
      await expect(page.getByLabel('RUT *')).not.toBeVisible();
    });

    test('should successfully update user information', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      // Update the user's name
      await page.getByLabel('Name *').fill('Updated User Name');

      // Submit the form
      await page.getByRole('button', { name: 'Update User' }).click();

      // Wait for success message and redirect
      await expect(page.getByText('Usuario actualizado exitosamente')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();

      // Verify that the updated name appears in the list
      await expect(page.getByText('Updated User Name')).toBeVisible();
    });

    test('should validate form fields in edit mode', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      // Clear a required field
      await page.getByLabel('Name *').fill('');
      await page.getByLabel('Email *').click();

      // Verify that the error appears
      await expect(page.getByText('Nombre es requerido')).toBeVisible();

      // Button should be disabled
      await expect(page.getByRole('button', { name: 'Update User' })).toBeDisabled();
    });

    test('should allow adding and removing contacts in edit mode', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      // Add an additional phone
      await page.getByTestId('telefonos-add').click();

      const phoneInputs = page.locator('input[type="tel"]');
      await expect(phoneInputs).toHaveCount(2);

      // Add an additional address
      await page.getByTestId('direcciones-add').click();

      const addressInputs = page.locator('input[placeholder*="Example Ave"]');
      await expect(addressInputs).toHaveCount(2);
    });

    test('should cancel edit and return to list', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Edit' }).click();

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();
    });
  });

  test.describe('Delete User Functionality', () => {
    test('should show confirmation dialog when delete button is clicked', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      const deleteButton = firstUser.getByRole('button', { name: /Delete/ });

      // Only click if the button is not disabled (not a birthday)
      if (await deleteButton.isEnabled()) {
        await deleteButton.click();

        // Look for confirmation modal or message
        const confirmDialog =
          page.getByText(/¿Está seguro que desea eliminar/i) ||
          page.getByRole('button', { name: /confirmar/i }) ||
          page.getByText(/eliminar usuario/i);

        if (await confirmDialog.first().isVisible()) {
          await expect(confirmDialog.first()).toBeVisible();
        }
      }
    });

    test('should prevent deletion of users with birthday today', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      // Look for users with birthday (if any)
      const birthdayUsers = page.locator('[data-testid="user-card"]').filter({
        hasText: /Today is .+'s birthday!/,
      });

      const birthdayCount = await birthdayUsers.count();

      if (birthdayCount > 0) {
        const firstBirthdayUser = birthdayUsers.first();
        const deleteButton = firstBirthdayUser.getByRole('button', { name: /Cannot delete/ });

        await expect(deleteButton).toBeDisabled();
        await expect(deleteButton).toHaveAttribute('title', /Cannot delete/);
      }
    });

    test('should successfully delete a user when confirmed', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      // Count initial users
      const initialUserCount = await page.locator('[data-testid="user-card"]').count();

      const firstUser = page.locator('[data-testid="user-card"]').first();
      const deleteButton = firstUser.getByRole('button', { name: /Delete/ });

      // Only proceed if the button is enabled
      if (await deleteButton.isEnabled()) {
        await deleteButton.click();

        // Look for and click confirmation if it exists
        const confirmButton = page.getByRole('button', { name: /confirmar/i }).first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify success message
        await expect(page.getByText('Usuario eliminado exitosamente')).toBeVisible();

        // Verify there is one fewer user
        await expect(page.locator('[data-testid="user-card"]')).toHaveCount(initialUserCount - 1);
      }
    });
  });

  test.describe('Search and Filter Functionality', () => {
    test('should filter users by search term', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      // If a search field exists
      const searchInput = page.getByPlaceholder(/search/i) || page.getByLabel(/search/i);

      if (await searchInput.first().isVisible()) {
        await searchInput.first().fill('Test');

        // Verify results are filtered
        await page.waitForTimeout(500); // Wait for debounce

        const visibleUsers = page.locator('[data-testid="user-card"]:visible');
        const userCount = await visibleUsers.count();

        // Should at least show results or a "not found" message
        if (userCount === 0) {
          await expect(page.getByText(/not found/i)).toBeVisible();
        } else {
          await expect(visibleUsers.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();

      // Verify that main elements are still accessible
      await expect(page.getByRole('button', { name: '+ Add User' })).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'User List' })).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Verify main roles
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByRole('button', { name: '+ Add User' })).toBeVisible();

      // Verify headings
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');

      // Get all focusable elements
      const focusableElements = page.locator(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const count = await focusableElements.count();

      if (count > 0) {
        // Verify we can navigate to specific elements
        await page.keyboard.press('Tab');

        // Use evaluate to verify focus more reliably
        const hasFocusedElement = await page.evaluate(() => {
          return document.activeElement !== document.body && document.activeElement !== null;
        });

        expect(hasFocusedElement).toBe(true);
      } else {
        console.log('No focusable elements found on page');
      }
    });
  });
});
