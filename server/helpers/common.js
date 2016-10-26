/**
 * Created by xgharibyan on 10/26/16.
 */


function generateCode(codeLength) {
    codeLength = codeLength || 5;
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < codeLength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export default {generateCode};
