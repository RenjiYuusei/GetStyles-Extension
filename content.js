let isPickerActive = false;
let hoveredElement = null;
let highlightOverlay = null;
let stylePanel = null;

// Create a modern style panel with enhanced UI
const createStylePanel = () => {
	const panel = document.createElement('div');
	panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: #2d2d2d;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: 'Segoe UI', Arial, sans-serif;
        display: none;
        overflow: hidden;
        color: #ffffff;
        border: 1px solid #404040;
    `;

	// Enhanced panel header with modern design
	const header = document.createElement('div');
	header.style.cssText = `
        padding: 15px;
        background: #363636;
        color: #ffffff;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #404040;
    `;
	header.innerHTML = `
        <span style="font-size: 16px;">🎨 Element Styles</span>
        <button style="
            background: none;
            border: none;
            color: #ffffff;
            cursor: pointer;
            font-size: 20px;
            padding: 0 5px;
            opacity: 0.8;
            transition: opacity 0.2s;
        ">×</button>
    `;

	// Improved content area with syntax highlighting-like styling
	const content = document.createElement('div');
	content.style.cssText = `
        padding: 15px;
        max-height: 500px;
        overflow-y: auto;
        font-family: 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #e6e6e6;
        background: #2d2d2d;
    `;

	// Modern action buttons section
	const actions = document.createElement('div');
	actions.style.cssText = `
        padding: 15px;
        background: #363636;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid #404040;
    `;

	// Enhanced copy button with hover effects
	const copyButton = document.createElement('button');
	copyButton.textContent = '📋 Copy Styles';
	copyButton.style.cssText = `
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
    `;

	// Hover effects for the copy button
	copyButton.onmouseover = () => {
		copyButton.style.background = '#45a049';
		copyButton.style.transform = 'translateY(-1px)';
	};
	copyButton.onmouseout = () => {
		copyButton.style.background = '#4CAF50';
		copyButton.style.transform = 'translateY(0)';
	};

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

// Create a smooth highlight overlay for element selection
const createHighlightOverlay = () => {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999998;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
        transition: all 0.2s ease;
        border-radius: 4px;
    `;
	return overlay;
};

// Enhanced notification system with animations
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
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 999999;
        transition: all 0.3s ease;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 14px;
        transform: translateY(100px);
        opacity: 0;
    `;

	// Animate notification entrance
	setTimeout(() => {
		notification.style.transform = 'translateY(0)';
		notification.style.opacity = '1';
	}, 100);

	return notification;
};

// Clipboard functionality with error handling
const copyToClipboard = async text => {
	try {
		await navigator.clipboard.writeText(text);
		showNotification('✨ Styles copied to clipboard!');
	} catch (err) {
		showNotification('❌ Failed to copy styles!', 'error');
		console.error('Copy error:', err);
	}
};

// Enhanced notification display system
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

// Format CSS properties with proper indentation and sorting
const formatCSSProperties = styles => {
	const cssString = Object.entries(styles)
		.sort(([a], [b]) => a.localeCompare(b))
		.filter(([key, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto')
		.map(([key, value]) => `    ${key}: ${value};`)
		.join('\n');

	return `{\n${cssString}\n}`;
};

// Get computed styles with improved filtering
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

	return Object.fromEntries(Object.entries(importantStyles).filter(([_, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)'));
};

// Handle element hover with smooth highlighting
const handleElementHover = e => {
	if (!isPickerActive) return;

	hoveredElement = e.target;

	const rect = hoveredElement.getBoundingClientRect();
	highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
	highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
	highlightOverlay.style.width = `${rect.width}px`;
	highlightOverlay.style.height = `${rect.height}px`;
	highlightOverlay.style.display = 'block';
};

// Initialize the element picker with improved UI feedback
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
	showNotification('🎯 Click on any element to get its styles', 'info');
};

// Deactivate picker with cleanup
const deactivatePicker = () => {
	isPickerActive = false;
	document.body.style.cursor = 'default';
	document.removeEventListener('mousemove', handleElementHover);
	if (highlightOverlay) {
		highlightOverlay.style.display = 'none';
	}
};

// Message listener for extension communication
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

// Handle element selection
document.addEventListener('click', async e => {
	if (!isPickerActive) return;

	e.preventDefault();
	e.stopPropagation();

	const styles = getElementStyles(e.target);
	const formattedCSS = formatCSSProperties(styles);

	stylePanel.content.textContent = formattedCSS;
	stylePanel.style.display = 'block';

	deactivatePicker();
});
