function lookupMime(filename) {
    var ext = /[^\/\\.]*$/.exec(filename)[0];
    return {
        js: "application/javascript",
        ico: "image/x-icon",
        css: "text/css",
        svg: "image/svg+xml",
        png: "image/png",
        jpg: "image/jpg",
        html: "text/html",
        jpeg: "image/jpeg"
    }[ext];
}

// don't let users crawl up the folder structure by using a/../../../c/d
function cleanUrl(url) { 
    url = decodeURIComponent(url);
    while(url.indexOf('..').length > 0) { url = url.replace('..', ''); }
    return url;
};

export default { lookupMime, cleanUrl };