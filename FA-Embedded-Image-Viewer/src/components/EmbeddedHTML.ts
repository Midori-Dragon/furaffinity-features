export class EmbeddedHTML {
    static get html(): string {
        return `
<div id="embeddedBackgroundElem">
    <a id="embeddedSubmissionContainer"></a>
    <div id="embeddedButtonsContainer">
        <div id="embeddedButtonsWrapper">
            <a id="embeddedFavButton" type="button" class="embeddedButton button standard mobile-fix">⠀⠀</a>
            <a id="embeddedDownloadButton" type="button" class="embeddedButton button standard mobile-fix">Download</a>
            <a id="embeddedOpenButton" type="button" class="embeddedButton button standard mobile-fix">Open</a>
            <a id="embeddedOpenGalleryButton" type="button" class="embeddedButton button standard mobile-fix" style="display: none;">Open Gallery</a>
            <a id="embeddedCloseButton" type="button" class="embeddedButton button standard mobile-fix">Close</a>
        </div>
        <div id="previewLoadingSpinnerContainer"></div>
    </div>
</div>`;
    }
}
