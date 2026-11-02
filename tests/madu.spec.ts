import { expect, test } from '@playwright/test';
import { openHoneyProduct } from './helpers';

test('pengunjung memilih kategori Madu dan membuka detail produk', async ({ page }) => {
  const productName = await openHoneyProduct(page);

  await test.step('Pastikan nama dan harga tampil pada detail produk terpilih', async () => {
    await expect(page.getByRole('heading', { name: productName, exact: true })).toBeVisible();
    // Harga mengikuti produk dan area belanja, sehingga tidak dikunci ke Rp25.500.
    await expect(page.getByText(/^Rp\.?\s*[\d.,]+/).first()).toBeVisible();
  });
});
