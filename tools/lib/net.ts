import * as request from 'request';

import {logger_normal, logger_silent} from './util';

// cookie str for "trow.cc" domain as in browser
let cookie_str = "";

const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:45.0) Gecko/20100101 Firefox/45.0 WebRTC Demo-rev-proxy';

const referer = "http://trow.cc/board/showforum=82";

const cookieJar = (function () {
    const jar = request.jar();
    const site = 'http://trow.cc';
    (cookie_str || '').split(';').map(function (c) {
        const cookie = request.cookie(c);
        jar.setCookie(c as any, site);
    });
    return jar;
})();

// http://trow.cc/board/act=Post&CODE=02&f=82&t=24399&qpid=149586


let reqCount = 0;

export const http = {
    get: function (url: string, verbose?: boolean) {
        const logger = verbose ? logger_normal : logger_silent;
        const reqNo = ++reqCount;
        return new Promise<string>((fulfill, reject) => {
            logger.i(`REQ ${reqNo}: GET ${url}`);
            request.get({
                url: url,
                jar: cookieJar,
                headers: {
                    'User-Agent': UserAgent,
                    'Referer': referer,
                }
            }, function (error, response, body) {
                logger.i(`RES ${reqNo} -> body size=${(body || "").length}`);
                logger.v(`RES ${reqNo} body: ${body}`);
                if (error) {
                    reject(error);
                } else {
                    fulfill(body);
                }
            });
        });
    },

    postForm: function (url: string, formContent: Object, verbose?: boolean) {
        const reqNo = ++reqCount;
        const logger = verbose ? logger_normal : logger_silent;

        return new Promise((fulfill, reject) => {
            logger.i(`REQ ${reqNo}: POST ${url}`);
            logger.i(`REQ ${reqNo}: POST form = ${JSON.stringify(formContent)}`);

            request.post({
                url: url,
                jar: cookieJar,
                form: formContent,
                headers: {
                    'User-Agent': UserAgent,
                    'Referer': referer,
                }
            }, function (error, response, body) {
                logger.i(`RES ${reqNo} -> body size=${(body || "").length}`);
                logger.v(`RES ${reqNo} body: ${body}`);

                if (error) {
                    reject(error);
                } else {
                    fulfill(body);
                }
            })
        })
    }
};
