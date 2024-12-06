// Theme switcher
const themeSwitch = document.querySelector('.theme-switch');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
	body.classList.add('dark-theme');
}

// Toggle theme
themeSwitch.addEventListener('click', () => {
	body.classList.toggle('dark-theme');
	localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Start picker button
document.getElementById('startPicker').addEventListener('click', async () => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.id) {
		chrome.tabs.sendMessage(tab.id, { action: 'togglePicker' });
		window.close();
	}
});

// Keyboard shortcut
document.addEventListener('keydown', async e => {
	if (e.altKey && e.key.toLowerCase() === 's') {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tab?.id) {
			chrome.tabs.sendMessage(tab.id, { action: 'togglePicker' });
			window.close();
		}
	}
});
