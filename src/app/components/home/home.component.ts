import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import * as TabGroup from 'electron-tabs';
import { ElectronService } from '../../providers/electron.service';
import * as url from 'url';
import { WebContents } from 'electron';
import { EsubmissionRequestHandler } from '../../esubmission/esubmission-request-handler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

	private tabGroup: TabGroup;
	public model: {
		currentAddress: string
	};
	private activeTab: any;
	@ViewChild('currentAddress') currentAddress: ElementRef;


	constructor(private cdRef: ChangeDetectorRef, private renderer: Renderer2, private electronService:ElectronService) { }

	get isLoading(): boolean {
		if (this.activeTab && this.activeTab.webview.isLoading) {
			try {
				return this.activeTab.webview.isLoading();
			} catch (e) { }
			
		}

		return false;	
	}

	get canGoBack(): boolean {
		if (this.activeTab && this.activeTab.webview.canGoBack) {
			try {
				return this.activeTab.webview.canGoBack();
			} catch (e) {}
		}

		return false;
	}

	get canGoForward(): boolean {
		if (this.activeTab && this.activeTab.webview.canGoForward) {
			try {
				return this.activeTab.webview.canGoForward();
			} catch (e) { }
		}

		return false;	
	}

	ngOnInit() {
		// init model
		this.model = { currentAddress: '' };

		// init tabs
		this.tabGroup = new TabGroup();
		this.tabGroup.on("tab-active", (tab, tabGroup) => {
			this.activeTab = tab;
			this.model.currentAddress = this.activeTab.webview.src;
		});
		this.tabGroup.on("tab-added", (tab, tabGroup) => {
			tab.webview.addEventListener('page-title-updated', (e) => {
				tab.setTitle(e.title.substr(0, 6));
			});
			tab.webview.addEventListener('update-target-url', (url) => {
				if (tab == this.activeTab) {
					this.model.currentAddress = tab.webview.src;
				}
			});
			tab.webview.addEventListener('page-favicon-updated', (e) => {
				if (e.favicons && e.favicons.length > 0) {
					tab.setIcon(e.favicons[0]);
				}
			});
			tab.webview.addEventListener('did-start-loading', (e) => {
				console.log('did start loading', e);
				console.log(e.target.src);
			});
			tab.webview.addEventListener('did-stop-loading', (e) => {
				console.log('did stop loading', e);
				this.saveTabs();
			});
			tab.webview.addEventListener('will-navigate', (e) => {
				console.log('will navigate', e);
				let willNavigateUrl = url.parse(e.url);
				if (willNavigateUrl.hostname == 'eadj-uat.pakgon.com') {
					let esubHandler = new EsubmissionRequestHandler();
					esubHandler.handleWillNavigate(e, this.electronService);
				}
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
		this.tabGroup.on('tab-removed', (tab, tabGroup) => {
			this.saveTabs();
		});
	
		this.loadTabs();
	}

	ngAfterViewInit() {
		// init shortcuts
		this.electronService.ipcRenderer.on('browser-address-bar-request', () => {
			this.focusAddressBar();
		});
	}

	// ngAfterViewChecked() {
	// 	this.cdRef.detectChanges();
	// }

	focusAddressBar() {
		this.renderer.selectRootElement('#currentAddress').select();
	}

	newTab() {
		this.tabGroup.addTab({
			title: 'about:blank',
			src: 'about:blank',
			visible: true,
			active: true,
			// webviewAttributes: {
			// 	useragent: 'PortalBrowser/2.5.0'
			// }
		});
	}

	saveTabs() {
		let tabs = this.tabGroup.getTabs();
		let tabsConfig = [];
		for (let i = 0; i < tabs.length; i++) {
			if (this.tabGroup.getTab(i) != null) {
				tabsConfig.push(
					{ tabIndex: i + 1, tabUrl: this.tabGroup.getTab(i).webview.src }
				);
			}
		}
		this.electronService.ipcRenderer.send('browser-save-tabs-request', tabsConfig);
	}

	loadTabs() {
		this.electronService.ipcRenderer.once('browser-load-tabs-response', (event, tabsConfig) => {
			if (this.tabGroup) {
				if (tabsConfig && tabsConfig.length > 0) {
					for (let i = 0; i < tabsConfig.length; i++) {
						this.tabGroup.addTab({
							src: tabsConfig[i].tabUrl,
							visible: true,
							active: true
						});
					}
				} else {
					this.newTab();
				}
			}
		});
		this.electronService.ipcRenderer.send('browser-load-tabs-request');
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
