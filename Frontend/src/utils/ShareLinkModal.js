const ShareLinkModal = (defaultTitle) => {
	const modalContent = document.createElement('div');

	const titleInput = document.createElement('input');
	titleInput.id = 'titleInput';
	titleInput.className = 'w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-100 dark:focus:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400';
	titleInput.placeholder = defaultTitle;

	modalContent.appendChild(titleInput);

	setTimeout(() => {
		titleInput.focus();
	}, 0);

	const expiryContainer = document.createElement('div');
	expiryContainer.className = 'mt-4 select-none';

	const expiryOptions = [{
			value: '10',
			label: '10 minutes'
		},
		{
			value: '30',
			label: '30 minutes'
		},
		{
			value: '60',
			label: '1 hour'
		},
		{
			value: '1440',
			label: '1 day'
		},
		{
			value: '10080',
			label: '1 week'
		},
	];

	expiryOptions.forEach((option, index) => {
		const expiryWrapper = document.createElement('div');
		expiryWrapper.className = 'flex items-center ps-3 border border-gray-200 rounded-sm has-checked:bg-gray-200 dark:has-checked:bg-gray-700 dark:border-gray-700';

		const radioButton = document.createElement('input');
		radioButton.id = `expiry${option.value}`;
		radioButton.type = 'radio';
		radioButton.value = option.value;
		radioButton.name = 'expiryTime';
		radioButton.className = 'text-blue-600 bg-gray-100 border-gray-300 cursor-pointer dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';
		if (index === 1) radioButton.checked = true;

		const label = document.createElement('label');
		label.setAttribute('for', radioButton.id);
		label.className = 'py-3 ms-2 w-full text-left text-sm font-medium cursor-pointer text-gray-900 dark:text-gray-300';
		label.textContent = option.label;

		expiryWrapper.appendChild(radioButton);
		expiryWrapper.appendChild(label);
		expiryContainer.appendChild(expiryWrapper);
	});

	modalContent.appendChild(expiryContainer);

	return modalContent;
};

export default ShareLinkModal;