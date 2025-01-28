interface Node {
    insertBeforeThis(newNode: Node): void;
    insertAfterThis(newNode: Node): void;
    getIndexOfThis(): number;
    readdToDom(): HTMLElement;
}

Node.prototype.insertBeforeThis = function (newNode: Node): void {
    this.parentNode?.insertBefore(newNode, this);
};

Node.prototype.insertAfterThis = function (newNode: Node): void {
    this.parentNode?.insertBefore(newNode, this.nextSibling);
};

Node.prototype.getIndexOfThis = function (): number {
    if (this.parentNode == null) {
        return -1;
    }
    const childrenArray = Array.from(this.parentNode.children);
    return childrenArray.indexOf(this as HTMLElement);
};

Node.prototype.readdToDom = function (): HTMLElement {
    const clone = this.cloneNode(false) as HTMLElement;
    this.parentNode?.replaceChild(clone, this);
    return clone;
};
