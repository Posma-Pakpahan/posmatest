import { expect, test, type Page } from '@playwright/test';

export const authFile = 'playwright/.auth/user.json';

export async function openHoneyProduct(page: Page) {
  const manualVerification = process.env.MANUAL_VERIFICATION === '1';

  await test.step('Buka beranda dan kategori Madu', async () => {
    // Pop-up aplikasi bisa muncul terlambat dan menutupi menu.
    await page.addLocatorHandler(
      page.locator('#modalAppsQRDesktop').getByRole('button', { name: 'Close', exact: true }),
      async (closeButton) => { await closeButton.click(); },
    );

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (manualVerification) console.log('Selesaikan verifikasi human di jendela Chrome jika muncul. Beranda ditunggu maksimal 2 menit.');
    await expect(
      page.getByPlaceholder('Cari di Klik Indomaret', { exact: true }),
      'Beranda belum siap. Jika muncul Cloudflare, selesaikan verifikasi manual di browser.',
    ).toBeVisible({ timeout: manualVerification ? 120_000 : 45_000 });
    await page.getByText('Kategori', { exact: true }).click();
    // Nama aksesibel tombol juga dapat memuat alt gambar "Makanan".
    await page.locator('button.menu-list').filter({ hasText: /^Makanan$/ }).click();
    await page.getByRole('link', { name: 'Madu', exact: true }).click();
    await expect(page).toHaveURL(/\/xpress\/category\/makanan\/sarapan-selai\/madu\/?(?:\?.*)?$/);
  });

  return await test.step('Pilih produk madu dan buka halaman detail', async () => {
    if (manualVerification) console.log('Kategori Madu sedang dibuka. Jika verifikasi human muncul lagi, selesaikan di Chrome yang sama; test menunggu maksimal 2 menit.');
    const product = page
      .locator('a[href^="/xpress/"]:not([href*="/category"]):not([href*="/ppp/"])')
      .filter({ hasText: /madu|honey/i })
      .first();

    await expect(
      product,
      'Daftar madu belum tampil. Periksa verifikasi Cloudflare atau ketersediaan produk di area terpilih.',
    ).toBeVisible({ timeout: manualVerification ? 120_000 : 30_000 });
    const productName = (await product.innerText())
      .split(/\bRp\.?\s*/i)[0]
      .replace(/\s+/g, ' ')
      .trim();
    expect(productName).toMatch(/madu|honey/i);
    const productUrl = await product.getAttribute('href');
    if (!productUrl) throw new Error('Tautan halaman detail produk tidak ditemukan.');
    const expectedUrl = new URL(productUrl, page.url());
    await product.click();
    await expect(page).toHaveURL((url) => url.pathname === expectedUrl.pathname);
    return productName;
  });
}

export function loginModal(page: Page) {
  return page.locator('.modal-open').filter({
    has: page.getByText('Masuk Akun', { exact: true }),
  });
}
