export function hideUpToParent(child: Element, parent: Element, ...ignoreElements: (Element | null | undefined)[]): void {
    let current = child;

    while (current != null && current !== parent) {
        let parentElement = current.parentElement;
        
        if (!parentElement) {
            break; // Stop if there's no parent
        }

        // Remove all children of the parent except the current element and ignored elements
        Array.from(parentElement.children).forEach(childNode => {
            if (childNode !== current && !ignoreElements.includes(childNode)) {
                // childNode.remove();
                (childNode as HTMLElement).style.display = 'none';
            }
        });

        // Move up the tree
        current = parentElement;
    }
}
