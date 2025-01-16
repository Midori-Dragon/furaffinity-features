import { closeEmbedAfterOpenSetting, loadingSpinSpeedFavSetting, loadingSpinSpeedSetting, openInNewTabSetting, previewQualitySetting, requestHelper } from '..';
import { LoadingSpinner } from '../../../Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import stringIsEmptyOrWhitespace from '../../../GlobalUtils/src/utils/String-Functions/StringIsEmptyOrWhitespace';
import trimEnd from '../../../GlobalUtils/src/utils/String-Functions/TrimEnd';
import { EmbeddedHTML } from '../components/EmbeddedHTML';
import { getByLinkFromFigcaption, getFavKey } from '../utils/Utils';
import '../Styles/Style.css';

export class EmbeddedImage {
    embeddedElem: HTMLElement;
    submissionImg: HTMLImageElement | undefined;
    favRequestRunning = false;
    downloadRequestRunning = false;

    private _imageLoaded = false;
    private _onRemoveAction: (() => void) | undefined;

    private loadingSpinner: LoadingSpinner;
    private previewLoadingSpinner: LoadingSpinner;

    constructor(figure: HTMLElement) {
        this.embeddedElem = document.createElement('div');

        this.createElements(figure);
        const submissionContainer = document.getElementById('ei-submission-container')!;
        const previewLoadingSpinnerContainer = document.getElementById('ei-preview-spinner-container')!;

        this.loadingSpinner = new window.FALoadingSpinner(submissionContainer);
        this.loadingSpinner.delay = loadingSpinSpeedSetting.value;
        this.loadingSpinner.spinnerThickness = 6;
        this.loadingSpinner.visible = true;

        this.previewLoadingSpinner = new window.FALoadingSpinner(previewLoadingSpinnerContainer);
        this.previewLoadingSpinner.delay = loadingSpinSpeedSetting.value;
        this.previewLoadingSpinner.spinnerThickness = 4;
        this.previewLoadingSpinner.size = 40;

        // Add click event to remove the embedded element when clicked outside
        document.addEventListener('click', this._onDocumentClick.bind(this));

        void this.fillSubDocInfos(figure);
    }

    static get embeddedExists(): boolean {
        return document.getElementById('ei-main') != null;
    }

    private _onDocumentClick(event: Event): void {
        if (event.target === document.documentElement) {
            this.remove();
        }
    }

    private _closeOnOpen(): void {
        if (closeEmbedAfterOpenSetting.value) {
            this.remove();
        }
    }

    onRemove(action: () => void): void {
        this._onRemoveAction = action;
    }

    remove(): void {
        this.embeddedElem.parentNode?.removeChild(this.embeddedElem);
        document.removeEventListener('click', this._onDocumentClick);
        this._onRemoveAction?.();
    }

    createElements(figure: HTMLElement): void {
        // Create the main container for the embedded element
        this.embeddedElem.id = 'ei-main';
        this.embeddedElem.innerHTML = EmbeddedHTML.html;
        const ddmenu = document.getElementById('ddmenu')!;
        ddmenu.appendChild(this.embeddedElem);

        // Add click event to remove the embedded element when clicked outside
        this.embeddedElem.addEventListener('click', (event) => {
            if (event.target === this.embeddedElem) {
                this.remove();
            }
        });

        // Get the submission container element
        const submissionContainer = document.getElementById('ei-submission-container')!;

        // Set target attribute for opening in new tab based on settings
        if (openInNewTabSetting.value) {
            submissionContainer.setAttribute('target', '_blank');
        }

        // Add click event to close the embed after opening, if setting is enabled
        submissionContainer.addEventListener('click', this._closeOnOpen.bind(this));
        // Extract user gallery and scraps links from the figure caption
        const userLink = getByLinkFromFigcaption(figure.querySelector('figcaption'));
        if (userLink != null) {
            const galleryLink = trimEnd(userLink, '/').replace('user', 'gallery');
            const scrapsLink = trimEnd(userLink, '/').replace('user', 'scraps');
            if (!window.location.toString().includes(userLink) && !window.location.toString().includes(galleryLink) && !window.location.toString().includes(scrapsLink)) {
                const openGalleryButton = document.getElementById('ei-open-gallery-button')!;
                openGalleryButton.style.display = 'block';
                openGalleryButton.setAttribute('href', galleryLink);
                if (openInNewTabSetting.value) {
                    openGalleryButton.setAttribute('target', '_blank');
                }
                openGalleryButton.addEventListener('click', this._closeOnOpen.bind(this));
            }
        }

        const link = figure.querySelector('a[href]')?.getAttribute('href');
        const openButton = document.getElementById('ei-open-button')!;
        openButton.setAttribute('href', link ?? '');
        if (openInNewTabSetting.value) {
            openButton.setAttribute('target', '_blank');
        }
        openButton.onclick = (): void => {
            if (closeEmbedAfterOpenSetting.value) {
                this.remove();
            }
        };

        const closeButton = document.getElementById('ei-close-button')!;
        closeButton.addEventListener('click', this.remove.bind(this));

        const previewLoadingSpinnerContainer = document.getElementById('ei-preview-spinner-container')!;
        previewLoadingSpinnerContainer.onclick = (): void => {
            this.previewLoadingSpinner.visible = false;
        };
    }

