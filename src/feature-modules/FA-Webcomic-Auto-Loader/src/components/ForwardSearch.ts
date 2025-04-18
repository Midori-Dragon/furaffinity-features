import { requestHelper, scriptName } from '..';
import isSubmissionPageInGallery from '../../../../library-modules/GlobalUtils/src/FA-Functions/isSubmissionPageInGallery';
import isSubmissionPageInScraps from '../../../../library-modules/GlobalUtils/src/FA-Functions/isSubmissionPageInScraps';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import string from '../../../../library-modules/GlobalUtils/src/string';
import getCurrGalleryFolder from '../../../../library-modules/GlobalUtils/src/URL-Functions/getCurrGalleryFolder';
import figureTitleIsGenerallyEqual from '../utils/figureTitleIsGenerallyEqual';
import getDocUsername from '../utils/getDocUsername';
import { IAutoLoaderSearchable } from './IAutoLoaderSearchable';

export class ForwardSearch implements IAutoLoaderSearchable {
    currSubmissionPageNo?: number;
    sidToIgnore: number[] = [];

    private _currSid: number;

    constructor(currSid: number, currSubmissionPageNo?: number) {
        this._currSid = currSid;
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

        Logger.logInfo(`${scriptName}: searching figures forward...`);
        let figures: HTMLElement[][] = [];
        if (isInGallery) {
            figures = await requestHelper.UserRequests.GalleryRequests.Gallery.getFiguresInFolderBetweenIds(currUsername, folderId, undefined, this._currSid);
        } else if (isInScraps) {
            figures = await requestHelper.UserRequests.GalleryRequests.Scraps.getFiguresBetweenIds(currUsername, undefined, this._currSid);
        }
        let figuresFlattend = figures.flat();
        figuresFlattend = figuresFlattend.filter(figure => !this.sidToIgnore.includes(parseInt(figure.id.trimStart('sid-'))));
        figuresFlattend = figuresFlattend.filter(figure => figureTitleIsGenerallyEqual(figure, currTitle!));
        figuresFlattend.reverse();
        Logger.logInfo(`${scriptName}: searching figures forward found '${figuresFlattend.length}' figures`);

        Logger.logInfo(`${scriptName}: loading submission pages...`);
        const result: Record<number, HTMLImageElement> = {};
        for (let i = 0; i < figuresFlattend.length; i++) {
            const figureSid = figuresFlattend[i].id.trimStart('sid-');

            const subDoc = await requestHelper.SubmissionRequests.getSubmissionPage(parseInt(figureSid));
            const img = subDoc?.getElementById('submissionImg');
            if (img == null) {
                continue;
            }

            img.setAttribute('wal-index', (i + 1).toString());
            img.setAttribute('wal-sid', figureSid);
            result[parseInt(figureSid)] = img as HTMLImageElement;
            Logger.logInfo(`${scriptName}: loaded submission '${figureSid}' with index '${(i + 1).toString()}'`);
        }
        return result;
    }
}
