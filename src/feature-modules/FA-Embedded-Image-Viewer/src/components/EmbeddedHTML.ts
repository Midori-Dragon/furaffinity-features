export class EmbeddedHTML {
    static get html(): string {
        return `
<div id="eiv-background">
    <a id="eiv-submission-container"></a>
    <div id="eiv-button-container">
        <div id="eiv-button-wrapper">
            <button id="eiv-fav-button" type="button" class="eiv-button button standard mobile-fix">⠀⠀</button>
            <button id="eiv-download-button" type="button" class="eiv-button button standard mobile-fix">Download</button>
            <a id="eiv-open-button" class="eiv-button button standard mobile-fix">Open</a>
            <a id="eiv-open-gallery-button" class="eiv-button button standard mobile-fix" style="display: none;">Open Gallery</a>
            <button id="eiv-fullsize-button" type="button" class="eiv-button button standard mobile-fix">  ⛶  </button>
            <button id="eiv-remove-sub-button" type="button" class="eiv-button button standard mobile-fix" style="display: none;">Remove</button>
            <button id="eiv-close-button" type="button" class="eiv-button button standard mobile-fix">Close</button>
        </div>
        <div id="eiv-preview-spinner-container"></div>
    </div>
    <div id="eiv-additional-info-container">
        <span>by </span>
        <a id="eiv-additional-info">unknown</a>
        <a id="eiv-additional-info-watching"></a>
    </div>
</div>`;
    }
}
