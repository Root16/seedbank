import React from 'react';
import {
    ColumnActionsMode,
    DetailsRow,
    getTheme,
    IColumn,
    IDetailsRowProps,
    IDetailsRowStyles,
    IRenderFunction,
    SelectionMode,
    ShimmeredDetailsList,
    Text,
    Stack,
    mergeStyles,
    PrimaryButton,
} from '@fluentui/react';
import { Entity, logDebug } from './helper';
import { IInputs } from './generated/ManifestTypes';

const PAGE_SIZE = 6;

const _theme = getTheme();

const _actionButtonClass = mergeStyles({ padding: '5px !important' });

interface IGridProps {
    accountName: string,
    address1Line1: string,
    address1Line2: string,
    firstName: string,
    lastName: string,
    email: string,
    context: ComponentFramework.Context<IInputs>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    currentPage: number,
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    setMaxPage: React.Dispatch<React.SetStateAction<number>>,
    setInitialized: React.Dispatch<React.SetStateAction<boolean>>,
    contactFilter: (email: string, lastName: string, firstName: string, context: ComponentFramework.Context<IInputs>) => Promise<Entity[]>,
    accountFilter: (accountName: string, address1Line1: string, address1Line2: string, context: ComponentFramework.Context<IInputs>) => Promise<Entity[]>,
    relatedTableType: string,
    populateData: (lead: Entity) => void,
}

export const Grid: React.FC<IGridProps> = ({
    accountName,
    address1Line1,
    address1Line2,
    firstName,
    lastName,
    email,
    context,
    setIsLoading,
    currentPage,
    setCurrentPage,
    setMaxPage,
    setInitialized,
    relatedTableType,
    accountFilter,
    contactFilter,
    populateData,
}) => {
    const [allRows, setAllRows] = React.useState<Entity[]>();
    const [rows, setRows] = React.useState<Entity[]>();

    React.useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            if (relatedTableType === "account") {
                const rows = await accountFilter(accountName, address1Line1, address1Line2, context);

                setAllRows(rows);
                setCurrentPage(0);
                setMaxPage(Math.floor(rows.length / PAGE_SIZE));
                setInitialized(rows.length > 0);
                setIsLoading(false);

            } else if (relatedTableType === "contact") {
                const rows = await contactFilter(email,lastName, firstName, context);

                setAllRows(rows);
                setCurrentPage(0);
                setMaxPage(Math.floor(rows.length / PAGE_SIZE));
                setInitialized(rows.length > 0);
                setIsLoading(false);
            }
        };

        loadData();
    }, [accountName, address1Line2, address1Line1, firstName, lastName, email, relatedTableType, setIsLoading]);

    React.useEffect(() => {
        const pageStart = currentPage * PAGE_SIZE;
        setRows(allRows?.slice(pageStart, pageStart + PAGE_SIZE));
    }, [currentPage, allRows]);

    const viewRecord = async (row: Entity) => {
        if (row.accountid !== undefined) {
            context.navigation.openForm(
                {
                    entityName: "account",
                    entityId: row.accountid,
                    openInNewWindow: true,
                    windowPosition: 1
                }
            );
        }
        else if (row.contactid !== undefined) {
            context.navigation.openForm(
                {
                    entityName: "contact",
                    entityId: row.contactid,
                    openInNewWindow: true,
                    windowPosition: 1
                }
            );
        }
    };

    const columns: IColumn[] = [{
        key: 'viewrecord',
        name: '',
        minWidth: 80,
        maxWidth: 80,
        columnActionsMode: ColumnActionsMode.disabled,
        isResizable: false,
        className: _actionButtonClass,
        onRender: (row: Entity) =>
            <PrimaryButton text="View Record" onClick={() => viewRecord(row)} />
    },
    {
        key: 'usethisrecord',
        name: '',
        minWidth: 100,
        maxWidth: 100,
        columnActionsMode: ColumnActionsMode.disabled,
        isResizable: false,
        className: _actionButtonClass,
        onRender: (row: Entity) =>
            <PrimaryButton text="Use This Record" onClick={() => populateData(row)} />
    }
    ];

    if (relatedTableType === "account") {
        columns.push({
            key: 'name',
            name: 'Account Name',
            fieldName: 'name',
            minWidth: 120,
            maxWidth: 120,
            isResizable: true,
            columnActionsMode: ColumnActionsMode.disabled
        });
        columns.push({
            key: 'address1_composite',
            name: 'Address1',
            fieldName: 'address1_composite',
            minWidth: 50,
            maxWidth: 50,
            isResizable: true,
            columnActionsMode: ColumnActionsMode.disabled
        });

    } else if (relatedTableType === "contact") {
        columns.push({
            key: 'emailaddress1',
            name: 'Email',
            fieldName: 'emailaddress1',
            minWidth: 120,
            maxWidth: 120,
            isResizable: true,
            columnActionsMode: ColumnActionsMode.disabled
        });
        columns.push({
            key: 'fullname',
            name: 'Full Name',
            fieldName: 'fullname',
            minWidth: 50,
            maxWidth: 50,
            isResizable: true,
            columnActionsMode: ColumnActionsMode.disabled
        });
    }

    const renderRow: IRenderFunction<IDetailsRowProps> = (props) => {
        if (!props) {
            return null;
        }
        let customStyles: Partial<IDetailsRowStyles> = {};
        if (props.itemIndex % 2 === 0) {
            // Every other row renders with a different background color
            customStyles.root = { backgroundColor: _theme.palette.themeLighterAlt };
        }
        return <DetailsRow {...props} styles={customStyles} />
    };

    if (allRows && allRows.length === 0) {
        return (
            <Stack>
                <Stack.Item align="center" style={{ padding: 20 }}>
                    <Text variant="xLarge">No results.</Text>
                </Stack.Item>
            </Stack>
        );
    }

    return (
        <ShimmeredDetailsList
            items={rows!}
            columns={columns}
            enableShimmer={!rows}
            shimmerLines={PAGE_SIZE}
            selectionMode={SelectionMode.none}
            onRenderRow={renderRow}
        />
    );
};
