import { backwardSearchSetting, loadingSpinSpeedSetting, overwriteNavButtonsSetting, scriptName, useCustomLightboxSetting } from '..';
import { LoadingSpinner } from '../../../Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import checkTags from '../../../GlobalUtils/src/FA-Functions/checkTags';
import { Logger } from '../../../GlobalUtils/src/Logger';
import { AutoLoaderSearch } from '../components/AutoLoaderSearch';
import { BackwardSearch } from '../components/BackwardSearch';
import { ComicNavigation } from '../components/ComicNavigation';
import { ForwardSearch } from '../components/ForwardSearch';
import getCurrViewSid from '../utils/getDocViewSid';
import { Lightbox } from './Lightbox';

export class AutoLoader {
    private _submissionImg: HTMLImageElement;
    private _currComicNav: ComicNavigation | null | undefined = null;
    private _comicNavExists = false;
    private _currSid = -1;
    private _loadingSpinner: LoadingSpinner;
    
    constructor() {
        const descriptionElem = document.getElementById('columnpage')?.querySelector('div[class*="submission-description"]');
        if (descriptionElem != null) {
            this._currComicNav = ComicNavigation.fromElement(descriptionElem as HTMLElement);
            if (this._currComicNav != null) {
                if (this._currComicNav.prevId !== -1 || this._currComicNav.firstId !== -1 || this._currComicNav.nextId !== -1) {
                    this._comicNavExists = true;
                    if (overwriteNavButtonsSetting.value) {
                        this.overwriteNavButtons();
                    }
                }
            }
        }

        this._currSid = getCurrViewSid(document);

        this._submissionImg = document.getElementById('submissionImg')! as HTMLImageElement;
        this._submissionImg.setAttribute('wal-index', '0');
        this._submissionImg.setAttribute('wal-sid', this._currSid.toString());

        const searchButton = document.createElement('a');
        searchButton.id = this._comicNavExists ? 'wal-auto-load-button' : 'wal-search-button';
        searchButton.classList.add('wal-button', 'button', 'standard', 'mobile-fix');
        searchButton.type = 'button';
        searchButton.style.margin = '20px 0 10px 0';
        searchButton.textContent = this._comicNavExists ? 'Auto load Pages' : 'Search for similar Pages';
        searchButton.addEventListener('click', () => {
            if (this._comicNavExists) {
                this.startAutoloader();
            } else {
                this.startSimilarSearch();
            }
            searchButton.remove();
        });
        this._submissionImg.parentNode!.appendChild(document.createElement('br'));
        this._submissionImg.parentNode!.appendChild(searchButton);

        const loadingSpinnerContainer = document.createElement('div');
        loadingSpinnerContainer.classList.add('wal-loading-spinner');
        loadingSpinnerContainer.style.margin = '20px 0 20px 0';
        this._loadingSpinner = new window.FALoadingSpinner(loadingSpinnerContainer);
        this._loadingSpinner.delay = loadingSpinSpeedSetting.value;
        this._loadingSpinner.spinnerThickness = 6;
        this._submissionImg.parentNode!.appendChild(loadingSpinnerContainer);
    }

    startAutoloader(): void {
        void this.startAutoLoaderAsync();
    }

    private async startAutoLoaderAsync(): Promise<void> {
        this._loadingSpinner.visible = true;
        const autoLoader = new AutoLoaderSearch(this._submissionImg, this._currSid, this._currComicNav!);
        const submissions = await autoLoader.search();
        this.addLoadedSubmissions(submissions);
        if (useCustomLightboxSetting.value) {
            new Lightbox(this._currSid, submissions);
        }
        this._loadingSpinner.visible = false;
    }

    startSimilarSearch(): void {
        void this.startSimilarSearchAsync();
    }

