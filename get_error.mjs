import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[Browser Error] ${msg.text()}`);
        }
    });

    page.on('pageerror', exception => {
        console.log(`[Uncaught Exception] ${exception}`);
    });

    try {
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
        console.log(`[Goto Error] ${e}`);
    }

    await browser.close();
})();
