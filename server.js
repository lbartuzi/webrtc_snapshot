const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.use(express.static('public'));

/* NEW ROUTE ──────────────────────────────────────────────────────────*/
app.get('/snapshot/base64', async (req, res) => {
  const { serverIp, username, password, deviceId, timestamp } = req.query;

  if (!serverIp || !username || !password || !deviceId) {
    return res.status(400).json({
      error: 'Missing parameters. Required: serverIp, username, password, deviceId'
    });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream'
      ]
    });

    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request =>
      console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
    );

    const url = `http://localhost:${port}/index.html?` +
                `serverIp=${encodeURIComponent(serverIp)}` +
                `&username=${encodeURIComponent(username)}` +
                `&password=${encodeURIComponent(password)}` +
                `&deviceId=${encodeURIComponent(deviceId)}` +
                `&timestamp=${encodeURIComponent(timestamp || '')}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
    await page.waitForSelector('video', { timeout: 30_000 });
    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return v && v.videoWidth > 0 && v.videoHeight > 0;
    }, { timeout: 30_000 });

    // Grab raw base64 (no MIME prefix)
    const jpegB64 = await page.evaluate(() => {
      const video  = document.querySelector('video');
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '');
    });

    res.json({ image: jpegB64 });   // <-- key line for Base64 JSON
  } catch (err) {
    console.error('Snapshot-base64 error:', err);
    res.status(500).json({ error: `Snapshot-base64 error: ${err}` });
  } finally {
    if (browser) await browser.close();
  }
});
/* ────────────────────────────────────────────────────────────────────*/




app.get('/snapshot', async (req, res) => {
    const { serverIp, username, password, deviceId, timestamp } = req.query;

    if (!serverIp || !username || !password || !deviceId) {
        return res.status(400).send('Missing parameters. Required: serverIp, username, password, deviceId');
    }

    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-web-security',
                '--allow-running-insecure-content',
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream'
            ]
        });

        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

        const url = `http://localhost:${port}/index.html?serverIp=${encodeURIComponent(serverIp)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&deviceId=${encodeURIComponent(deviceId)}&timestamp=${encodeURIComponent(timestamp || '')}`;

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.waitForSelector('video', { timeout: 30000 });

        //const jpegBuffer = await page.evaluate(() => {
        //    const video = document.querySelector('video');
        //    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        //        throw new Error('Video element not ready or no video stream available');
        //    }
        //    const canvas = document.createElement('canvas');
        //    canvas.width = video.videoWidth;
        //    canvas.height = video.videoHeight;
        //    canvas.getContext('2d').drawImage(video, 0, 0);
        //    return canvas.toDataURL('image/jpeg');
        //});
        await page.waitForFunction(() => {
        const video = document.querySelector('video');
        return video && video.videoWidth > 0 && video.videoHeight > 0;
        }, { timeout: 30000 });

        const jpegBuffer = await page.evaluate(() => {
        const video = document.querySelector('video');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg');
        });

        const data = jpegBuffer.replace(/^data:image\/jpeg;base64,/, "");
        const imgBuffer = Buffer.from(data, 'base64');

        res.contentType('image/jpeg');
        res.send(imgBuffer);

    } catch (error) {
        console.error('Snapshot error:', error);
        res.status(500).send(`Snapshot error: ${error}`);
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Snapshot server running on port ${port}`);
