export function waitForCondition(condition: () => boolean): Promise<void> {
    return new Promise<void>((resolve) => {
        const check = (): void => {
            if (condition()) {
                resolve();
            } else {
                requestAnimationFrame(check);
            }
        };
        check();
    });
}
