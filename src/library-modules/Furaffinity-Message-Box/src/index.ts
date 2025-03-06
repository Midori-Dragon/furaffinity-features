import { MessageBox } from './modules/MessageBox';
import { MessageBoxIcon } from './components/MessageBoxIcon';
import { MessageBoxButtons } from './components/MessageBoxButtons';
import { DialogResult } from './components/DialogResult';

Object.defineProperties(window, {
    FAMessageBox: { get: () => MessageBox },
    FAMessageBoxButtons: { get: () => MessageBoxButtons },
    FAMessageBoxIcon: { get: () => MessageBoxIcon },
    FAMessageBoxResult: { get: () => DialogResult },
});

let themeClassName = 'dark';
const themeStylesheets = document.head.querySelectorAll('link[rel="stylesheet"][href]') ?? [];
for (const themeStylesheet of Array.from(themeStylesheets)) {
    const themePath = themeStylesheet.getAttribute('href')?.toLowerCase() ?? '';

    if (themePath.includes('dark')) {
        themeClassName = 'dark';
    } else if (themePath.includes('aurora')) {
        themeClassName = 'aurora';
    } else if (themePath.includes('retro')) {
        themeClassName = 'retro';
    } else if (themePath.includes('slate')) {
        themeClassName = 'slate';
    } else if (themePath.includes('light')) {
        themeClassName = 'light';
    }
}

document.body.classList.add(`theme-${themeClassName}`);
