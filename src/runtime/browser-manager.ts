import { chromium, type Browser, type BrowserContextOptions } from "playwright";

const DEFAULT_CONTEXT_OPTIONS: BrowserContextOptions = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
};

export class BrowserManager {
  private browser: Browser | null = null;

  constructor(private readonly headless: boolean) {}

  async runIsolated<T>(fn: (context: Awaited<ReturnType<Browser["newContext"]>>) => Promise<T>): Promise<T> {
    const browser = await this.ensureBrowser();
    const context = await browser.newContext(DEFAULT_CONTEXT_OPTIONS);

    try {
      return await fn(context);
    } finally {
      await context.close().catch(() => {});
    }
  }

  async health(): Promise<"ready" | "disconnected"> {
    if (!this.browser) {
      return "ready";
    }

    return this.browser.isConnected() ? "ready" : "disconnected";
  }

  async shutdown(): Promise<void> {
    if (this.browser?.isConnected()) {
      await this.browser.close();
    }

    this.browser = null;
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) {
      return this.browser;
    }

    this.browser = await chromium.launch({
      headless: this.headless,
      args: ["--disable-blink-features=AutomationControlled"],
    });

    return this.browser;
  }
}
