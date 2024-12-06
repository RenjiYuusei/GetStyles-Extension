let isPickerActive = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'togglePicker') {
		isPickerActive = !isPickerActive;
		if (isPickerActive) {
			document.body.style.cursor = 'crosshair';
		} else {
			document.body.style.cursor = 'default';
		}
	}
});

document.addEventListener('click', e => {
	if (!isPickerActive) return;

	e.preventDefault();
	const element = e.target;
	const styles = window.getComputedStyle(element);

	// Lấy các thuộc tính CSS phổ biến
	const cssProperties = {
		backgroundColor: styles.backgroundColor,
		color: styles.color,
		fontSize: styles.fontSize,
		padding: styles.padding,
		margin: styles.margin,
		border: styles.border,
	};

	console.log('Styles của element:', cssProperties);
	isPickerActive = false;
	document.body.style.cursor = 'default';
});
