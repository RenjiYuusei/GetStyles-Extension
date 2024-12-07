let isPickerActive = false;
let hoveredElement = null;
let highlightOverlay = null;
let stylePanel = null;

const createStylePanel = () => {
	const panel = document.createElement('div');
	panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        max-width: calc(100vw - 40px); 
        background: rgba(28, 28, 28, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 2147483647;
        font-family: system-ui, -apple-system, sans-serif;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 40px);
        pointer-events: all;
    `;

	panel.className = 'getstyles-extension-panel';

	const header = document.createElement('div');
	header.style.cssText = `
        padding: 16px;
        background: linear-gradient(135deg, #363636, #2d2d2d);
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    `;
	header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🎨</span>
            <span style="font-size: 16px; color: #ffffff;">Element Styles</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="control-btn" title="Minimize">_</button>
            <button class="control-btn" title="Close">×</button>
        </div>
    `;

	const toolbar = document.createElement('div');
	toolbar.style.cssText = `
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        flex-shrink: 0;
    `;

	const formatSelect = document.createElement('select');
	formatSelect.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
    `;
	['CSS', 'SCSS', 'Less', 'JSON'].forEach(format => {
		const option = document.createElement('option');
		option.value = format.toLowerCase();
		option.textContent = format;
		formatSelect.appendChild(option);
	});
	toolbar.appendChild(formatSelect);

	const searchInput = document.createElement('input');
	searchInput.type = 'text';
	searchInput.placeholder = 'Search styles...';
	searchInput.style.cssText = `
        flex: 1;
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: white;
        min-width: 150px;
    `;
	toolbar.appendChild(searchInput);

	const contentWrapper = document.createElement('div');
	contentWrapper.style.cssText = `
        flex: 1;
        overflow-y: auto;
        min-height: 100px;
        max-height: calc(90vh - 200px);
    `;

	const content = document.createElement('div');
	content.style.cssText = `
        padding: 16px;
        color: #e6e6e6;
        font-family: 'Fira Code', Consolas, monospace;
        font-size: 13px;
        line-height: 1.6;
        overflow-y: auto;
        max-height: calc(90vh - 180px);
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    `;
	contentWrapper.appendChild(content);

	const actions = document.createElement('div');
	actions.style.cssText = `
        padding: 12px 16px;
        background: rgba(28, 28, 28, 0.95);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-radius: 0 0 12px 12px;
        flex-shrink: 0;
    `;

	const createActionButton = (icon, text, primary = false) => {
		const button = document.createElement('button');
		button.className = 'action-btn';
		button.innerHTML = `${icon} ${text}`;
		button.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: ${primary ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'};
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        `;
		return button;
	};

	const copyButton = createActionButton(
		`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    `,
		'Copy',
		true
	);

	const downloadButton = createActionButton(
		`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    `,
		'Download'
	);

	actions.append(downloadButton, copyButton);

	const style = document.createElement('style');
	style.textContent = `
        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 4px;
            opacity: 0.7;
            transition: all 0.2s;
        }
        .control-btn:hover {
            opacity: 1;
        }
        .action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .code-property { color: #9cdcfe; }
        .code-value { color: #ce9178; }
        .code-line {
            display: block;
            padding: 4px 0;
            transition: background 0.2s;
        }
        .code-line:hover {
            background: rgba(255, 255, 255, 0.05);
        }
       
        *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        *::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
        }
        *::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }
        *::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    `;
	document.head.appendChild(style);

	const pickAgainButton = document.createElement('button');
	pickAgainButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #4CAF50;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
    `;
	pickAgainButton.textContent = '🎯 Pick Again';
	pickAgainButton.onclick = () => {
		panel.style.display = 'none';
		isPickerActive = true;
		initializePicker();
		showNotification('🎯 Element picker activated!', 'info');
	};
	toolbar.appendChild(pickAgainButton);

	panel.append(header, toolbar, contentWrapper, actions);
	document.body.appendChild(panel);

	let isMinimized = false;
	header.querySelector('[title="Minimize"]').onclick = () => {
		isMinimized = !isMinimized;
		contentWrapper.style.display = isMinimized ? 'none' : 'block';
		actions.style.display = isMinimized ? 'none' : 'flex';
		panel.style.height = isMinimized ? 'auto' : '';
	};

	header.querySelector('[title="Close"]').onclick = () => {
		panel.style.display = 'none';
		deactivatePicker();
	};

	const formatStyles = (styles, format) => {
		switch (format) {
			case 'scss':
				return Object.entries(styles)
					.map(([prop, value]) => `$${prop}: ${value};`)
					.join('\n');
			case 'less':
				return Object.entries(styles)
					.map(([prop, value]) => `@${prop}: ${value};`)
					.join('\n');
			case 'json':
				return JSON.stringify(styles, null, 2);
			default:
				return Object.entries(styles)
					.map(([prop, value]) => `${prop}: ${value};`)
					.join('\n');
		}
	};

	copyButton.onclick = async () => {
		const format = formatSelect.value;
		const styles = getComputedStylesFromContent(content);
		const formattedStyles = formatStyles(styles, format);
		await copyToClipboard(formattedStyles);
	};

	downloadButton.onclick = () => {
		const format = formatSelect.value;
		const styles = getComputedStylesFromContent(content);
		const formattedStyles = formatStyles(styles, format);

		const blob = new Blob([formattedStyles], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `styles.${format}`;
		a.click();
		URL.revokeObjectURL(url);
	};

	searchInput.oninput = e => {
		const searchTerm = e.target.value.toLowerCase();
		const codeLines = content.querySelectorAll('.code-line');
		codeLines.forEach(line => {
			line.style.display = line.textContent.toLowerCase().includes(searchTerm) ? 'block' : 'none';
		});
	};

	return { panel, content };
};

const getComputedStylesFromContent = content => {
	const styles = {};
	content.querySelectorAll('.code-line').forEach(line => {
		const [prop, value] = line.textContent.split(':').map(s => s.trim());
		if (prop && value) {
			styles[prop] = value.replace(';', '');
		}
	});
	return styles;
};

const createHighlightOverlay = () => {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 2147483646;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 3px;
        box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.3);
        mix-blend-mode: multiply;
    `;

	const tooltip = document.createElement('div');
	tooltip.style.cssText = `
        position: fixed;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 999999;
        font-family: 'SF Pro Display', sans-serif;
    `;
	document.body.appendChild(tooltip);

	const guides = {
		horizontal: document.createElement('div'),
		vertical: document.createElement('div'),
	};

	Object.values(guides).forEach(guide => {
		guide.style.cssText = `
            position: fixed;
            background: rgba(76, 175, 80, 0.3);
            pointer-events: none;
            z-index: 999997;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        `;
		document.body.appendChild(guide);
	});

	guides.horizontal.style.height = '1px';
	guides.vertical.style.width = '1px';

	return { overlay, tooltip, guides };
};

