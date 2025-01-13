export function trimEnd(str: string, toTrim: string): string {
    if (toTrim === '' || str === '') {
        return str;
    }

    while (str.endsWith(toTrim)) {
        str = str.slice(0, -toTrim.length);
    }

    return str;
}

export function removeTextNodes(targetElement: HTMLElement): string {
    let removedText = '';

    // Helper function to recursively remove text nodes
    function traverseAndRemoveTextNodes(node: Node): void {
        // Loop through child nodes backwards to avoid index shifting issues
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const child = node.childNodes[i];
            
            // If the child is a text node, remove it and collect its text
            if (child.nodeType === Node.TEXT_NODE) {
                removedText += (child.textContent ?? '') + '\n';
                node.removeChild(child);
            } 
        }
    }

    // Start the recursion from the target element
    traverseAndRemoveTextNodes(targetElement);

    return removedText;
}
