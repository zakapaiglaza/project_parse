import request from "request";

class MediaServerRequest {
    private url: string = 'https://tortuga.wtf/vod/54622';
    // private url = '<iframe allowfullscreen="" scrolling="no" frameborder="0" data-src="" allow="autoplay" src="https://tortuga.wtf/vod/54622"></iframe>'

    // public ParseEpisodeNum(url: string | undefined): number | undefined {
    //     if (url) {
    //         const regex = url.match(/\/star\.trek\.discovery\.s\d+e(\d+)\./);
    //         return regex ? parseInt(regex[1]) : undefined;
    //     } else {
    //         return undefined;
    //     }
    // }

    public async processMediaServerRequest(): Promise<Array<{ url?: string, RESOLUTION?: string, BANDWIDTH?: string }>> {
        return new Promise((resolve, reject) => {
            request(this.url, {
                strictSSL: false,
            }, (error, response, body) => {
                if (!error) {
                    let u = body.split(`new Playerjs(`)[1].split(`});`)[0].split(`file:"`)[1].split('"')[0];
                    request(u, {
                        strictSSL: false,
                    }, (error, response, body) => {
                        if (!error) {
                            let u = body.split(/\r?\n/);
                            let o: { url?: string, RESOLUTION?: string, BANDWIDTH?: string, episodeNum?: number } = {};
                            let d: Array<{ url?: string, RESOLUTION?: string, BANDWIDTH?: string }> = [];
                            for (let i = 1; i < u.length; i++) {
                                if (u[i].search('tps://') == 2) {
                                    o.url = u[i];
                                    // o.episodeNum = this.ParseEpisodeNum(o.url);
                                } else if (u[i]) {
                                    let h = u[i].split(':')[1].split(',');
                                    o.RESOLUTION = h[0].split('RESOLUTION=')[1];
                                    o.BANDWIDTH = h[1].split('BANDWIDTH=')[1];
                                }
                                if (Object.keys(o).length == 3) {
                                    d.push(o);
                                    o = {};
                                }
                            }
                            resolve(d);
                        } else {
                            reject("Произошла ошибка: " + error);
                        }
                    });
                } else {
                    reject("Произошла ошибка: " + error);
                }
            });
        });
    }
}

export default MediaServerRequest;
