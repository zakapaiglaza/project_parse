import request from "request";

class MediaServerRequest {
    private url = 'https://tortuga.wtf/vod/72102';

    public processMediaServerRequest(): void {
        request(this.url, {
            strictSSL: false,
        }, (error, response, body) => {
            if (!error) {
                let u = body.split(`new Playerjs(`)[1].split(`});`)[0].split(`file:"`)[1].split('"')[0];
                console.log(u);

                request(u, {
                    strictSSL: false,
                }, (error, response, body) => {
                    if (!error) {
                        let u = body.split(/\r?\n/);
                        let o: { url?: string, RESOLUTION?: string, BANDWIDTH?: string } = {};
                        let d: Array<{ url?: string, RESOLUTION?: string, BANDWIDTH?: string }> = [];
                        for (let i = 1; i < u.length; i++) {
                            if (u[i].search('tps://') == 2) {
                                o.url = u[i];
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
                        console.log(d);

                    } else {
                        console.log("Произошла ошибка: " + error);
                    }
                });

            } else {
                console.log("Произошла ошибка: " + error);
            }
        });
    }
}

const mediaServerRequest = new MediaServerRequest();
mediaServerRequest.processMediaServerRequest();
