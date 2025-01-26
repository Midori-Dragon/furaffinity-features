import { requestHelper, scriptName } from '..';
import isSubmissionPageInGallery from '../../../GlobalUtils/src/FA-Functions/isSubmissionPageInGallery';
import isSubmissionPageInScraps from '../../../GlobalUtils/src/FA-Functions/isSubmissionPageInScraps';
import { Logger } from '../../../GlobalUtils/src/Logger';
import string from '../../../GlobalUtils/src/string';
import getCurrGalleryFolder from '../../../GlobalUtils/src/URL-Functions/getCurrGalleryFolder';
import generalizeString from '../utils/generalizeString';
import getDocUsername from '../utils/getDocUsername';
import { IAutoLoaderSearchable } from './IAutoLoaderSearchable';

export class BackwardSearch implements IAutoLoaderSearchable {
    currSubmissionPageNo?: number;
    sidToIgnore: number[] = [];

    private _currSid: number;
    private _amount: number;

    constructor(currSid: number, amount: number, currSubmissionPageNo?: number) {
        this._currSid = currSid;
        this._amount = amount;
        this.currSubmissionPageNo = currSubmissionPageNo;
        this.sidToIgnore.push(currSid);
    }

    async search(): Promise<Record<number, HTMLImageElement>> {
        const isInGallery = isSubmissionPageInGallery(document);
        const isInScraps = isSubmissionPageInScraps(document);

        if (!isInGallery && !isInScraps) {
            return {};
        }

        const columnpage = document.getElementById('columnpage');
        const submissionIdContainer = columnpage?.querySelector('div[class*="submission-id-container"]');
        const submissionTitle = submissionIdContainer?.querySelector('div[class*="submission-title"]');
        const currTitle = submissionTitle?.querySelector('h2')?.querySelector('p')?.textContent;
        if (string.isNullOrWhitespace(currTitle)) {
            return {};
        }

        const currUsername = getDocUsername(document)!;
        const folderId = getCurrGalleryFolder();

        Logger.logInfo(`${scriptName}: finding submission page...`);
        if (this.currSubmissionPageNo == null || this.currSubmissionPageNo < 1) {
            if (isInGallery) {
                this.currSubmissionPageNo = await requestHelper.UserRequests.GalleryRequests.Gallery.getSubmissionPageNo(currUsername, this._currSid, folderId, -1, -1);
            } else if (isInScraps) {
                this.currSubmissionPageNo = await requestHelper.UserRequests.GalleryRequests.Scraps.getSubmissionPageNo(currUsername, this._currSid, -1, -1);
            }
        }
        Logger.logInfo(`${scriptName}: found submission on page '${this.currSubmissionPageNo}'`);

        Logger.logInfo(`${scriptName}: searching figures backward...`);
        let figures: HTMLElement[][] = [];
        if (isInGallery) {
            figures = await requestHelper.UserRequests.GalleryRequests.Gallery.getFiguresInFolderBetweenPages(currUsername, folderId, this.currSubmissionPageNo!, this.currSubmissionPageNo! + this._amount);
        } else if (isInScraps) {
            figures = await requestHelper.UserRequests.GalleryRequests.Scraps.getFiguresBetweenPages(currUsername, this.currSubmissionPageNo!, this.currSubmissionPageNo! + this._amount);
        }
        let figuresFlattend = figures.flat();
        figuresFlattend = figuresFlattend.filter(figure => !this.sidToIgnore.includes(parseInt(figure.id.trimStart('sid-'))));
        figuresFlattend = figuresFlattend.filter(figure => this.figureTitleIsGenerallyEqual(figure, currTitle!));
        figuresFlattend.reverse();
        Logger.logInfo(`${scriptName}: searching figures backward found '${figuresFlattend.length}' figures`);

        Logger.logInfo(`${scriptName}: loading submission pages...`);
        const result: Record<number, HTMLImageElement> = {};
        for (let i = 0; i < figuresFlattend.length; i++) {
            const figureSid = figuresFlattend[i].id.trimStart('sid-');

            const subDoc = await requestHelper.SubmissionRequests.getSubmissionPage(parseInt(figureSid));
            const img = subDoc?.getElementById('submissionImg');
            if (img == null) {
                continue;
            }

            img.setAttribute('wal-index', (-(figuresFlattend.length - i)).toString());
            img.setAttribute('wal-sid', figureSid);
            result[parseInt(figureSid)] = img as HTMLImageElement;
            Logger.logInfo(`${scriptName}: loaded submission '${figureSid}' with index '${(-(figuresFlattend.length - i)).toString()}'`);
        }
        return result;
    }

    private figureTitleIsGenerallyEqual(figure: HTMLElement, title: string): boolean {
        const figCaption = figure.querySelector('figcaption');
        const titleElem = figCaption?.querySelector('a[href*="view"]');
        if (titleElem != null) {
            const figTitle = (titleElem as HTMLAnchorElement).title.toLowerCase();
            const figTitleGeneralized = generalizeString(figTitle, true, true, true, true, true, true);
            const currTitleGeneralized = generalizeString(title, true, true, true, true, true, true);
            return figTitleGeneralized.includes(currTitleGeneralized) || currTitleGeneralized.includes(figTitleGeneralized);
        }
        return false;
    }
}
