// jshint esversion: 8

CustomSettings.name = "Extension Settings";
CustomSettings.provider = "Midori's Script Settings";
CustomSettings.headerName = `${GM_info.script.name} Settings`;
const showSearchButtonSetting = CustomSettings.newSetting("Simular Search Button", "Sets wether the search for simular Pages button is show.", SettingTypes.Boolean, "Show Search Button", true);
const loadingSpinSpeedSetting = CustomSettings.newSetting("Loading Animation", "Sets the duration that the loading animation takes for a full rotation in milliseconds.", SettingTypes.Number, "", 600);
const backwardSearchSetting = CustomSettings.newSetting("Backward Search", "Sets the amount of simular pages to search backward. (More Pages take longer)", SettingTypes.Number, "Backward Search Amount", 2);
CustomSettings.loadSettings();

const matchList = new MatchList(CustomSettings);
matchList.matches = ['net/view'];
// if (!matchList.hasMatch())
    // return;

const nextText = "next";
const prevText = "prev";
const firstText = "first";

const requestHelper = new FARequestHelper(2);

let lightboxPresent = false;
let currLightboxNo = -1;
let imgCount = 1;

let rootSubmissionImg = document.getElementById("submissionImg");
rootSubmissionImg.setAttribute('imgno', 0);
rootSubmissionImg.setAttribute('rootSubmissionImg', true);
rootSubmissionImg.addEventListener('click', submissionImgOnClick);
let openedSids = [getIdFromUrl(window.location.toString())];

createLoaderButton();

function createLoaderButton() {
    const hasSecondPage = getNavigationIds(document).next;

    const autoLoaderButton = document.createElement('button');
    autoLoaderButton.id = "autoloaderbutton";
    autoLoaderButton.className = "button standard mobile-fix";
    autoLoaderButton.type = "button";
    autoLoaderButton.style.marginTop = "10px";
    autoLoaderButton.style.marginBottom = "20px";

    if (hasSecondPage) {
        autoLoaderButton.textContent = "Enable Comic Autoloader";
        autoLoaderButton.onclick = startAutoloader;
        insertAfter(autoLoaderButton, rootSubmissionImg);
        insertBreakBefore(autoLoaderButton, rootSubmissionImg);
    } else if (showSearchButtonSetting.value) {
        autoLoaderButton.textContent = "Search for simular Pages";
        autoLoaderButton.onclick = startSimularSearch;
        insertAfter(autoLoaderButton, rootSubmissionImg);
        insertBreakBefore(autoLoaderButton, rootSubmissionImg);
    }
}

async function startAutoloader() {
    const autoLoaderButton = document.getElementById("autoloaderbutton");
    autoLoaderButton.parentNode.removeChild(autoLoaderButton);

    let sids = getNavigationIds(document);
    let lastSubmissionImg = document.getElementById("submissionImg");
    while (sids.next) {
        const newDoc = await loadPage(sids.next, lastSubmissionImg);
        lastSubmissionImg = document.getElementById("columnpage").querySelector('img[imgno="' + (openedSids.length - 1) + '"]');
        sids = getNavigationIds(newDoc);
    }
}

async function startSimularSearch() {
    const autoLoaderButton = document.getElementById("autoloaderbutton");
    const spinner = new LoadingTextSpinner(autoLoaderButton);
    spinner.delay = loadingSpinSpeedSetting.value;
    spinner.visible = true;
    const result = await searchAllSimularPages();
    spinner.visible = false;
    if (result)
        autoLoaderButton.parentNode.removeChild(autoLoaderButton);
    else
        autoLoaderButton.textContent = "Nothing found... Search again";
}

function getNavigationIds(doc) {
    let nextSid;
    let prevSid;
    let startSid;
    if (doc) {
        const links = doc.querySelectorAll('a[href]:not([class*="button standard mobile-fix"]), :not([class])');
        for (const elem of links) {
            const navText = elem.textContent.toLowerCase();
            if (navText.length > 12)
                continue;
            if (navText.includes(nextText))
                nextSid = getIdFromUrl(elem.href);
            if (navText.includes(prevText))
                prevSid = getIdFromUrl(elem.href);
            if (navText.includes(firstText))
                startSid = getIdFromUrl(elem.href);
        }
    }
    const sids = { next: nextSid, prev: prevSid, start: startSid };
    return sids;
}

