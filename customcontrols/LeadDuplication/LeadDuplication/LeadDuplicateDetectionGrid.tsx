import React from 'react';
import {
    ProgressIndicator,
    Text,
    Stack,
    Separator,
    Overlay,
    DocumentCard,
    DocumentCardTitle,
    mergeStyleSets,
    FocusRectsContext,
} from '@fluentui/react';
import { Grid } from './grid';
import { Footer } from './footer';
import { IInputs } from './generated/ManifestTypes';
import { Entity, logDebug } from './helper';

const _classNames = mergeStyleSets({
    progressBar: {
        itemProgress: { paddingTop: 13, paddingBottom: 12 }
    },
    overlay: {
        backgroundColor: 'rgba(196,196,196,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlayText: {
        height: 'auto',
        textAlign: 'center'
    }
});
export interface ILeadDuplicateDetectionProps {
    accountName: string,
    address1Line1: string,
    address1Line2: string,
    firstName: string,
    lastName: string,
    email: string,
    context: ComponentFramework.Context<IInputs>,
    contactFilter: (email: string, lastName: string, firstName: string, context: ComponentFramework.Context<IInputs>) => Promise<Entity[]>,
    accountFilter: (accountName: string, address1Line1: string, address1Line2: string, context: ComponentFramework.Context<IInputs>) => Promise<Entity[]>,
    relatedTableType: string,
    populateData: (lead: Entity) => void,
}

export const LeadDuplicateDetectionGrid: React.FC<ILeadDuplicateDetectionProps> = (
    {
        accountName,
        address1Line1,
        address1Line2,
        firstName,
        lastName,
        email,
        context,
        accountFilter,
        contactFilter,
        relatedTableType,
        populateData,
    }) => {

    const [isLoading, setIsLoading] = React.useState(false);
    const [initialized, setInitialized] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(0);
    const [maxPage, setMaxPage] = React.useState(0);

    return (
        <Stack>
            <Grid
                firstName={firstName}
                accountName={accountName}
                address1Line1={address1Line1}
                address1Line2={address1Line2}
                lastName={lastName}
                email={email}
                populateData={populateData}
                relatedTableType={relatedTableType}
                accountFilter={accountFilter}
                contactFilter={contactFilter}
                context={context}
                setIsLoading={setIsLoading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setMaxPage={setMaxPage}
                setInitialized={setInitialized}
            />

            <Footer
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                maxPage={maxPage}
                initialized={initialized}
            />
        </Stack>
    );
};
