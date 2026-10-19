const { test, expect } = require('@playwright/test');

// The program from the interpreter-sync fixture. It is small, deterministic,
// and exercises the real bundled interpreter, not a mock.
const SYNC_PROGRAM = 'har i mein silsilo(3) { likh(i) }';

const waitForEditor = async (page) => {
  await expect(page.locator('#pane-editor .monaco-editor')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('#run-button')).toBeEnabled({ timeout: 60000 });
};

test.describe('workbench', () => {
  test('mounts Monaco over the docs pane', async ({ page }) => {
    await page.goto('/workbench');

    await expect(page.getByRole('heading', { level: 1, name: 'Introduction' })).toBeVisible();
    await expect(page.locator('#pane-docs')).toBeVisible();
    await expect(page.locator('#pane-editor')).toBeVisible();
    await waitForEditor(page);

    // The plain textarea is the fallback; Monaco replaces it once its chunk
    // resolves, so it must not still be the active surface.
    await expect(page.locator('#workbench-code')).toHaveCount(0);
  });

  test('runs the synced interpreter program from a shared link', async ({ page }) => {
    await page.goto(`/playground?code=${encodeURIComponent(SYNC_PROGRAM)}`);

    await expect(page).toHaveURL(/\/workbench\?code=/);
    await waitForEditor(page);

    await page.locator('#run-button').click();

    const output = page.locator('#pane-editor [role="status"] pre');
    await expect(output).toHaveText(/0\s+1\s+2/, { timeout: 60000 });
    await expect(page.locator('#pane-editor [role="status"]')).not.toContainText('Error');
  });

  test('loads a docs example into the editor and runs it', async ({ page }) => {
    await page.goto('/workbench');
    await waitForEditor(page);

    const runnable = page
      .locator('#pane-docs [data-fence="runnable"]')
      .filter({ has: page.getByRole('button', { name: 'Load' }) })
      .first();

    await runnable.getByRole('button', { name: 'Load' }).click();

    const status = page.locator('#pane-editor [role="status"]');
    await expect(status).toContainText('Loaded into the editor. Press Run.');

    await page.locator('#run-button').click();
    await expect(status.locator('pre')).toHaveText('Salam, Sindh!', { timeout: 60000 });
  });
});

test.describe('workbench split view', () => {
  test('the divider is keyboard operable and is not a focus trap', async ({ page }) => {
    await page.goto('/workbench');

    const divider = page.getByRole('separator', {
      name: 'Resize documentation and editor panes',
    });
    await expect(divider).toBeVisible();
    await expect(divider).toHaveAttribute('aria-valuenow', '50');

    await divider.focus();
    await expect(divider).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '52');

    await page.keyboard.press('Shift+ArrowRight');
    await expect(divider).toHaveAttribute('aria-valuenow', '62');

    await page.keyboard.press('Home');
    await expect(divider).toHaveAttribute('aria-valuenow', '25');

    await page.keyboard.press('End');
    await expect(divider).toHaveAttribute('aria-valuenow', '75');

    await page.keyboard.press('Tab');
    await expect(divider).not.toBeFocused();
  });
});

test.describe('workbench pane switch on a narrow screen', () => {
  test.use({ viewport: { width: 900, height: 720 } });

  test('the pane tabs switch the visible pane', async ({ page }) => {
    await page.goto('/workbench');

    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(2);
    await expect(page.getByRole('tab', { name: 'Docs' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Editor' }).click();
    await expect(page.getByRole('tab', { name: 'Editor' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.locator('#pane-editor')).toBeVisible();
    await expect(page.locator('#pane-docs')).toBeHidden();
  });
});