    async fillSubDocInfos(figure: HTMLElement): Promise<void> {
        const sid = figure.id.split('-')[1];
        const ddmenu = document.getElementById('ddmenu')!;
        const doc = await requestHelper.SubmissionRequests.getSubmissionPage(sid);
        if (doc != null) {
            this.submissionImg = doc.getElementById('submissionImg') as HTMLImageElement;
            const imgSrc = this.submissionImg.src;
            let prevSrc = this.submissionImg.getAttribute('data-preview-src') ?? undefined;
            if (!stringIsEmptyOrWhitespace(prevSrc)) {
                if (previewQualitySetting.value <= 2) {
                    prevSrc = prevSrc?.replace('@600', '@200');
                } else if (previewQualitySetting.value === 3) {
                    prevSrc = prevSrc?.replace('@600', '@300');
                } else if (previewQualitySetting.value === 4) {
                    prevSrc = prevSrc?.replace('@600', '@400');
                }
            }

            const submissionContainer = document.getElementById('ei-submission-container')!;
            const faImageViewer = new window.FAImageViewer(submissionContainer, imgSrc, prevSrc);
            faImageViewer.faImage.id = 'ei-submission-img';
            faImageViewer.faImagePreview.id = 'ei-preview-submission-img';
            faImageViewer.faImage.classList.add('ei-submission-img');
            faImageViewer.faImagePreview.classList.add('ei-submission-img');
            faImageViewer.faImage.style.maxWidth = faImageViewer.faImagePreview.style.maxWidth = window.innerWidth - 20 * 2 + 'px';
            faImageViewer.faImage.style.maxHeight = faImageViewer.faImagePreview.style.maxHeight = window.innerHeight - ddmenu.clientHeight - 38 * 2 - 20 * 2 - 100 + 'px';
            faImageViewer.onImageLoadStart = (): void => {
                this._imageLoaded = false;
            };
            faImageViewer.onImageLoad = (): void => {
                this._imageLoaded = true;
                this.loadingSpinner.visible = false;
                this.previewLoadingSpinner.visible = false;
            };
            faImageViewer.onPreviewImageLoad = (): void => {
                this.loadingSpinner.visible = false;
                if (!this._imageLoaded) {
                    this.previewLoadingSpinner.visible = true;
                }
            };
            void faImageViewer.load();

            const url = doc.querySelector('meta[property="og:url"]')?.getAttribute('content');
            submissionContainer.setAttribute('href', url ?? '');

            const result = getFavKey(doc);
            if (result != null) {
                const favButton = document.getElementById('ei-fav-button')!;
                favButton.textContent = result.isFav ? '+Fav' : '-Fav';
                favButton.setAttribute('isFav', result.isFav.toString());
                favButton.setAttribute('key', result.favKey ?? '');
                favButton.addEventListener('click', () => {
                    if (!this.favRequestRunning) {
                        void this.doFavRequest(sid);
                    }
                });
            }

            const downloadButton = document.getElementById('ei-download-button')!;
            downloadButton.addEventListener('click', () => {
                if (this.downloadRequestRunning) {
                    return;
                }
                this.downloadRequestRunning = true;
                const loadingTextSpinner = new window.FALoadingTextSpinner(downloadButton);
                loadingTextSpinner.delay = loadingSpinSpeedFavSetting.value;
                loadingTextSpinner.visible = true;
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = this.submissionImg!.src + '?ei-download';
                iframe.addEventListener('load', () => {
                    this.downloadRequestRunning = false;
                    loadingTextSpinner.visible = false;
                    setTimeout(() => iframe.parentNode?.removeChild(iframe), 100);
                });
                document.body.appendChild(iframe);
            });
        }
    }

