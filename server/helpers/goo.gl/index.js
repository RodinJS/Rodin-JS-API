const googl = require('goo.gl');
const conf = require('../../config');

// Set a API key (required by Google)
googl.setKey(conf.get('urlshortener:key'));

// Shorten a long url and output the result
module.exports.shorten = (url) => {
    googl.shorten(url)
        .then((shortUrl) => {
            console.log(shortUrl);
        })
        .catch((err) => {
            console.error(err.message);
        });
};

// Expand a goo.gl url and output the result
module.exports.expand = (url) => {
    googl.expand(url)
        .then((longUrl) => {
            console.log(longUrl);
        })
        .catch((err) => {
            console.error(err.message);
        });    
};