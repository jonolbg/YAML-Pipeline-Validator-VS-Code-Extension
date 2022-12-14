// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MessageOptions } from 'vscode';
const got = require('got');
const {Base64} = require('js-base64');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "azure-devops-yaml-pipeline-validator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('azure-devops-yaml-pipeline-validator.validate', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Validating Pipeline');

		let editor = vscode.window.activeTextEditor;

		if (editor) {
			let document = editor.document;
			let documentText = document.getText();
			const pat = vscode.workspace.getConfiguration('yamlpipelinesvalidator').get('pat');
			const projectUrl = vscode.workspace.getConfiguration('yamlpipelinesvalidator').get('projecturl');
			const buildDefinitionId = vscode.workspace.getConfiguration('yamlpipelinesvalidator').get('builddefinitionid');
			let settingsRequired = false;
			if(!isEmptyOrNull(pat as string)){
				settingsRequired = isEmptyOrNull(projectUrl as string) || isEmptyOrNull(buildDefinitionId as string);
			}
			if(!isEmptyOrNull(projectUrl as string)){
				settingsRequired = isEmptyOrNull(pat as string) || isEmptyOrNull(buildDefinitionId as string);
			}
			if(!isEmptyOrNull(buildDefinitionId as string)){
				settingsRequired = isEmptyOrNull(pat as string) || isEmptyOrNull(projectUrl as string);
			}
			if(settingsRequired){
				vscode.window.showErrorMessage("One or more configuration settings have not been set");
				return;
			}
			(async () => {
				try {
					// we need to post to Azure API here and create an output buffer.
					// how to auth?
					await got.post(projectUrl + '/_apis/pipelines/' + buildDefinitionId + '/runs?api-version=7.1-preview.1' , { 
						headers: {
							Authorization: 'Basic ' + Base64.encode(':' + pat)
						},
						json: {
							previewRun: true,
							yamlOverride: documentText
						}
					});
					//Do something more exciting that this :D
					vscode.window.showInformationMessage('Valid YAML Pipeline');
				}
				catch (error) {
					let options: MessageOptions = { modal: true};
					vscode.window.showErrorMessage('Invalid YAML Pipeline - ' + error.response.body, options);

				}
			})();

		}

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function isEmptyOrNull(val: string): boolean {
	return val === null || val === "";
}
