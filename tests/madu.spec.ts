import { expect, test } from '@playwright/test';
import { loginModal, openHoneyProduct } from './helpers';

test('pengunjung memilih madu, membuka detail, dan diminta login saat menambah keranjang', async ({ page }) => {
  const cartButton = await openHoneyProduct(page);

  await test.step('Klik keranjang dan pastikan form login muncul', async () => {
    await cartButton.click();
    const login = loginModal(page);
    await expect(login).toBeVisible();
    await expect(login.getByPlaceholder('Masukkan nomor handphone atau email', { exact: true })).toBeEditable();
    await expect(login.getByRole('button', { name: 'Selanjutnya', exact: true })).toBeDisabled();
  });
});
