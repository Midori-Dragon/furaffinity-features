import { requestHelper, scriptName } from '..';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import getDocViewSid from '../utils/getDocViewSid';
import { ComicNavigation } from './ComicNavigation';
import { IAutoLoaderSearchable } from './IAutoLoaderSearchable';

export class AutoLoaderSearch implements IAutoLoaderSearchable {
    private rootImg: HTMLImageElement;
    private rootSid: number;
    private currComicNav: ComicNavigation | null;
    private currImgIndex = 1;
    private currSid = -1;

    constructor(rootImg: HTMLImageElement, rootSid: number, comicNav: ComicNavigation) {
        this.rootImg = rootImg;
        this.rootSid = rootSid;
        this.currComicNav = comicNav;
    }

    async search(): Promise<Record<number, HTMLImageElement>> {
        const loadedImgs: Record<number, HTMLImageElement> = {};
        loadedImgs[this.rootSid] = this.rootImg;

        Logger.logInfo(`${scriptName}: starting search...`);
        do {
            try {
                if (this.currComicNav == null) {
                    break;
                }
            
                const img = await this.getPage(this.currComicNav.nextId);
                if (img == null) {
                    break;
                }

                if (this.currSid in loadedImgs) {
                    break;
                }
                Logger.logInfo(`${scriptName}: found image with sid '${this.currSid}'`);

                loadedImgs[this.currSid] = img;
                this.currImgIndex++;
            } catch (error) {
                Logger.logError(error);
                break;
            }
        } while (this.currComicNav?.nextId !== -1);
        Logger.logInfo(`${scriptName}: finished search. Found ${Object.keys(loadedImgs).length} images.`);

        return loadedImgs;
    }

    async getPage(sid: number): Promise<HTMLImageElement | undefined> {
        if (sid <= 0) {
            return undefined;
        }

        const page = (await requestHelper.SubmissionRequests.getSubmissionPage(sid))!;

        const img = page.getElementById('submissionImg')!;
        img.setAttribute('wal-index', this.currImgIndex.toString());
        img.setAttribute('wal-sid', sid.toString());

        this.currSid = getDocViewSid(page);

        const descriptionElem = page.getElementById('columnpage')?.querySelector('div[class*="submission-description"]');
        if (descriptionElem != null) {
            this.currComicNav = ComicNavigation.fromElement(descriptionElem as HTMLElement);
        } else {
            this.currComicNav = null;
        }

        return img as HTMLImageElement;
    }
}
