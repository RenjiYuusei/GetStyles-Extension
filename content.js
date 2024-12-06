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
        width: 400px;
        background: rgba(28, 28, 28, 0.98);
        backdrop-filter: blur(12px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 999999;
        font-family: 'SF Pro Display', 'Inter', sans-serif;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

	// Modern header with gradient
	const header = document.createElement('div');
	header.style.cssText = `
        padding: 18px;
        background: linear-gradient(135deg, #363636, #2d2d2d);
        color: #ffffff;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;
	header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🎨</span>
            <span style="font-size: 16px;">Element Styles</span>
        </div>
        <div style="display: flex; gap: 12px;">
            <button class="action-btn" title="Minimize" style="font-size: 18px;">_</button>
            <button class="action-btn" title="Close" style="font-size: 18px;">×</button>
        </div>
    `;

	// Add styles for header buttons
	const style = document.createElement('style');
	style.textContent = `
        .action-btn {
            background: none;
            border: none;
            color: #ffffff;
            cursor: pointer;
            opacity: 0.8;
            transition: all 0.2s;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .action-btn:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
        }
        .code-property { color: #9cdcfe; }
        .code-value { color: #ce9178; }
        .code-line {
            display: block;
            padding: 2px 0;
            transition: background-color 0.2s;
        }
        .code-line:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
    `;
	document.head.appendChild(style);

	// Enhanced content area with syntax highlighting
	const content = document.createElement('div');
	content.style.cssText = `
        padding: 18px;
        max-height: 600px;
        overflow-y: auto;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #e6e6e6;
        background: rgba(45, 45, 45, 0.95);
    `;

	// Modern action buttons with hover effects
	const actions = document.createElement('div');
	actions.style.cssText = `
        padding: 15px;
        background: linear-gradient(135deg, #2d2d2d, #363636);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    `;

	// Multiple action buttons
	const createActionButton = (text, icon, primary = false) => {
		const button = document.createElement('button');
		button.innerHTML = `${icon} ${text}`;
		button.style.cssText = `
            padding: 10px 18px;
            background: ${primary ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'rgba(255, 255, 255, 0.1)'};
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(5px);
        `;

		button.onmouseover = () => {
			button.style.transform = 'translateY(-1px)';
			button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
		};
		button.onmouseout = () => {
			button.style.transform = 'translateY(0)';
			button.style.boxShadow = 'none';
		};

		return button;
	};

	const copyButton = createActionButton('Copy Styles', '📋', true);
	const resetButton = createActionButton('Reset', '🔄');

	actions.append(resetButton, copyButton);
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
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 4px;
        box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
        backdrop-filter: blur(2px);
        animation: pulse 2s infinite;
    `;

	// add pulse effect
	const style = document.createElement('style');
	style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
    `;
	document.head.appendChild(style);

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

// Format CSS properties with syntax highlighting
const formatCSSProperties = styles => {
	return Object.entries(styles)
		.sort(([a], [b]) => a.localeCompare(b))
		.filter(([key, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto')
		.map(
			([key, value]) => `
            <span class="code-line">
                <span class="code-property">${key}</span>: 
                <span class="code-value">${value}</span>;
            </span>
        `
		)
		.join('');
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

	stylePanel.content.innerHTML = formattedCSS;
	stylePanel.style.display = 'block';

	deactivatePicker();
});

// add filter styles
const filterStyles = (styles, filter) => {
	const categories = {
		layout: ['width', 'height', 'padding', 'margin', 'display', 'position'],
		typography: ['font', 'text', 'line-height', 'letter-spacing'],
		visual: ['color', 'background', 'border', 'box-shadow', 'opacity'],
	};

	if (filter === 'all') return styles;

	return Object.fromEntries(Object.entries(styles).filter(([key]) => categories[filter].some(cat => key.toLowerCase().includes(cat))));
};

// add search bar
const addSearchBar = panel => {
	const searchBar = document.createElement('input');
	searchBar.type = 'text';
	searchBar.placeholder = 'Find styles...';
	searchBar.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: white;
        margin: 8px 0;
    `;

	return searchBar;
};

const exportStyles = styles => {
	const formats = {
		css: () =>
			Object.entries(styles)
				.map(([prop, value]) => `${prop}: ${value};`)
				.join('\n'),

		scss: () =>
			Object.entries(styles)
				.map(([prop, value]) => `$${prop}: ${value};`)
				.join('\n'),

		json: () => JSON.stringify(styles, null, 2),
	};

	return formats;
};

// add export buttons
const addExportButtons = (panel, styles) => {
	const exportFormats = ['CSS', 'SCSS', 'JSON'];
	const exportContainer = document.createElement('div');
	exportContainer.style.cssText = `
        padding: 12px;
        display: flex;
        gap: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    `;

	exportFormats.forEach(format => {
		const button = document.createElement('button');
		button.textContent = `Export ${format}`;
		button.onclick = () => {
			const formatter = exportStyles(styles)[format.toLowerCase()];
			copyToClipboard(formatter());
			showNotification(`Copied ${format} format!`);
		};
		exportContainer.appendChild(button);
	});

	return exportContainer;
};
