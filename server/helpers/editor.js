// don't let users crawl up the folder structure by using a/../../../c/d
function cleanUrl(url) {
    url = decodeURIComponent(url);
    let newURL = url.split('../').join("");
    return newURL;
}
// don't let users crawl up the file name by using bar/foo/bar.js
function cleanFileName(name) {
    name = cleanUrl(name);
    let newName = name.split(/[\\\/]+/g);
    return newName[newName.length-1];
}

function generateFilePath (req, fileName, rootFolder){
    rootFolder = rootFolder || 'projects';

    return rootFolder+'/' + req.user.username + '/' + req.project.root + '/' + cleanUrl(fileName);

}

export default { cleanUrl, cleanFileName, generateFilePath};
