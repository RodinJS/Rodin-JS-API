import googl from 'goo.gl';
import config from '../../config/env';

// Set a API key (required by Google)
googl.setKey(config.urlshortenerkey);

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