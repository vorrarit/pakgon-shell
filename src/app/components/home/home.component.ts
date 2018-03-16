import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import * as TabGroup from 'electron-tabs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	private tabGroup: TabGroup;
	public model: {
		currentAddress: string
	};
	private activeTab: any;


	constructor(private cdRef: ChangeDetectorRef) { }

	get isLoading(): boolean {
		if (this.activeTab)
			if (this.activeTab.webview.isLoading)	
				return this.activeTab.webview.isLoading();

		return false;	
	}

	get canGoBack(): boolean {
		if (this.activeTab && this.activeTab.webview.canGoBack) {
			return this.activeTab.webview.canGoBack();
		}

		return false;
	}

	get canGoForward(): boolean {
		if (this.activeTab)
			if (this.activeTab.webview.canGoForward)	
				return this.activeTab.webview.canGoForward();

		return false;	
	}

	ngOnInit() {
		this.model = { currentAddress: '' };

		this.tabGroup = new TabGroup();
		this.tabGroup.on("tab-active", (tab, tabGroup) => {
			this.activeTab = tab;
			this.model.currentAddress = this.activeTab.webview.src;
		});
		this.tabGroup.on("tab-added", (tab, tabGroup) => {
			tab.webview.addEventListener('page-title-updated', (e) => {
				tab.setTitle(e.title);
			});
			tab.webview.addEventListener('update-target-url', (url) => {
				if (tab == this.activeTab) {
					this.model.currentAddress = tab.webview.src;
				}
			});
			tab.webview.addEventListener('did-start-loading', (e) => {
				console.log('did start loading', e);
			});
			tab.webview.addEventListener('did-stop-loading', (e) => {
				console.log('did stop loading', e);
			});
			tab.webview.addEventListener('will-navigate', (url) => {
				console.log('will navigate', url);
			});
			tab.webview.addEventListener('did-navigate', e => {
				console.log('did navigate', e.url);
			});
			tab.webview.addEventListener('did-navigate-in-page', e => {
				console.log('did navigate in page', e.url);
			});
			tab.webview.addEventListener('did-finish-load', e => {
				console.log('did finish load', e);
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

	// ngAfterViewChecked() {
	// 	this.cdRef.detectChanges();
	// }

	newTab() {
		this.tabGroup.addTab({
			title: '',
			src: 'about:blank',
			visible: true,
			active: true
		});
	}

	toggleDevTools() {
		let webview = this.tabGroup.getActiveTab().webview;
		webview.isDevToolsOpened() ? webview.closeDevTools() : webview.openDevTools({ mode: 'right' });
	}

	onSubmit() {
		this.tabGroup.getActiveTab().webview.loadURL(this.model.currentAddress);
	}

	reload() {
		console.log('reload');
		this.tabGroup.getActiveTab().webview.reload();
	}

	back() {
		console.log('back');
		let webview = this.tabGroup.getActiveTab().webview;
		if (webview.canGoBack()) {
			webview.goBack();
		}
	}

	forward() {
		console.log('forward');
		let webview = this.tabGroup.getActiveTab().webview;
		if (webview.canGoForward()) {
			webview.goForward();
		}
	}

}
