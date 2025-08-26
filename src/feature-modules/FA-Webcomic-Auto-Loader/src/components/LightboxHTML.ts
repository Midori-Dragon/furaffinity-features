export class LightboxHTML {
    static get html(): string {
        return `
<div class="viewer-container viewer-backdrop viewer-fixed viewer-fade viewer-in hidden" tabindex="-1" touch-action="none"
    id="viewer0" style="z-index: 999999900;" role="dialog" aria-labelledby="viewerTitle0" aria-modal="true">
    <div class="viewer-canvas" data-viewer-action="hide">
    </div>
</div>`;
    }
}
