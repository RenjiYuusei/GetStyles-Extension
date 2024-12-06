let isPickerActive = false;
let hoveredElement = null;
let highlightOverlay = null;

// Tạo overlay để highlight element
const createHighlightOverlay = () => {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
        transition: all 0.2s ease;
    `;
	return overlay;
};

// Tạo element thông báo
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

// Hàm copy vào clipboard với định dạng đẹp
const copyToClipboard = async text => {
	try {
		await navigator.clipboard.writeText(text);
		showNotification('Đã copy styles vào clipboard!');
	} catch (err) {
		showNotification('Không thể copy styles!', 'error');
		console.error('Lỗi copy:', err);
	}
};

// Hiển thị thông báo
const showNotification = (message, type = 'success') => {
	const notification = createNotification(type);
	notification.textContent = message;
	document.body.appendChild(notification);

	// Animation hiển thị
	setTimeout(() => {
		notification.style.opacity = '0';
		notification.style.transform = 'translateY(20px)';
		setTimeout(() => notification.remove(), 300);
	}, 2000);
};

// Format CSS properties thành chuỗi đẹp
const formatCSSProperties = styles => {
	const cssString = Object.entries(styles)
		.filter(([key, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto')
		.map(([key, value]) => `    ${key}: ${value};`)
		.join('\n');

	return `{\n${cssString}\n}`;
};

// Lấy tất cả styles quan trọng của element
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

		// Visual
		backgroundColor: styles.backgroundColor,
		color: styles.color,
		border: styles.border,
		borderRadius: styles.borderRadius,

		// Typography
		fontSize: styles.fontSize,
		fontFamily: styles.fontFamily,
		fontWeight: styles.fontWeight,
		lineHeight: styles.lineHeight,
		textAlign: styles.textAlign,
		letterSpacing: styles.letterSpacing,

		// Flexbox
		flexDirection: styles.flexDirection,
		justifyContent: styles.justifyContent,
		alignItems: styles.alignItems,
		flexWrap: styles.flexWrap,
		gap: styles.gap,

		// Grid
		gridTemplateColumns: styles.gridTemplateColumns,
		gridTemplateRows: styles.gridTemplateRows,
		gridGap: styles.gridGap,

		// Transform & Animation
		transform: styles.transform,
		transition: styles.transition,
		animation: styles.animation,

		// Other
		cursor: styles.cursor,
		zIndex: styles.zIndex,
		overflow: styles.overflow,
		visibility: styles.visibility,
	};

	// Lọc bỏ các giá trị mặc định
	return Object.fromEntries(Object.entries(importantStyles).filter(([_, value]) => value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)'));
};

// Xử lý hover element
const handleElementHover = e => {
	if (!isPickerActive) return;

	hoveredElement = e.target;

	// Cập nhật vị trí overlay
	const rect = hoveredElement.getBoundingClientRect();
	highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
	highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
	highlightOverlay.style.width = `${rect.width}px`;
	highlightOverlay.style.height = `${rect.height}px`;
	highlightOverlay.style.display = 'block';
};

// Khởi tạo picker
const initializePicker = () => {
	if (!highlightOverlay) {
		highlightOverlay = createHighlightOverlay();
		document.body.appendChild(highlightOverlay);
	}

	document.addEventListener('mousemove', handleElementHover);
	showNotification('Click vào element để copy styles', 'info');
};

// Hủy picker
const deactivatePicker = () => {
	document.removeEventListener('mousemove', handleElementHover);
	if (highlightOverlay) {
		highlightOverlay.style.display = 'none';
	}
};

// Lắng nghe message từ background script
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

// Xử lý click vào element
document.addEventListener('click', async e => {
	if (!isPickerActive) return;

	e.preventDefault();
	e.stopPropagation();

	const styles = getElementStyles(e.target);
	const formattedCSS = formatCSSProperties(styles);
	await copyToClipboard(formattedCSS);

	isPickerActive = false;
	document.body.style.cursor = 'default';
	deactivatePicker();
});
