let isPickerActive = false;

// Create element to display notification
const createNotification = () => {
	const notification = document.createElement('div');
	notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 999999;
        transition: opacity 0.3s;
    `;
	return notification;
};

// Function to copy to clipboard
const copyToClipboard = async text => {
	try {
		await navigator.clipboard.writeText(text);
		const notification = createNotification();
		notification.textContent = 'Đã copy styles vào clipboard!';
		document.body.appendChild(notification);
		setTimeout(() => {
			notification.style.opacity = '0';
			setTimeout(() => notification.remove(), 300);
		}, 2000);
	} catch (err) {
		console.error('Không thể copy:', err);
	}
};

// Function to format CSS properties
const formatCSSProperties = styles => {
	return Object.entries(styles)
		.map(([key, value]) => `${key}: ${value};`)
		.join('\n');
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'togglePicker') {
		isPickerActive = !isPickerActive;
		document.body.style.cursor = isPickerActive ? 'crosshair' : 'default';
	}
});

document.addEventListener('click', async e => {
	if (!isPickerActive) return;

	e.preventDefault();
	e.stopPropagation();

	const element = e.target;
	const styles = window.getComputedStyle(element);

	// Get common and important CSS properties
	const cssProperties = {
		// Layout & Box Model
		width: styles.width,
		height: styles.height,
		padding: styles.padding,
		margin: styles.margin,
		display: styles.display,
		position: styles.position,

		// Visual
		backgroundColor: styles.backgroundColor,
		color: styles.color,
		border: styles.border,
		borderRadius: styles.borderRadius,
		boxShadow: styles.boxShadow,

		// Typography
		fontSize: styles.fontSize,
		fontFamily: styles.fontFamily,
		fontWeight: styles.fontWeight,
		lineHeight: styles.lineHeight,
		textAlign: styles.textAlign,

		// Flexbox (if any)
		flexDirection: styles.flexDirection,
		justifyContent: styles.justifyContent,
		alignItems: styles.alignItems,
		gap: styles.gap,

		// Grid (if any)
		gridTemplateColumns: styles.gridTemplateColumns,
		gridTemplateRows: styles.gridTemplateRows,
		gridGap: styles.gridGap,

		// Transitions & Animations
		transition: styles.transition,
		animation: styles.animation,

		// Misc
		opacity: styles.opacity,
		zIndex: styles.zIndex,
		overflow: styles.overflow,
	};

	const formattedCSS = formatCSSProperties(cssProperties);
	await copyToClipboard(formattedCSS);

	isPickerActive = false;
	document.body.style.cursor = 'default';
});