    private async startSimilarSearchAsync(): Promise<void> {
        this._loadingSpinner.visible = true;
        const forwardSearch = new ForwardSearch(this._currSid);
        const submissionsAfter = await forwardSearch.search();

        const backwardSearch = new BackwardSearch(this._currSid, backwardSearchSetting.value, forwardSearch.currSubmissionPageNo);
        backwardSearch.sidToIgnore.push(...Object.keys(submissionsAfter).map(Number));
        const submissionsBefore = await backwardSearch.search();

        this.addLoadedSubmissions(submissionsBefore, submissionsAfter);
        if (useCustomLightboxSetting.value) {
            new Lightbox(this._currSid, {...submissionsBefore, ...submissionsAfter});
        }
        this._loadingSpinner.visible = false;
    }

    addLoadedSubmissions(...imgsArr: Record<number, HTMLImageElement>[]): void {
        const columnpage = document.getElementById('columnpage')!;

        for (const imgs of imgsArr) {
            Logger.logInfo(`${scriptName}: adding '${Object.keys(imgs).length}' submissions...`);
            let prevSid = this._currSid;
            for (const sid of Object.keys(imgs).map(Number)) {
                if (imgs[sid].getAttribute('wal-sid') === this._currSid.toString()) {
                    continue;
                }

                const lastImg = columnpage.querySelector(`img[wal-sid="${prevSid}"]`)!;
                const lastIndex = parseInt(lastImg.getAttribute('wal-index')!);
                const currIndex = parseInt(imgs[sid].getAttribute('wal-index')!);

                if (currIndex < lastIndex) {
                    lastImg.insertBeforeThis(imgs[sid]);
                    imgs[sid].insertAfterThis(document.createElement('br'));
                    imgs[sid].insertAfterThis(document.createElement('br'));
                    checkTags(imgs[sid]);
                    Logger.logInfo(`${scriptName}: added submission ${sid} before submission ${prevSid}`);
                } else {
                    lastImg.insertAfterThis(imgs[sid]);
                    imgs[sid].insertBeforeThis(document.createElement('br'));
                    imgs[sid].insertBeforeThis(document.createElement('br'));
                    checkTags(imgs[sid]);
                    Logger.logInfo(`${scriptName}: added submission ${sid} after submission ${prevSid}`);
                }

                prevSid = sid;
            }
        }
    }

    overwriteNavButtons(): void {
        if (!this._comicNavExists) {
            return;
        }

        const columnpage = document.getElementById('columnpage');
        const favoriteNav = columnpage?.querySelector('div[class*="favorite-nav"]');

        let prevButton = favoriteNav?.children[0];
        if (prevButton != null && this._currComicNav!.prevId !== -1) {
            if (prevButton.textContent?.toLowerCase()?.includes('prev') ?? false) {
                (prevButton as HTMLLinkElement).href = `/view/${this._currComicNav!.prevId}/`;
            } else {
                const prevButtonReal = document.createElement('a');
                prevButtonReal.href = `/view/${this._currComicNav!.prevId}/`;
                prevButtonReal.classList.add('button', 'standard', 'mobile-fix');
                prevButtonReal.textContent = 'Prev';
                prevButtonReal.style.marginRight = '4px';
                prevButton.insertBeforeThis(prevButtonReal);
            }
        }

        let nextButton = favoriteNav?.children[favoriteNav.children.length - 1];
        if (nextButton != null && this._currComicNav!.nextId !== -1) {
            if (nextButton.textContent?.toLowerCase()?.includes('next') ?? false) {
                (nextButton as HTMLLinkElement).href = `/view/${this._currComicNav!.nextId}/`;
            } else {
                const nextButtonReal = document.createElement('a');
                nextButtonReal.href = `/view/${this._currComicNav!.nextId}/`;
                nextButtonReal.classList.add('button', 'standard', 'mobile-fix');
                nextButtonReal.textContent = 'Next';
                nextButtonReal.style.marginLeft = '4px';
                nextButton.insertAfterThis(nextButtonReal);
            }
        }
    }
}