async function loadPage(sid, lastSubmissionImg) {
    if (sid && !openedSids.includes(sid)) {
        const submissionPage = await requestHelper.SubmissionRequests.getSubmissionPage(sid);
        if (submissionPage && submissionPage.getElementById("submissionImg")) {
            openedSids.push(sid);
            const submissionImg = submissionPage.getElementById("submissionImg");
            submissionImg.setAttribute('imgno', openedSids.length - 1);
            submissionImg.addEventListener('click', submissionImgOnClick);

            insertAfter(submissionImg, lastSubmissionImg);
            insertBreakBefore(submissionImg);
            insertBreakBefore(submissionImg);

            return submissionPage;
        }
    }
}

async function loadPageBefore(sid, lastSubmissionImg) {
    if (sid && !openedSids.includes(sid)) {
        const submissionPage = await requestHelper.SubmissionRequests.getSubmissionPage(sid);
        if (submissionPage && submissionPage.getElementById("submissionImg")) {
            openedSids.push(sid);
            const submissionImg = submissionPage.getElementById("submissionImg");
            submissionImg.setAttribute('imgno', openedSids.length - 1);
            submissionImg.addEventListener('click', submissionImgOnClick);

            insertBefore(submissionImg, lastSubmissionImg);
            insertBreakBefore(submissionImg);
            insertBreakBefore(submissionImg);

            return submissionPage;
        }
    }
}

async function searchAllSimularPages() {
    const submissionPage = document.getElementById("submission_page");
    const container = submissionPage.querySelector('div[class="submission-id-sub-container"]');
    let currTitle = container.querySelector('div[class="submission-title"]').querySelector('p').textContent;
    const isFirst = currTitle.includes("1");
    currTitle = generalizeString(currTitle, true, true, true, true, true);
    const author = container.querySelector('a[href]');

    let user = author.href;
    if (user.endsWith("/"))
        user = user.substring(0, user.length - 1);
    user = user.substring(user.lastIndexOf("/") + 1);

    const sid = getIdFromUrl(window.location.toString());

    const galleryPages = await requestHelper.UserRequests.GalleryRequests.Gallery.getFiguresTillId(user, sid);
    const simularFigures = [];
    let currPage = 1;
    for (const figures of galleryPages) {
        for (const figure of figures) {
            const title = getTitleFromFigureGeneralized(figure);
            if (title != "" && (title.includes(currTitle) || currTitle.includes(title))) {
                if (figure.id.toString().replace('sid-', '') != sid) {
                    simularFigures.push(figure);
                }
            }
        }
        currPage++;
    }

    const simularFiguresBefore = [];
    if (isFirst === false && backwardSearchSetting.value !== 0) {
        const galleryPagesBefore = await requestHelper.UserRequests.GalleryRequests.Gallery.getFiguresSinceIdTillPage(user, sid, currPage + backwardSearchSetting.value);
        if (galleryPagesBefore) {
            for (const figures of galleryPagesBefore) {
                for (const figure of figures) {
                    const title = getTitleFromFigureGeneralized(figure);
                    if (title != "" && (title.includes(currTitle) || currTitle.includes(title))) {
                        if (figure.id.toString().replace('sid-', '') != sid) {
                            simularFiguresBefore.push(figure);
                        }
                    }
                }
            }
        }
    }

    if (simularFigures.length === 0 && simularFiguresBefore.length === 0)
        return false;

    simularFigures.reverse();
    const simularSids = simularFigures.map(figure => figure.id.toString().replace('sid-', ''));

    simularFiguresBefore.reverse();
    const simularSidsBefore = simularFiguresBefore.map(figure => figure.id.toString().replace('sid-', ''));

    openedSids = [];
    let lastSubmissionImg = document.getElementById("submissionImg");
    if (simularSidsBefore.length !== 0) {
        rootSubmissionImg.setAttribute('imgno', -1);
        await loadPageBefore(simularSidsBefore[0], lastSubmissionImg);
        for (const sid of simularSidsBefore) {
            await loadPage(sid, lastSubmissionImg);
            lastSubmissionImg = [...document.querySelectorAll('img[imgno="' + (openedSids.length - 1) + '"]')].pop();
        }
        lastSubmissionImg = document.querySelector('img[rootSubmissionImg="true"]');
        lastSubmissionImg.setAttribute('imgno', openedSids.length);
        insertBreakBefore(lastSubmissionImg);
        insertBreakBefore(lastSubmissionImg);
    }
    openedSids.push(getIdFromUrl(window.location.toString()));

    for (const sid of simularSids) {
        await loadPage(sid, lastSubmissionImg);
        lastSubmissionImg = [...document.querySelectorAll('img[imgno="' + (openedSids.length - 1) + '"]')].pop();
    }
    return true;
}

