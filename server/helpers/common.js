const defTemplates = [
    {
        "name": "Empty Project",
        "description": "Empty Project",
        "tags": [
            "empty"
        ],
        "thumbnail": "",
        "root": "blank"
    },
    {
        "name": "Simple Project",
        "description": "Simple Project",
        "tags": [
            "cube",
            "simple"
        ],
        "thumbnail": "",
        "root": "simple"
    }
];



function generateCode(codeLength) {
    codeLength = codeLength || 5;
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < codeLength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getDefTemplatesObject(){
    return defTemplates
}

export default {generateCode, getDefTemplatesObject};
