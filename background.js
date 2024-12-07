chrome.action.onClicked.addListener(tab => {
	chrome.tabs.sendMessage(tab.id, { action: 'togglePicker' });
});

chrome.commands.onCommand.addListener(command => {
	if (command === 'toggle-picker') {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePicker' });
		});
	}
});