const handleElementHover = e => {
	if (!isPickerActive) return;

	requestAnimationFrame(() => {
		hoveredElement = e.target;
		const rect = hoveredElement.getBoundingClientRect();
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;

		const overlay = highlightOverlay.overlay;
		overlay.style.transform = 'scale(1)';
		overlay.style.transition = 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
		overlay.style.top = `${rect.top + scrollY}px`;
		overlay.style.left = `${rect.left + scrollX}px`;
		overlay.style.width = `${rect.width}px`;
		overlay.style.height = `${rect.height}px`;
		overlay.style.display = 'block';

		if (settings.showDimensions) {
			const tooltip = highlightOverlay.tooltip;
			const tagName = hoveredElement.tagName.toLowerCase();
			const className = hoveredElement.classList && hoveredElement.classList.length > 0 ? `.${hoveredElement.classList[0]}` : '';
			const elementInfo = `<${tagName}${className}> ${Math.round(rect.width)}×${Math.round(rect.height)}`;

			tooltip.innerHTML = elementInfo;
			tooltip.style.top = `${rect.top + scrollY - 25}px`;
			tooltip.style.left = `${rect.left + scrollX}px`;
			tooltip.style.display = 'block';
		}

		if (settings.showGuides) {
			const { guides } = highlightOverlay;
			guides.horizontal.style.top = `${rect.top + scrollY + rect.height / 2}px`;
			guides.horizontal.style.width = '100%';
			guides.horizontal.style.display = 'block';

			guides.vertical.style.left = `${rect.left + scrollX + rect.width / 2}px`;
			guides.vertical.style.height = '100vh';
			guides.vertical.style.display = 'block';
		}
	});
};

const initializePicker = () => {
	if (!highlightOverlay) {
		highlightOverlay = createHighlightOverlay();
		document.body.appendChild(highlightOverlay.overlay);
	}

	if (!stylePanel) {
		const panel = createStylePanel();
		stylePanel = panel.panel;
		stylePanel.content = panel.content;
	}

	document.addEventListener('mousemove', handleElementHover);
	document.addEventListener('keydown', handleKeyPress);

	showNotification('🎯 Press ESC to cancel selection', 'info');
	document.body.style.cursor = 'crosshair';

	const style = document.createElement('style');
	style.textContent = `
        *:hover {
            outline: 1px dashed rgba(76, 175, 80, 0.3) !important;
        }
    `;
	document.head.appendChild(style);
	highlightOverlay.styleElement = style;
};

