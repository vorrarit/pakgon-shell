import * as fs from 'fs';

export class BrowserConfig {
	private static me: BrowserConfig;
	private config: any = {};
	private configFileName: string = 'browser-config.json';

	public static getInstance(): BrowserConfig {
		if (!this.me) {
			this.me = new BrowserConfig();
		}
		return this.me;
	}

	private constructor() {
		let data = fs.readFileSync(this.configFileName);
		if (!data) {
			fs.writeFileSync(this.configFileName, JSON.stringify(this.config));
		} else {
			this.config = JSON.parse(data.toString());
		}
	}

	public set(key: string, value: any) {
		this.config[key] = value;
		fs.writeFileSync(this.configFileName, JSON.stringify(this.config));
	}

	public get(key: string): any {
		if (this.config[key]) {
			return this.config[key];
		}
		return null;
	}
}