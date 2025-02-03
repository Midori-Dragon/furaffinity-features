export class EmbeddedHTML {
    static get html(): string {
        return `
<div id="eiv-background">
    <a id="eiv-submission-container"></a>
    <div id="eiv-button-container">
        <div id="eiv-button-wrapper">
            <a id="eiv-fav-button" type="button" class="eiv-button button standard mobile-fix">⠀⠀</a>
            <a id="eiv-download-button" type="button" class="eiv-button button standard mobile-fix">Download</a>
            <a id="eiv-open-button" type="button" class="eiv-button button standard mobile-fix">Open</a>
            <a id="eiv-open-gallery-button" type="button" class="eiv-button button standard mobile-fix" style="display: none;">Open Gallery</a>
            <a id="eiv-remove-sub-button" type="button" class="eiv-button button standard mobile-fix" style="display: none;">Remove</a>
            <a id="eiv-close-button" type="button" class="eiv-button button standard mobile-fix">Close</a>
        </div>
        <div id="eiv-preview-spinner-container"></div>
    </div>
</div>`;
    }
}
