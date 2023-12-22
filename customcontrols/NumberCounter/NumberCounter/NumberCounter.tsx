import React, { useState } from 'react';
import { DefaultButton, PrimaryButton, Stack, Text, getTheme, mergeStyles } from '@fluentui/react';

export interface INumberCounterProps {
	defaultNumber: number,
    updateNumber: (number: number) => void,
	MaxNumber: number,
	MinNumber: number,
}

const theme = getTheme();

const buttonStyles = {
	root: {
		backgroundColor: theme.palette.themePrimary,
		color: theme.palette.white,
		borderRadius: '5px',
	},
};


const NumberControl: React.FC<INumberCounterProps> = ({defaultNumber, updateNumber, MaxNumber, MinNumber}) => {
	const [count, setCount] = useState(defaultNumber);

	const increment = () => {
		const newVal = count + 1;
		if (!(newVal > MaxNumber)) {
			setCount(newVal);
			updateNumber(newVal);
		}
	};

	const decrement = () => {
		const newVal = count - 1;
		if (!(newVal < MinNumber)) {
			setCount(newVal);
			updateNumber(newVal);
		}
	};

	return (
		<Stack horizontal horizontalAlign="center" verticalAlign="center" tokens={{ childrenGap: 20 }}>
			<PrimaryButton iconProps={{ iconName: 'Remove' }} onClick={decrement}
				styles={buttonStyles}
			/>
			<Text variant="xxLarge">{count}</Text>
			<PrimaryButton iconProps={{ iconName: 'Add' }} onClick={increment}
				styles={buttonStyles}
			/>
		</Stack>
	);
};

export default NumberControl;
