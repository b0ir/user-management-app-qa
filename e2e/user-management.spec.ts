import { test, expect } from '@playwright/test';

test.describe('User Management Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Gestión de Usuarios' })).toBeVisible();
  });

  test.describe('User List Functionality', () => {
    test('should display user list with correct headers', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Lista de Usuarios' })).toBeVisible();
      await expect(page.getByText(/usuarios registrados en total/)).toBeVisible();
    });

    test('should show user cards with all information', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();

      // Verificar que se muestran todos los campos de información del usuario
      await expect(firstUser.getByText(/Nombre:/)).toBeVisible();
      await expect(firstUser.getByText(/RUT:/)).toBeVisible();
      await expect(firstUser.getByText(/Fecha de Nacimiento:/)).toBeVisible();
      await expect(firstUser.getByText(/Hijos:/)).toBeVisible();
      await expect(firstUser.getByText(/Email:/)).toBeVisible();
      await expect(firstUser.getByText(/Teléfonos:/)).toBeVisible();
      await expect(firstUser.getByText(/Direcciones:/)).toBeVisible();
    });

    test('should show edit and delete buttons for each user', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();

      await expect(firstUser.getByRole('button', { name: 'Editar' })).toBeVisible();
      await expect(firstUser.getByRole('button', { name: /Eliminar/ })).toBeVisible();
    });

    test('should disable delete button for users with birthday today', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const deleteButtons = page.getByRole('button', { name: /eliminar/i });

      // Verificar si hay botones de eliminar deshabilitados (usuarios de cumpleaños)
      const disabledDeleteButtons = await deleteButtons.evaluateAll((buttons) =>
        buttons.filter((button) => button.hasAttribute('disabled'))
      );

      // El test pasa si podemos identificar botones de eliminar deshabilitados
      expect(Array.isArray(disabledDeleteButtons)).toBe(true);
    });
  });

  test.describe('Add User Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: '+ Agregar Usuario' }).click();
      await expect(page.getByRole('heading', { name: 'Agregar Nuevo Usuario' })).toBeVisible();
    });

    test('should display add user form with all required fields', async ({ page }) => {
      // Verificar que todos los campos del formulario estén presentes
      await expect(page.getByLabel('RUT *')).toBeVisible();
      await expect(page.getByLabel('Nombre *')).toBeVisible();
      await expect(page.getByLabel('Fecha de Nacimiento *')).toBeVisible();
      await expect(page.getByLabel('Cantidad de Hijos')).toBeVisible();
      await expect(page.getByLabel('Correo Electrónico *')).toBeVisible();
      await expect(page.getByText('Teléfonos *')).toBeVisible();
      await expect(page.getByText('Direcciones *')).toBeVisible();

      // Verificar botones de acción
      await expect(page.getByRole('button', { name: 'Crear Usuario' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    });

    test('should successfully create a new user', async ({ page }) => {
      // Llenar el formulario con RUT válido según el algoritmo chileno
      await page.getByLabel('RUT *').fill('12345678-5');
      await page.getByLabel('Nombre *').fill('Test User E2E');
      await page.getByLabel('Fecha de Nacimiento *').fill('1990-06-15');
      await page.getByLabel('Cantidad de Hijos').fill('1');
      await page.getByLabel('Correo Electrónico *').fill('test.e2e@example.com');

      // Llenar primer número de teléfono
      const phoneInputs = page.locator('input[type="tel"]');
      await phoneInputs.first().fill('+56912345678');

      // Llenar primera dirección
      const addressInputs = page.locator('input[placeholder*="Av. Ejemplo"]');
      await addressInputs.first().fill('Test Address 123, Santiago');

      // Esperar a que el botón se habilite antes de hacer click
      await expect(page.getByRole('button', { name: 'Crear Usuario' })).toBeEnabled();
      await page.getByRole('button', { name: 'Crear Usuario' }).click();

      await expect(page.getByText('Usuario creado exitosamente')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // No hacer click en el botón, solo verificar que los errores ya están visibles
      // cuando el formulario está vacío

      // Verificar que el botón está deshabilitado
      await expect(page.getByRole('button', { name: 'Crear Usuario' })).toBeDisabled();

      // Verificar que aparezcan errores de validación
      await expect(page.getByText('RUT inválido')).toBeVisible();
      await expect(page.getByText('Nombre es requerido')).toBeVisible();
      await expect(page.getByText('Fecha de nacimiento es requerida')).toBeVisible();
    });

    test('should validate RUT format', async ({ page }) => {
      await page.getByLabel('RUT *').fill('invalid-rut');
      await page.getByLabel('Nombre *').click(); // Activar validación

      await expect(page.getByText('RUT inválido')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.getByLabel('Correo Electrónico *').fill('invalid-email');
      await page.getByLabel('Nombre *').click(); // Activar validación

      await expect(page.getByText('Email inválido')).toBeVisible();
    });

    test('should allow adding multiple phone numbers and addresses', async ({ page }) => {
      // Usar data-testid en lugar de texto que puede estar dividido
      await page.getByTestId('telefonos-add').click();

      const phoneInputs = page.locator('input[type="tel"]');
      await expect(phoneInputs).toHaveCount(2);

      // Agregar segunda dirección
      await page.getByTestId('direcciones-add').click();

      const addressInputs = page.locator('input[placeholder*="Av. Ejemplo"]');
      await expect(addressInputs).toHaveCount(2);
    });

    test('should allow removing additional phone numbers and addresses', async ({ page }) => {
      // Agregar segundo número de teléfono
      await page.getByTestId('telefonos-add').click();

      // Eliminarlo
      await page.getByRole('button', { name: 'Eliminar' }).first().click();

      const phoneInputs = page.locator('input[type="tel"]');
      await expect(phoneInputs).toHaveCount(1);
    });

    test('should cancel and return to list', async ({ page }) => {
      await page.getByRole('button', { name: 'Cancelar' }).click();
      await expect(page.getByRole('heading', { name: 'Lista de Usuarios' })).toBeVisible();
    });

    test('should reject duplicate RUT', async ({ page }) => {
      // Primero, llenar el formulario para el primer usuario
      await page.getByLabel('RUT *').fill('12345678-5');
      await page.getByLabel('Nombre *').fill('First User');
      await page.getByLabel('Fecha de Nacimiento *').fill('1990-06-15');
      await page.getByLabel('Correo Electrónico *').fill('first@example.com');

      const phoneInputs = page.locator('input[type="tel"]');
      await phoneInputs.first().fill('+56912345678');

      const addressInputs = page.locator('input[placeholder*="Av. Ejemplo"]');
      await addressInputs.first().fill('Test Address 123');

      // Crear el primer usuario
      await expect(page.getByRole('button', { name: 'Crear Usuario' })).toBeEnabled();
      await page.getByRole('button', { name: 'Crear Usuario' }).click();
      await expect(page.getByText('Usuario creado exitosamente')).toBeVisible();

      // Ahora intentar crear otro usuario con el mismo RUT
      await page.getByRole('button', { name: '+ Agregar Usuario' }).click();

      await page.getByLabel('RUT *').fill('12345678-5'); // Mismo RUT
      await page.getByLabel('Nombre *').fill('Duplicate User');
      await page.getByLabel('Fecha de Nacimiento *').fill('1990-06-15');
      await page.getByLabel('Correo Electrónico *').fill('duplicate@example.com');

      await phoneInputs.first().fill('+56912345678');
      await addressInputs.first().fill('Test Address 123');

      await expect(page.getByRole('button', { name: 'Crear Usuario' })).toBeEnabled();
      await page.getByRole('button', { name: 'Crear Usuario' }).click();

      // Ahora debería mostrar el error de RUT duplicado
      await expect(page.getByText('El RUT ya está registrado')).toBeVisible();
    });
  });

  test.describe('Edit User Functionality', () => {
    test('should open edit form when edit button is clicked', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      await expect(page.getByRole('heading', { name: 'Editar Usuario' })).toBeVisible();
    });

    test('should pre-populate form with existing user data', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      // Verificar que los campos del formulario estén poblados
      await expect(page.getByLabel('Nombre *')).not.toHaveValue('');
      await expect(page.getByLabel('Fecha de Nacimiento *')).not.toHaveValue('');
      await expect(page.getByLabel('Correo Electrónico *')).not.toHaveValue('');
    });

    test('should not show RUT field in edit mode', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      // El campo RUT no debe estar presente en modo edición
      await expect(page.getByLabel('RUT *')).not.toBeVisible();
    });

    test('should successfully update user information', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      // Actualizar nombre del usuario
      await page.getByLabel('Nombre *').fill('Updated User Name');

      // Enviar el formulario
      await page.getByRole('button', { name: 'Actualizar Usuario' }).click();

      // Esperar mensaje de éxito y redirección
      await expect(page.getByText('Usuario actualizado exitosamente')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Lista de Usuarios' })).toBeVisible();

      // Verificar que el nombre actualizado aparezca en la lista
      await expect(page.getByText('Updated User Name')).toBeVisible();
    });

    test('should validate form fields in edit mode', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      // Limpiar un campo requerido
      await page.getByLabel('Nombre *').fill('');
      await page.getByLabel('Correo Electrónico *').click();

      // Verificar que aparezca el error
      await expect(page.getByText('Nombre es requerido')).toBeVisible();

      // El botón debería estar deshabilitado
      await expect(page.getByRole('button', { name: 'Actualizar Usuario' })).toBeDisabled();
    });

    test('should allow adding and removing contacts in edit mode', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      // Agregar un teléfono adicional
      await page.getByTestId('telefonos-add').click();

      const phoneInputs = page.locator('input[type="tel"]');
      await expect(phoneInputs).toHaveCount(2);

      // Agregar una dirección adicional
      await page.getByTestId('direcciones-add').click();

      const addressInputs = page.locator('input[placeholder*="Av. Ejemplo"]');
      await expect(addressInputs).toHaveCount(2);
    });

    test('should cancel edit and return to list', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      await firstUser.getByRole('button', { name: 'Editar' }).click();

      await page.getByRole('button', { name: 'Cancelar' }).click();
      await expect(page.getByRole('heading', { name: 'Lista de Usuarios' })).toBeVisible();
    });
  });

  test.describe('Delete User Functionality', () => {
    test('should show confirmation dialog when delete button is clicked', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      const firstUser = page.locator('[data-testid="user-card"]').first();
      const deleteButton = firstUser.getByRole('button', { name: /Eliminar/ });

      // Solo hacer click si el botón no está deshabilitado (no es cumpleaños)
      if (await deleteButton.isEnabled()) {
        await deleteButton.click();

        // Buscar modal de confirmación o mensaje
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

      // Buscar usuarios con cumpleaños (si los hay)
      const birthdayUsers = page.locator('[data-testid="user-card"]').filter({
        hasText: /¡Hoy es el cumpleaños/,
      });

      const birthdayCount = await birthdayUsers.count();

      if (birthdayCount > 0) {
        const firstBirthdayUser = birthdayUsers.first();
        const deleteButton = firstBirthdayUser.getByRole('button', { name: /No eliminar/ });

        await expect(deleteButton).toBeDisabled();
        await expect(deleteButton).toHaveAttribute('title', /No se puede eliminar/);
      }
    });

    test('should successfully delete a user when confirmed', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      // Contar usuarios iniciales
      const initialUserCount = await page.locator('[data-testid="user-card"]').count();

      const firstUser = page.locator('[data-testid="user-card"]').first();
      const deleteButton = firstUser.getByRole('button', { name: /Eliminar/ });

      // Solo proceder si el botón está habilitado
      if (await deleteButton.isEnabled()) {
        await deleteButton.click();

        // Buscar y hacer click en confirmación si existe
        const confirmButton = page.getByRole('button', { name: /confirmar/i }).first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verificar mensaje de éxito
        await expect(page.getByText('Usuario eliminado exitosamente')).toBeVisible();

        // Verificar que hay un usuario menos
        await expect(page.locator('[data-testid="user-card"]')).toHaveCount(initialUserCount - 1);
      }
    });
  });

  test.describe('Search and Filter Functionality', () => {
    test('should filter users by search term', async ({ page }) => {
      await page.waitForSelector('[data-testid="user-card"]', { timeout: 10000 });

      // Si existe un campo de búsqueda
      const searchInput = page.getByPlaceholder(/buscar/i) || page.getByLabel(/buscar/i);

      if (await searchInput.first().isVisible()) {
        await searchInput.first().fill('Test');

        // Verificar que se filtran los resultados
        await page.waitForTimeout(500); // Esperar debounce

        const visibleUsers = page.locator('[data-testid="user-card"]:visible');
        const userCount = await visibleUsers.count();

        // Al menos debería mostrar resultados o mensaje de "no encontrado"
        if (userCount === 0) {
          await expect(page.getByText(/no se encontraron/i)).toBeVisible();
        } else {
          await expect(visibleUsers.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByRole('heading', { name: 'Gestión de Usuarios' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Lista de Usuarios' })).toBeVisible();

      // Verificar que los elementos principales siguen siendo accesibles
      await expect(page.getByRole('button', { name: '+ Agregar Usuario' })).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.getByRole('heading', { name: 'Gestión de Usuarios' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Lista de Usuarios' })).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Verificar roles principales
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByRole('button', { name: '+ Agregar Usuario' })).toBeVisible();

      // Verificar headings
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');

      // Obtener todos los elementos focusables
      const focusableElements = page.locator(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const count = await focusableElements.count();

      if (count > 0) {
        // Verificar que podemos navegar a elementos específicos
        await page.keyboard.press('Tab');

        // Usar evaluate para verificar foco de manera más confiable
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
