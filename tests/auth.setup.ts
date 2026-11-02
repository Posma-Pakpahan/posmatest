import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { authFile, loginModal } from './helpers';

test('login sekali dengan verifikasi email manual dan simpan sesi', async ({ page, context }) => {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;
  if (!email || !password) throw new Error('Isi LOGIN_EMAIL dan LOGIN_PASSWORD di .env terlebih dahulu.');

  await page.addLocatorHandler(
    page.locator('#modalAppsQRDesktop').getByRole('button', { name: 'Close', exact: true }),
    async (button) => { await button.click(); },
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  console.log('Jika ada verifikasi human, selesaikan manual di browser.');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click({ timeout: 120_000 });

  const login = loginModal(page);
  await expect(login).toBeVisible();
  await login.getByPlaceholder('Masukkan nomor handphone atau email', { exact: true }).fill(email);
  await login.getByRole('button', { name: 'Selanjutnya', exact: true }).click();

  // Password diisi jika langkah berikutnya menampilkan input password.
  // Jika situs meminta OTP terlebih dahulu, pengguna menyelesaikannya di browser.
  console.log('Selesaikan OTP email di browser. Jika alur login berubah, lanjutkan login manual; waktu tunggu 3 menit.');
  const passwordInput = page.locator('input[type="password"]').first();
  const loginComplete = page.getByRole('button', { name: 'Masuk', exact: true });
  const nextStep = await Promise.race([
    passwordInput.waitFor({ state: 'visible', timeout: 180_000 }).then(() => 'password' as const),
    loginComplete.waitFor({ state: 'hidden', timeout: 180_000 }).then(() => 'complete' as const),
  ]);

  if (nextStep === 'password') {
    await passwordInput.fill(password);
    await passwordInput.press('Enter');
  }

  await expect(loginComplete, 'Login belum selesai. Selesaikan OTP dan tombol konfirmasi di browser.').toBeHidden({ timeout: 180_000 });
  await expect(passwordInput).toBeHidden();
  await expect(page.getByText('Masuk Akun', { exact: true })).toBeHidden();
  await expect(page.getByPlaceholder('Cari di Klik Indomaret', { exact: true })).toBeVisible();

  await mkdir('playwright/.auth', { recursive: true });
  await context.storageState({ path: authFile, indexedDB: true });
  console.log(`Sesi tersimpan di ${authFile}. Jalankan npm run test:session.`);
});
