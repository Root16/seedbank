import React, { useState, useEffect } from 'react';
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import ReactDOM from 'react-dom';
import { ILeadDuplicateDetectionProps, LeadDuplicateDetectionGrid } from './LeadDuplicateDetectionGrid';
import { Entity, logDebug } from './helper';
import { log } from 'console';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class LeadDuplication implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _verifiedContactIsUnique: boolean;
    private _verifiedAccountIsUnique: boolean;
    private notifyOutputChanged: () => void;
    private _parentAccountId: ComponentFramework.LookupValue;
    private _parentContactId: ComponentFramework.LookupValue;

    /**
     * Empty constructor.
     */
    constructor() {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._container = container;
        this._context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        this._context
    }

    private getLeftRightSidesOfEmail = (emailAddress: string, numCharsEitherSide: number): [string, string] => {
        const index = emailAddress.indexOf('@');
        const leftOfAtSymbol = emailAddress.substring(0, index);
        const rightOfAtSymbol = emailAddress.substring(index + 1, emailAddress.length);

        const threeToRight = leftOfAtSymbol.slice(-numCharsEitherSide);
        const threeToLeft = rightOfAtSymbol.slice(0, numCharsEitherSide);

        return [threeToRight, threeToLeft];
    }

    private contactFilter = async (emailAddress: string, lastName: string, firstName: string, context: ComponentFramework.Context<IInputs>): Promise<Entity[]> => {
        const numCharsEitherSize = 3;
        // const emailAddress: string = lead["emailaddress1"];
        // const lastName: string = lead["lastname"];
        // const firstName: string = lead["firstname"];

        let query = "?$filter=";

        if (firstName && lastName) {
            query += `(firstname eq '${firstName}' and lastname eq '${lastName}')`;
        }
        else if (firstName) {
            query += `(firstname eq '${firstName}')`;

        } else if (lastName) {
            query += `(lastname eq '${lastName}')`;
        }

        if (emailAddress) {
            const [leadLH, leadRH] = this.getLeftRightSidesOfEmail(emailAddress, numCharsEitherSize);

            query += (firstName || lastName ? " or " : "") + `emailaddress1 eq '${emailAddress}'`;

            if (lastName) {
                query += ` or ( contains(emailaddress1, '${leadLH}@${leadRH}') and lastname eq '${lastName}' )`;
            }
        }

        query = query.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, ' ').replace(" ?", "?");

        logDebug("contact query", query);

        if (query === "?$filter=") {
            return [];
        }

        let contacts = await context.webAPI.retrieveMultipleRecords("contact", query);

        return contacts.entities;
    }

    async accountFilter(accountName: string, address1Line1: string, address1Line2: string, context: ComponentFramework.Context<IInputs>): Promise<Entity[]> {

        let query = "?$filter=";

        if (address1Line1 && address1Line2) {
            query += `(address1_line1 eq '${address1Line1}' and address1_line1 ne null) or 
            ( address1_line2 eq '${address1Line2}' and address1_line2 ne null)`
        }
        else if (address1Line1) {
            query += `(address1_line1 eq '${address1Line1}' and address1_line1 ne null)`
        }
        else if (address1Line2) {
            query += `( address1_line2 eq '${address1Line2}' and address1_line2 ne null)`
        }

        if (accountName) {
            query += (address1Line1 || address1Line2 ? " or " : "") +
                `name eq '${accountName}' 
            or contains(name, '${accountName}')`;
        }

        query = query.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, ' ').replace(" ?", "?");

        logDebug("address query", query);

        if (query === "?$filter=") {
            return [];
        }

        let accounts = await context.webAPI.retrieveMultipleRecords("account", query);

        return accounts.entities;
    }

    private populateData = (entity: Entity) => {
        if (entity["accountid"]) {
            this._parentAccountId = {
                entityType: "account",
                id: entity["accountid"],
                name: entity["name"],
            };
        } else if (entity["contactid"]) {
            this._parentContactId = {
                entityType: "contact",
                id: entity["contactid"],
                name: entity["fullname"],
            };
        }

        this.notifyOutputChanged();
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        if (context.parameters.parentcontactid.raw.length === 1) {
            this._parentContactId = context.parameters.parentcontactid.raw[0];
        }

        if (context.parameters.parentaccountid.raw.length === 1) {
            this._parentAccountId = context.parameters.parentaccountid.raw[0];
        }

        const props: ILeadDuplicateDetectionProps = {
            context: context,
            contactFilter: this.contactFilter,
            accountFilter: this.accountFilter,
            accountName: context.parameters.accountname.raw!,
            address1Line1: context.parameters.address1line1.raw!,
            address1Line2: context.parameters.address1line2.raw!,
            firstName: context.parameters.firstname.raw!,
            lastName: context.parameters.lastname.raw!,
            email: context.parameters.email.raw!,
            relatedTableType: context.parameters.relatedtabletype.raw!,
            populateData: this.populateData,
        };

        ReactDOM.render(React.createElement(LeadDuplicateDetectionGrid, props), this._container);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        var outputs = {
            parentaccountid: this._parentAccountId !== undefined ? [
                this._parentAccountId
            ] : undefined,
            parentcontactid: this._parentContactId !== undefined ? [
                this._parentContactId
            ] : undefined,
        };

        return outputs;
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