const handleKeyPress = e => {
	if (!isPickerActive) return;

	if (e.key === 'Escape') {
		deactivatePicker();
		showNotification('Selection cancelled', 'info');
	}
};

const deactivatePicker = (hidePanel = true) => {
	isPickerActive = false;
	document.body.style.cursor = 'default';
	document.removeEventListener('mousemove', handleElementHover);
	document.removeEventListener('keydown', handleKeyPress);

	if (highlightOverlay) {
		highlightOverlay.overlay.style.display = 'none';
		highlightOverlay.tooltip.style.display = 'none';
		highlightOverlay.guides.horizontal.style.display = 'none';
		highlightOverlay.guides.vertical.style.display = 'none';
		highlightOverlay.styleElement?.remove();
	}

	if (hidePanel && stylePanel) {
		stylePanel.style.display = 'none';
	}
};

document.addEventListener('click', async e => {
	if (!isPickerActive) return;

	e.preventDefault();
	e.stopPropagation();

	const styles = getElementStyles(e.target);
	const formattedCSS = formatCSSProperties(styles);

	stylePanel.content.innerHTML = formattedCSS;
	stylePanel.style.display = 'block';

	deactivatePicker(false);
	showNotification('✨ Element styles captured!', 'success');
});

const createNotification = (type = 'success') => {
	const notification = document.createElement('div');
	notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2147483647;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
    `;

	setTimeout(() => {
		notification.style.opacity = '1';
	}, 100);

	return notification;
};

const copyToClipboard = async text => {
	try {
		await navigator.clipboard.writeText(text);
		showNotification('✨ Styles copied to clipboard!');
	} catch (err) {
		showNotification('❌ Failed to copy styles!', 'error');
		console.error('Copy error:', err);
	}
};

const showNotification = (message, type = 'success') => {
	if (!message) return;

	try {
		const notification = createNotification(type);
		notification.textContent = message;
		document.body.appendChild(notification);

		const removeNotification = () => {
			notification.style.opacity = '0';
			notification.style.transform = 'translateY(20px)';
			setTimeout(() => {
				if (notification.parentNode) {
					notification.remove();
				}
			}, 300);
		};

		setTimeout(removeNotification, 2000);
	} catch (error) {
		console.error('Error showing notification:', error);
	}
};

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

const getElementStyles = element => {
	if (!element) return {};

	try {
		const styles = window.getComputedStyle(element);
		const importantStyles = {
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

			backgroundColor: styles.backgroundColor,
			color: styles.color,
			border: styles.border,
			borderRadius: styles.borderRadius,
			boxShadow: styles.boxShadow,
			opacity: styles.opacity,

			fontSize: styles.fontSize,
			fontFamily: styles.fontFamily,
			fontWeight: styles.fontWeight,
			lineHeight: styles.lineHeight,
			textAlign: styles.textAlign,
			letterSpacing: styles.letterSpacing,

			flexDirection: styles.flexDirection,
			justifyContent: styles.justifyContent,
			alignItems: styles.alignItems,
			flexWrap: styles.flexWrap,
			gap: styles.gap,

			gridTemplateColumns: styles.gridTemplateColumns,
			gridTemplateRows: styles.gridTemplateRows,
			gridGap: styles.gridGap,

			transform: styles.transform,
			transition: styles.transition,
			animation: styles.animation,

			cursor: styles.cursor,
			zIndex: styles.zIndex,
			overflow: styles.overflow,
			visibility: styles.visibility,
		};

		return Object.fromEntries(Object.entries(importantStyles).filter(([_, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)'));
	} catch (error) {
		console.error('Error getting computed styles:', error);
		return {};
	}
};

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

const filterStyles = (styles, filter) => {
	const categories = {
		layout: ['width', 'height', 'padding', 'margin', 'display', 'position'],
		typography: ['font', 'text', 'line-height', 'letter-spacing'],
		visual: ['color', 'background', 'border', 'box-shadow', 'opacity'],
	};

	if (filter === 'all') return styles;

	return Object.fromEntries(Object.entries(styles).filter(([key]) => categories[filter].some(cat => key.toLowerCase().includes(cat))));
};

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

let settings = { showDimensions: true, showGuides: true };
chrome.storage.sync.get(['settings'], result => {
	settings = result.settings || settings;
});

const getSafeClassName = element => {
	if (!element) return '';
	if (element.classList && element.classList.length > 0) {
		return element.classList[0];
	}
	if (typeof element.className === 'string') {
		return element.className.split(' ')[0];
	}
	return '';
};