    async doFavRequest(sid: string): Promise<void> {
        const favButton = document.getElementById('ei-fav-button')!;

        // Set the favorite request running flag to true
        this.favRequestRunning = true;

        // Create a loading spinner for the favorite button
        const loadingTextSpinner = new window.FALoadingTextSpinner(favButton);
        loadingTextSpinner.delay = loadingSpinSpeedFavSetting.value;
        loadingTextSpinner.visible = true;

        // Get the favorite key and status from the favorite button
        let favKey = favButton.getAttribute('key') ?? '';
        let isFav = favButton.getAttribute('isFav') === 'true';

        if (stringIsEmptyOrWhitespace(favKey)) {
            favButton.textContent = 'x';
            return;
        }

        if (isFav) {
            // Send the favorite request to the server
            favKey = await requestHelper.SubmissionRequests.favSubmission(sid, favKey) ?? '';
            loadingTextSpinner.visible = false;

            // If the request was successful, set the favorite status to false and update the button text
            if (!stringIsEmptyOrWhitespace(favKey)) {
                favButton.setAttribute('key', favKey);
                isFav = false;
                favButton.setAttribute('isFav', isFav.toString());
                favButton.textContent = '-Fav';
            } else {
                // If the request was not successful, set the button text to "x" and restore the original text after a short delay
                favButton.textContent = 'x';
                setTimeout(() => favButton.textContent = '+Fav', 1000);
            }
        } else {
            // Send the unfavorite request to the server
            favKey = await requestHelper.SubmissionRequests.unfavSubmission(sid, favKey) ?? '';
            loadingTextSpinner.visible = false;

            // If the request was successful, set the favorite status to true and update the button text
            if (!stringIsEmptyOrWhitespace(favKey)) {
                favButton.setAttribute('key', favKey);
                isFav = true;
                favButton.setAttribute('isFav', isFav.toString());
                favButton.textContent = '+Fav';
            } else {
                // If the request was not successful, set the button text to "x" and restore the original text after a short delay
                favButton.textContent = 'x';
                setTimeout(() => favButton.textContent = '-Fav', 1000);
            }
        }

        // Set the favorite request running flag back to false
        this.favRequestRunning = false;
    }

    static async addEmbeddedEventForAllFigures(): Promise<void> {
        const nonEmbeddedFigures = document.querySelectorAll('figure:not([embedded])');
        for (const figure of Array.from(nonEmbeddedFigures)) {
            // Set the attribute to mark this element as embedded
            figure.setAttribute('embedded', 'true');

            // Add the event listener to the figure element
            figure.addEventListener('click', (event) => {
                // If the event is a mouse event and the target is an HTML element
                if (event instanceof MouseEvent && event.target instanceof HTMLElement) {
                    // If the event is not a Ctrl+Click event and the target is not a favorite button
                    // and the target is not a checkbox
                    if (!event.ctrlKey && !event.target.id.includes('favbutton') && event.target.getAttribute('type') !== 'checkbox') {
                        // If the target has a href attribute, return
                        if (!stringIsEmptyOrWhitespace(event.target.getAttribute('href'))) {
                            return;
                        }

                        // Prevent the default action of the event
                        event.preventDefault();

                        // If an embedded image viewer does not exist, create one
                        if (!EmbeddedImage.embeddedExists && figure instanceof HTMLElement) {
                            new EmbeddedImage(figure);
                        }
                    }
                }
            });
        }
    }
}