function getTitleFromFigure(figure) {
    const figcaption = figure.querySelector('figcaption');
    let title = figcaption.querySelector('a[href]').textContent;
    return title;
}

function getTitleFromFigureGeneralized(figure) {
    const figcaption = figure.querySelector('figcaption');
    let title = figcaption.querySelector('a[href]').textContent;
    title = generalizeString(title, true, true, true, true, true);
    return title;
}

function getIdFromUrl(url) {
    try {
        const firstNumberIndex = url.search(/\d/);
        const lastNumberIndex = url.lastIndexOf(url.match(/\d(?=\D*$)/));
        const id = url.substring(firstNumberIndex, lastNumberIndex + 1);
        return id;
    } catch {
        return;
    }
}

function submissionImgOnClick(event) {
    const img = event.target;
    if (document.querySelectorAll('img[imgno]').length > 1) {
        showLightBox(img);
    }
    event.preventDefault();
}

function showLightBox(img) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox lightbox-submission';
    lightbox.onclick = () => {
        document.body.removeChild(lightbox);
        lightboxPresent = false;
        currLightboxNo = -1;
        window.removeEventListener('keydown', handleArrowKeys);
    };
    const lightboxImg = img.cloneNode(false);
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);
    lightboxPresent = true;
    currLightboxNo = +img.getAttribute('imgno');
    window.addEventListener('keydown', handleArrowKeys);
}

function navigateLightboxLeft() {
    if (currLightboxNo > 0) {
        currLightboxNo--;
        const lightbox = document.body.querySelector('div[class="lightbox lightbox-submission"]');
        const lightboxImg = lightbox.querySelector('img');
        const nextImg = document.querySelector('img[imgno="' + currLightboxNo + '"]');
        lightboxImg.src = nextImg.src;
    }
}

function navigateLightboxRight() {
    if (currLightboxNo < openedSids.length - 1) {
        currLightboxNo++;
        const lightbox = document.body.querySelector('div[class="lightbox lightbox-submission"]');
        const lightboxImg = lightbox.querySelector('img');
        const nextImg = document.querySelector('img[imgno="' + currLightboxNo + '"]');
        lightboxImg.src = nextImg.src;
    }
}

function handleArrowKeys(event) {
    if (event.keyCode === 37) { // left arrow
        navigateLightboxLeft();
    } else if (event.keyCode === 38) { // up arrow
        navigateLightboxLeft();
    } else if (event.keyCode === 39) { // right arrow
        navigateLightboxRight();
    } else if (event.keyCode === 40) { // down arrow
        navigateLightboxRight();
    }
    event.preventDefault();
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

function insertBreakAfter(referenceNode) {
    insertAfter(document.createElement("br"), referenceNode);
}

function insertBreakBefore(referenceNode) {
    referenceNode.parentNode.insertBefore(document.createElement("br"), referenceNode);
}

function generalizeString(inputString, textToNumbers, removeSpecialChars, removeNumbers, removeSpaces, removeRoman) {
    let outputString = inputString.toLowerCase();

    if (removeRoman) {
        const roman = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"]; //Checks only up to 20
        outputString = outputString.replace(new RegExp(`(?:^|[^a-zA-Z])(${roman.join("|")})(?:[^a-zA-Z]|$)`, "g"), "");
    }

    if (textToNumbers) {
        const numbers = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };
        outputString = outputString.replace(new RegExp(Object.keys(numbers).join("|"), "gi"), match => numbers[match.toLowerCase()]);
    }

    if (removeSpecialChars)
        outputString = outputString.replace(/[^a-zA-Z0-9 ]/g, "");

    if (removeNumbers)
        outputString = outputString.replace(/[^a-zA-Z ]/g, "");

    if (removeSpaces)
        outputString = outputString.replace(/\s/g, "");

    return outputString;
}
