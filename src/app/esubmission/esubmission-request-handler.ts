import * as url from 'url';
// import { execFile } from 'child_process';
// import * as fs from 'fs';
import { ElectronService } from '../providers/electron.service';

export class EsubmissionRequestHandler {
	private extensionPath: string = "d:\\Users\\mid\\Documents\\Visual Studio 2015\\Projects\\eSubmissionExtension\\eSubmissionExtension\\bin\\Debug\\";
	private extensionProgram: string = "eSubmissionExtension.exe";

	public handleWillNavigate(e, electronService:ElectronService) {
		let willNavigateUrl = url.parse(e.url);

		if (willNavigateUrl.pathname == '/Apis/document/create') {
			let session: Electron.Session = e.target.getWebContents().session;
			session.cookies.get({ url: willNavigateUrl.protocol + '//' + willNavigateUrl.hostname }, (error, cookies) => {
				let extensionConfig = { userAgent: '', cookies: {} };
				extensionConfig.userAgent = e.target.getUserAgent();
				for (var i = 0; i < cookies.length; i++) {
					let info = cookies[i];
					extensionConfig.cookies[info.name] = info.value;
				}
				console.log(extensionConfig);

				electronService.fs.writeFile(this.extensionPath + "extension-config.json", JSON.stringify(extensionConfig), (err) => {
					if (err) return console.log(err);

					electronService.childProcess.execFile(
						this.extensionPath + this.extensionProgram,
						[
							'document',
							'create'
						],
						{
							cwd: this.extensionPath
						},
						(error, stdout, stderr) => {
							if (error) return console.log(error);

							console.log(stdout);
							console.log(stderr);
						}
					);
				});
			})
			// this.electronService.ipcRenderer.send('portal-create-document-request');
			e.preventDefault();
		}
	}
}
