export class FAFigure {

    id: string;
    className: string;
    image: FAFigureImage;
    figCaption: FAFigureFigCaption;
    

    constructor(figure: HTMLElement) {
        this.id = figure.id.trimStart('sid-');
        this.className = figure.className;
        this.image = new FAFigureImage(figure.querySelector('img')!);
        this.figCaption = new FAFigureFigCaption(figure.querySelector('figcaption')!);
    }

    ToHTMLElement(): HTMLElement {
        const figure = document.createElement('figure');
        figure.id = `sid-${this.id}`;
        figure.className = this.className;
        figure.style.minWidth = (this.image.width + 6) + 'px';
        figure.style.height = (this.image.height + 6) + 'px';
        figure.appendChild(this.buildImageBElement());
        figure.appendChild(this.buildFigCaptionElement());
        return figure;
    }

    private buildImageBElement(): HTMLElement {
        const b = document.createElement('b');
        const u = document.createElement('u');
        const a = document.createElement('a');
        a.href = `/view/${this.id}`;
        a.appendChild(this.image.ToHTMLElement());
        const i = document.createElement('i');
        i.classList.add('hideonmobile', 'hideontablet');
        i.title = 'Click for description';
        a.appendChild(i);
        u.appendChild(a);
        b.appendChild(u);
        return b;
    }

    private buildFigCaptionElement(): HTMLElement {
        return this.figCaption.ToHTMLElement();
    }

    static fromJSON(jsonFigure: string): FAFigure {
        const figure = JSON.parse(jsonFigure) as FAFigure;
        return this.getRevivedObject(figure);
    }

    static getRevivedObject(jsonFigure: FAFigure): FAFigure {
        const mock = this.getHTMLMock();
        const newFAFigure = Object.assign(new FAFigure(mock), jsonFigure);
        newFAFigure.image = Object.assign(new FAFigureImage(mock.querySelector('img')!), jsonFigure.image);
        newFAFigure.figCaption = Object.assign(new FAFigureFigCaption(mock.querySelector('figcaption')!), jsonFigure.figCaption);
        return newFAFigure;
    }

    private static getHTMLMock(): HTMLElement {
        const mock = `
            <figure id="sid-00000000" class="r-general t-image u-example" style="height: 211px;">
                <b>
                    <u>
                        <a href="/view/00000000/">
                            <img data-tags="" class="" alt="" src="//t.furaffinity.net/0000000@400-0000000000.jpg" data-width="374.681" data-height="250" style="width: 307px; height: 205px;" loading="lazy" decoding="async">
                            <i class="hideonmobile hideontablet" title="Click for description"></i>
                        </a>
                    </u>
                </b>
                <figcaption wfv-from-user="example" wfv-from-userDisplay="Example">
                    <p>
                        <a href="/view/00000000/" title="Some Title">Some Title</a>
                    </p>
                    <p>
                        <i>by</i> <a href="/user/example/" title="Example">Example</a>
                    </p>
                </figcaption>
                
            </figure>`;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(mock, 'text/html');
        return doc.body.firstElementChild as HTMLElement;
    }
}

export class FAFigureImage {
    dataTags: string[] | undefined;
    fileName: string;
    dataWidth: number;
    dataHeight: number;
    width: number;
    height: number;

    constructor(image: HTMLImageElement) {
        this.dataTags = image.getAttribute('data-tags')?.split(' ');
        this.fileName = image.src.replace('t.furaffinity.net', '').replace('https://', '').trimEnd('/');
        this.dataWidth = parseInt(image.getAttribute('data-width')!);
        this.dataHeight = parseInt(image.getAttribute('data-height')!);
        this.width = parseInt(image.style.width.replace('px', ''));
        this.height = parseInt(image.style.height.replace('px', ''));
    }

    ToHTMLElement(): HTMLElement {
        const image = document.createElement('img');
        image.src = `//t.furaffinity.net/${this.fileName}`;
        image.className = '';
        image.alt = '';
        image.setAttribute('data-tags', this.dataTags?.join(' ') ?? '');
        image.setAttribute('data-width', this.dataWidth.toString());
        image.setAttribute('data-height', this.dataHeight.toString());
        image.style.width = `${this.width}px`;
        image.style.height = `${this.height}px`;
        image.loading = 'lazy';
        image.decoding = 'async';
        return image;
    }
}

export class FAFigureFigCaption {
    id: string;
    title: string;
    byUserId: string;
    byUsername: string;
    fromId: string;
    fromUsername: string;
    

    constructor(figCaption: HTMLElement) {
        const aElems = figCaption.querySelectorAll('a');
        const firstAElem = aElems[0];
        const lastAElem = aElems[aElems.length - 1];

        this.id = firstAElem.href.replace('/view/', '').replace('www.furaffinity.net', '').replace('https://', '').trimEnd('/');
        this.title = firstAElem.textContent ?? '';
        
        this.byUserId = lastAElem.href.replace('/user/', '').replace('www.furaffinity.net', '').replace('https://', '').trimEnd('/');
        this.byUsername = lastAElem.textContent ?? '';

        this.fromId = figCaption.getAttribute('wfv-from-user') ?? '';
        this.fromUsername = figCaption.getAttribute('wfv-from-userDisplay') ?? '';
    }

    ToHTMLElement(): HTMLElement {
        const figCaption = document.createElement('figcaption');
        const firstP = document.createElement('p');

        const a = document.createElement('a');
        a.href = `/view/${this.id}/`;
        a.title = this.title;
        a.textContent = this.title;
        firstP.appendChild(a);
        figCaption.appendChild(firstP);

        const secondP = document.createElement('p');
        const i = document.createElement('i');
        i.textContent = 'from ';
        secondP.appendChild(i);
        const a2 = document.createElement('a');
        a2.href = `/user/${this.fromId}/`;
        a2.title = this.fromUsername;
        a2.textContent = this.fromUsername;
        a2.style.fontWeight = '400';
        secondP.appendChild(a2);
        figCaption.appendChild(secondP);

        const thirdP = document.createElement('p');
        const i2 = document.createElement('i');
        i2.textContent = 'by ';
        thirdP.appendChild(i2);
        const a3 = document.createElement('a');
        a3.href = `/user/${this.byUserId}/`;
        a3.title = this.byUsername;
        a3.textContent = this.byUsername;
        a3.style.fontWeight = '400';
        thirdP.appendChild(a3);
        figCaption.appendChild(thirdP);
        return figCaption;
    }
}
