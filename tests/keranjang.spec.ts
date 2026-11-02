import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { authFile, loginModal, openHoneyProduct } from './helpers';

test.skip(!existsSync(authFile), 'Sesi belum tersedia. Jalankan npm run auth dan selesaikan OTP manual.');

test('pengguna login menambahkan produk madu ke keranjang', async ({ page }) => {
  const cartButton = await openHoneyProduct(page);
  await expect(
    page.getByRole('button', { name: 'Masuk', exact: true }),
    'Sesi sudah kedaluwarsa. Jalankan npm run auth lagi.',
  ).toBeHidden();

  // Respons mutasi harus berhasil; sekadar modal login tidak muncul belum cukup.
  const [response] = await Promise.all([
    page.waitForResponse((response) =>
      /cart|keranjang/i.test(response.url()) &&
      ['POST', 'PUT', 'PATCH'].includes(response.request().method()),
    ),
    cartButton.click(),
  ]);
  expect(response.ok(), `Tambah keranjang gagal: HTTP ${response.status()}`).toBeTruthy();
  // Bentuk respons masih asumsi awal dan perlu dicocokkan saat akses live tersedia.
  const body = await response.json();
  expect(body.success, 'API keranjang harus mengonfirmasi success=true. Periksa skema respons jika berbeda.').toBe(true);
  await expect(loginModal(page)).toBeHidden();
});
