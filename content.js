let isPickerActive = false;
let hoveredElement = null;
let highlightOverlay = null;
let stylePanel = null;

// Create style panel UI
const createStylePanel = () => {
	const panel = document.createElement('div');
	panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 999999;
        font-family: Arial, sans-serif;
        display: none;
        overflow: hidden;
    `;

	// Panel header
	const header = document.createElement('div');
	header.style.cssText = `
        padding: 12px;
        background: #4CAF50;
        color: white;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
	header.innerHTML = `
        <span>Element Styles</span>
        <button style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
        ">×</button>
    `;

	// Panel content
	const content = document.createElement('div');
	content.style.cssText = `
        padding: 12px;
        max-height: 400px;
        overflow-y: auto;
    `;

	// Panel actions
	const actions = document.createElement('div');
	actions.style.cssText = `
        padding: 12px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    `;

	const copyButton = document.createElement('button');
	copyButton.textContent = 'Copy Styles';
	copyButton.style.cssText = `
        padding: 6px 12px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;
    `;
	copyButton.onmouseover = () => (copyButton.style.background = '#45a049');
	copyButton.onmouseout = () => (copyButton.style.background = '#4CAF50');

	actions.appendChild(copyButton);
	panel.append(header, content, actions);
	document.body.appendChild(panel);

	// Event handlers
	header.querySelector('button').onclick = () => {
		panel.style.display = 'none';
		deactivatePicker();
	};

	copyButton.onclick = async () => {
		const styles = content.textContent;
		await copyToClipboard(styles);
	};

	return { panel, content };
};

// Create highlight overlay for element selection
const createHighlightOverlay = () => {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999998;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
        transition: all 0.2s ease;
    `;
	return overlay;
};

// Create notification element
const createNotification = (type = 'success') => {
	const notification = document.createElement('div');
	const colors = {
		success: '#4CAF50',
		error: '#f44336',
		info: '#2196F3',
	};

	notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 999999;
        transition: all 0.3s ease;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
	return notification;
};

// Copy text to clipboard
const copyToClipboard = async text => {
	try {
		await navigator.clipboard.writeText(text);
		showNotification('Styles copied to clipboard!');
	} catch (err) {
		showNotification('Failed to copy styles!', 'error');
		console.error('Copy error:', err);
	}
};

// Show notification message
const showNotification = (message, type = 'success') => {
	const notification = createNotification(type);
	notification.textContent = message;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.opacity = '0';
		notification.style.transform = 'translateY(20px)';
		setTimeout(() => notification.remove(), 300);
	}, 2000);
};

// Format CSS properties into readable string
const formatCSSProperties = styles => {
	const cssString = Object.entries(styles)
		.filter(([key, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto')
		.map(([key, value]) => `    ${key}: ${value};`)
		.join('\n');

	return `{\n${cssString}\n}`;
};

// Get computed styles of element
const getElementStyles = element => {
	const styles = window.getComputedStyle(element);
	const importantStyles = {
		// Layout & Box Model
		width: styles.width,
		height: styles.height,
		padding: styles.padding,
		margin: styles.margin,
		display: styles.display,
		position: styles.position,
		top: styles.top,
		right: styles.right,
		bottom: styles.bottom,
		left: styles.left,

		// Visual Properties
		backgroundColor: styles.backgroundColor,
		color: styles.color,
		border: styles.border,
		borderRadius: styles.borderRadius,
		boxShadow: styles.boxShadow,
		opacity: styles.opacity,

		// Typography
		fontSize: styles.fontSize,
		fontFamily: styles.fontFamily,
		fontWeight: styles.fontWeight,
		lineHeight: styles.lineHeight,
		textAlign: styles.textAlign,
		letterSpacing: styles.letterSpacing,

		// Flexbox Properties
		flexDirection: styles.flexDirection,
		justifyContent: styles.justifyContent,
		alignItems: styles.alignItems,
		flexWrap: styles.flexWrap,
		gap: styles.gap,

		// Grid Properties
		gridTemplateColumns: styles.gridTemplateColumns,
		gridTemplateRows: styles.gridTemplateRows,
		gridGap: styles.gridGap,

		// Transform & Animation
		transform: styles.transform,
		transition: styles.transition,
		animation: styles.animation,

		// Miscellaneous
		cursor: styles.cursor,
		zIndex: styles.zIndex,
		overflow: styles.overflow,
		visibility: styles.visibility,
	};

	// Filter out default values
	return Object.fromEntries(Object.entries(importantStyles).filter(([_, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)'));
};

// Handle element hover
const handleElementHover = e => {
	if (!isPickerActive) return;

	hoveredElement = e.target;

	// Update overlay position
	const rect = hoveredElement.getBoundingClientRect();
	highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
	highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
	highlightOverlay.style.width = `${rect.width}px`;
	highlightOverlay.style.height = `${rect.height}px`;
	highlightOverlay.style.display = 'block';
};

// Initialize element picker
const initializePicker = () => {
	if (!highlightOverlay) {
		highlightOverlay = createHighlightOverlay();
		document.body.appendChild(highlightOverlay);
	}

	if (!stylePanel) {
		const panel = createStylePanel();
		stylePanel = panel.panel;
		stylePanel.content = panel.content;
	}

	document.addEventListener('mousemove', handleElementHover);
	showNotification('Click on an element to get its styles', 'info');
};

// Deactivate element picker
const deactivatePicker = () => {
	isPickerActive = false;
	document.body.style.cursor = 'default';
	document.removeEventListener('mousemove', handleElementHover);
	if (highlightOverlay) {
		highlightOverlay.style.display = 'none';
	}
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'togglePicker') {
		isPickerActive = !isPickerActive;
		document.body.style.cursor = isPickerActive ? 'crosshair' : 'default';

		if (isPickerActive) {
			initializePicker();
		} else {
			deactivatePicker();
		}
	}
});

// Handle element click
document.addEventListener('click', async e => {
	if (!isPickerActive) return;

	e.preventDefault();
	e.stopPropagation();

	const styles = getElementStyles(e.target);
	const formattedCSS = formatCSSProperties(styles);

	// Update and show style panel
	stylePanel.content.textContent = formattedCSS;
	stylePanel.style.display = 'block';

	deactivatePicker();
});
