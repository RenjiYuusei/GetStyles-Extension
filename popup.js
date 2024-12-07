document.getElementById('startPicker').addEventListener('click', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePicker' });
		window.close();
	});
});

const saveSettings = () => {
	const settings = {
		showDimensions: document.getElementById('showDimensions').checked,
		showGuides: document.getElementById('showGuides').checked,
	};
	chrome.storage.sync.set({ settings });
};

chrome.storage.sync.get(['settings'], result => {
	const settings = result.settings || { showDimensions: true, showGuides: true };
	document.getElementById('showDimensions').checked = settings.showDimensions;
	document.getElementById('showGuides').checked = settings.showGuides;
});

document.getElementById('showDimensions').addEventListener('change', saveSettings);
document.getElementById('showGuides').addEventListener('change', saveSettings);
