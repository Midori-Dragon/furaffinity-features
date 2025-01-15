export class EmbeddedHTML {
    static get html(): string {
        return `
<div id="ei-background">
    <a id="ei-submission-container"></a>
    <div id="ei-button-container">
        <div id="ei-button-wrapper">
            <a id="ei-fav-button" type="button" class="ei-button button standard mobile-fix">⠀⠀</a>
            <a id="ei-download-button" type="button" class="ei-button button standard mobile-fix">Download</a>
            <a id="ei-open-button" type="button" class="ei-button button standard mobile-fix">Open</a>
            <a id="ei-open-gallery-button" type="button" class="ei-button button standard mobile-fix" style="display: none;">Open Gallery</a>
            <a id="ei-close-button" type="button" class="ei-button button standard mobile-fix">Close</a>
        </div>
        <div id="ei-preview-spinner-container"></div>
    </div>
</div>`;
    }
}
