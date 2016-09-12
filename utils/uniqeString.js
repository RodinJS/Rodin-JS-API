"use strict";

module.exports = (charset, charn) => () => {
    let str = "";
    let l = charset.length - 1;
    for (let i = 0; i < charn; ++i) {
        str += charset[~~( Math.random() * l)];
    }
    return str;
};