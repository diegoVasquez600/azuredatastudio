/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { MigrationWizardPage } from '../models/migrationWizardPage';
import { MigrationStateModel, StateChangeEvent } from '../models/stateMachine';
import * as constants from '../models/strings';

export class AccountsSelectionPage extends MigrationWizardPage {
	private _azureAccountsDropdown!: azdata.DropDownComponent;
	//private azureAccount!: azdata.Account;
	private _accountsMap!: Map<string, azdata.Account>;
	//private disposables: Disposable[] = [];

	// For future reference: DO NOT EXPOSE WIZARD DIRECTLY THROUGH HERE.
	constructor(wizard: azdata.window.Wizard, migrationStateModel: MigrationStateModel) {
		super(wizard, azdata.window.createWizardPage(constants.ACCOUNTS_SELECTION_PAGE_TITLE), migrationStateModel);
		this._accountsMap = new Map();
	}

	protected async registerContent(view: azdata.ModelView): Promise<void> {
		const form = view.modelBuilder.formContainer().withFormItems(
			[
				await this.createAzureAccountsDropdown(view)
			]
		);
		await view.initializeModel(form.component());
		await this.populateAzureAccountsDropdown();
		return;
	}


	private async createAzureAccountsDropdown(view: azdata.ModelView): Promise<azdata.FormComponent> {

		this._azureAccountsDropdown = view.modelBuilder.dropDown().withProperties({}).component();

		this._azureAccountsDropdown.onValueChanged(async (value) => {
			//this.azureAccount = this._accountsMap.get(value.selected)!;
		});

		const signInButton = view.modelBuilder.button().withProperties<azdata.ButtonProperties>({
			label: constants.ACCOUNT_ADD_BUTTON_LABEL,
			width: '100px'
		}).component();

		signInButton.onDidClick(async (event) => {
			await vscode.commands.executeCommand('workbench.actions.modal.linkedAccount');
			await this.populateAzureAccountsDropdown();
		});

		const flexContainer = view.modelBuilder.flexContainer().withLayout({
			flexFlow: 'column'
		}).withItems([this._azureAccountsDropdown, signInButton], { CSSStyles: { 'margin-right': '5px', } }).component();

		return {
			title: '',
			component: flexContainer
		};
	}

	private async populateAzureAccountsDropdown() {
		this._azureAccountsDropdown.loading = true;
		let accounts = await azdata.accounts.getAllAccounts();

		if (accounts.length === 0) {
			this._azureAccountsDropdown.value = constants.ACCOUNT_SELECTION_PAGE_NO_LINKED_ACCOUNTS_ERROR;
			return;
		}

		this._azureAccountsDropdown.values = accounts.map((account): azdata.CategoryValue => {
			let accountCategoryValue = {
				displayName: account.displayInfo.displayName,
				name: account.displayInfo.displayName
			};
			this._accountsMap.set(accountCategoryValue.displayName, account);
			return accountCategoryValue;
		});

		//this.azureAccount = accounts[0];
		this._azureAccountsDropdown.loading = false;
	}



	public onPageEnter(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public onPageLeave(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	protected handleStateChange(e: StateChangeEvent): Promise<void> {
		throw new Error('Method not implemented.');
	}
}