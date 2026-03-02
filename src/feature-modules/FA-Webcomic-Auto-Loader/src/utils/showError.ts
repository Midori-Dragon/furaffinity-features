export async function showError(error: unknown, caption: string): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    await window.FAMessageBox.show(message, caption, window.FAMessageBoxButtons.OK, window.FAMessageBoxIcon.Error);
}
