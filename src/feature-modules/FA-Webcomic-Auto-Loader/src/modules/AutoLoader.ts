import { backwardSearchSetting, loadingSpinSpeedSetting, overwriteNavButtonsSetting, scriptName, useCustomLightboxSetting } from '..';
import { LoadingSpinner } from '../../../../library-modules/Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import checkTags from '../../../../library-modules/GlobalUtils/src/FA-Functions/checkTags';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { AutoLoaderSearch } from '../components/AutoLoaderSearch';
import { BackwardSearch } from '../components/BackwardSearch';
import { ComicNavigation } from '../components/ComicNavigation';
import { ForwardSearch } from '../components/ForwardSearch';
import getCurrViewSid from '../utils/getDocViewSid';
import { Lightbox } from './Lightbox';

export class AutoLoader {
    submissionImg: HTMLImageElement;
    currComicNav: ComicNavigation | null | undefined = null;
    currSid = -1;
    private _loadingSpinner: LoadingSpinner;
    private _comicNavExists = false;
    private _searchButton: HTMLAnchorElement;
    
    constructor() {
        this.currSid = getCurrViewSid(document);

        this.submissionImg = document.getElementById('submissionImg')! as HTMLImageElement;
        this.submissionImg.setAttribute('wal-index', '0');
        this.submissionImg.setAttribute('wal-sid', this.currSid.toString());

        this._searchButton = document.createElement('a');
        this._searchButton.id = 'wal-search-button';
        this._searchButton.classList.add('wal-button', 'button', 'standard', 'mobile-fix');
        this._searchButton.type = 'button';
        this._searchButton.style.margin = '20px 0 10px 0';
        this.submissionImg.parentNode!.appendChild(document.createElement('br'));
        this.submissionImg.parentNode!.appendChild(this._searchButton);
        
        const descriptionElem = document.getElementById('columnpage')?.querySelector('div[class*="submission-description"]');
        if (descriptionElem != null) {
            this.currComicNav = ComicNavigation.fromElement(descriptionElem as HTMLElement);
            if (this.currComicNav != null) {
                if (this.currComicNav.prevId !== -1 || this.currComicNav.firstId !== -1 || this.currComicNav.nextId !== -1) {
                    this._comicNavExists = true;
                    if (overwriteNavButtonsSetting.value) {
                        this.overwriteNavButtons();
                    }
                }
            }
        }

        this.updateSearchButton(this.comicNavExists);

        const loadingSpinnerContainer = document.createElement('div');
        loadingSpinnerContainer.classList.add('wal-loading-spinner');
        loadingSpinnerContainer.style.margin = '20px 0 20px 0';
        this._loadingSpinner = new window.FALoadingSpinner(loadingSpinnerContainer);
        this._loadingSpinner.delay = loadingSpinSpeedSetting.value;
        this._loadingSpinner.spinnerThickness = 6;
        this.submissionImg.parentNode!.appendChild(loadingSpinnerContainer);
    }

    get comicNavExists(): boolean {
        return this._comicNavExists;
    }
    set comicNavExists(value: boolean) {
        if (value === this.comicNavExists) {
            return;
        }
        this._comicNavExists = value;
        this.updateSearchButton(value);
    }

    startAutoloader(): void {
        void this.startAutoLoaderAsync();
    }

    private async startAutoLoaderAsync(): Promise<void> {
        this._loadingSpinner.visible = true;
        const autoLoader = new AutoLoaderSearch(this.submissionImg, this.currSid, this.currComicNav!);
        const submissions = await autoLoader.search();

        const submissionIds = Object.keys(submissions).map(Number);
        if (submissionIds.length === 0 || (submissionIds.length === 1 && submissionIds[0] === this.currSid)) {
            this.comicNavExists = false;
        }
        else {
            this.addLoadedSubmissions(submissions);
            if (useCustomLightboxSetting.value) {
                new Lightbox(this.currSid, submissions);
            }
        }
        this._loadingSpinner.visible = false;
    }

    startSimilarSearch(): void {
        void this.startSimilarSearchAsync();
    }

    private async startSimilarSearchAsync(): Promise<void> {
        this._loadingSpinner.visible = true;
        const forwardSearch = new ForwardSearch(this.currSid);
        const submissionsAfter = await forwardSearch.search();

        const backwardSearch = new BackwardSearch(this.currSid, backwardSearchSetting.value, forwardSearch.currSubmissionPageNo);
        backwardSearch.sidToIgnore.push(...Object.keys(submissionsAfter).map(Number));
        const submissionsBefore = await backwardSearch.search();

        this.addLoadedSubmissions(submissionsBefore, submissionsAfter);
        if (useCustomLightboxSetting.value) {
            new Lightbox(this.currSid, {...submissionsBefore, ...submissionsAfter});
        }
        this._loadingSpinner.visible = false;
    }

    addLoadedSubmissions(...imgsArr: Record<number, HTMLImageElement>[]): void {
        const columnpage = document.getElementById('columnpage')!;

        for (const imgs of imgsArr) {
            Logger.logInfo(`${scriptName}: adding '${Object.keys(imgs).length}' submissions...`);
            let prevSid = this.currSid;
            for (const sid of Object.keys(imgs).map(Number)) {
                if (imgs[sid].getAttribute('wal-sid') === this.currSid.toString()) {
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
        if (!this.comicNavExists) {
            return;
        }

        const columnpage = document.getElementById('columnpage');
        const favoriteNav = columnpage?.querySelector('div[class*="favorite-nav"]');

        let prevButton = favoriteNav?.children[0];
        if (prevButton != null && this.currComicNav!.prevId !== -1) {
            if (prevButton.textContent?.toLowerCase()?.includes('prev') ?? false) {
                (prevButton as HTMLLinkElement).href = `/view/${this.currComicNav!.prevId}/`;
            } else {
                const prevButtonReal = document.createElement('a');
                prevButtonReal.href = `/view/${this.currComicNav!.prevId}/`;
                prevButtonReal.classList.add('button', 'standard', 'mobile-fix');
                prevButtonReal.textContent = 'Prev';
                prevButtonReal.style.marginRight = '4px';
                prevButton.insertBeforeThis(prevButtonReal);
            }
        }

        let nextButton = favoriteNav?.children[favoriteNav.children.length - 1];
        if (nextButton != null && this.currComicNav!.nextId !== -1) {
            if (nextButton.textContent?.toLowerCase()?.includes('next') ?? false) {
                (nextButton as HTMLLinkElement).href = `/view/${this.currComicNav!.nextId}/`;
            } else {
                const nextButtonReal = document.createElement('a');
                nextButtonReal.href = `/view/${this.currComicNav!.nextId}/`;
                nextButtonReal.classList.add('button', 'standard', 'mobile-fix');
                nextButtonReal.textContent = 'Next';
                nextButtonReal.style.marginLeft = '4px';
                nextButton.insertAfterThis(nextButtonReal);
            }
        }
    }

    private updateSearchButton(showAutoLoader: boolean): void {
        this._searchButton.style.display = 'inline-block';
        this._searchButton.textContent = showAutoLoader ? 'Auto load Pages' : 'Search for similar Pages';
        if (showAutoLoader) {
            this._searchButton.onclick = (): void => {
                this.startAutoloader();
                this._searchButton.style.display = 'none';
            };
        } else {
            this._searchButton.onclick = (): void => {
                this.startSimilarSearch();
                this._searchButton.style.display = 'none';
            };
        }
    }
}
