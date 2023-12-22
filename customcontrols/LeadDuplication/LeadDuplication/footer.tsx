import React from 'react';
import {
    DefaultButton,
    IconButton,
    Stack,
    Text,
} from '@fluentui/react';

const _iconStyle = {
    root: {
        '& i': {
            fontSize: 12,
            height: 12,
            lineHeight: 14
        }
    }
};

interface IFooterProps {
    maxPage: number,
    currentPage: number,
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    initialized: boolean,
}

export const Footer: React.FC<IFooterProps> = ({
    currentPage,
    setCurrentPage,
    maxPage,
    initialized,
}) => {

    return (
        <Stack horizontal style={{ width: '100%', paddingLeft: 5, paddingRight: 8, paddingTop: 4, borderTop: '1px solid rgb(237, 235, 233)' }}>
            {initialized &&
                <>
                    <Stack.Item grow align="center" style={{ textAlign: 'center' }}>
                        &nbsp;
                    </Stack.Item>
                    <IconButton
                        alt="First Page"
                        styles={_iconStyle}
                        iconProps={{ iconName: 'Rewind' }}
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(0)}
                    />
                    <IconButton
                        alt="Previous Page"
                        styles={_iconStyle}
                        iconProps={{ iconName: 'Previous' }}
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    <Stack.Item align="center">
                        <Text variant="small">
                            {`Page ${currentPage + 1} of ${maxPage + 1}`}
                        </Text>
                    </Stack.Item>
                    <IconButton
                        alt="Next Page"
                        styles={_iconStyle}
                        iconProps={{ iconName: 'Next' }}
                        disabled={maxPage === currentPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    />
                </>}
        </Stack>
    );
};