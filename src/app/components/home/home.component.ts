import { Component, OnInit } from '@angular/core';
import * as TabGroup from 'electron-tabs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	private tabGroup: TabGroup;
	private activeTab: any;
	public model: {
		currentAddress: string
	};

	constructor() { }

	ngOnInit() {
		this.model = { currentAddress: '' };

		this.tabGroup = new TabGroup();
		this.tabGroup.on("tab-active", (tab, tabGroup) => {
			this.model.currentAddress = tab.webview.src;
		});
		this.tabGroup.on("tab-added", (tab, tabGroup) => {
			tab.webview.addEventListener('page-title-updated', (e) => {
				tab.setTitle(e.title);
			});
			tab.webview.addEventListener('update-target-url', (url) => {
				if (tab == this.tabGroup.getActiveTab()) {
					this.model.currentAddress = tab.webview.src;
				}
			});
			tab.webview.addEventListener('will-navigate', (url) => {
				console.log('will navigate', url);
			});
			tab.webview.addEventListener('new-window', (e) => {
				this.tabGroup.addTab({
					src: e.url,
					visible: true,
					active: true
				});
			});
		});
	
		this.tabGroup.addTab({
			title: 'Google',
			src: 'http://google.com',
		});
		this.tabGroup.addTab({
			title: "Electron",
			src: "http://electron.atom.io",
			visible: true,
			active: true
		});
	}

	onSubmit() {
		this.tabGroup.getActiveTab().webview.loadURL(this.model.currentAddress);
	}

}
