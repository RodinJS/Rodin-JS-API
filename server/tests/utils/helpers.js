/**
 * Created by xgharibyan on 10/24/16.
 */

function jsonToQueryString(json) {
    return Object.keys(json).map(function (key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

export default { jsonToQueryString };
