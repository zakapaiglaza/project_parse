import AxiosUtils from "./responseUtils.ts/axiosUtils";
import CheerioUtils from "./responseUtils.ts/cheerioUtils";
import CryptoUtils from "./responseUtils.ts/cryptoUtils";

class Parser {
    сryptoJSAesDecrypt(passphrase: string, encryptedJsonString: string): string {
        return CryptoUtils.aesDecrypt(passphrase, encryptedJsonString);
    }

    checkQuality(url: string, callback: (error: any, res: any[]) => void = (error: any, res: any[]) => { }): void {
        AxiosUtils.get(url).then(response => {
            let u = response.data.split(`new Playerjs(`)[1].split(`});`)[0].split(`file:"`)[1].split('"')[0];
            AxiosUtils.get(u).then(response => {
                let u = response.data.split(/\r?\n/)
                let o: any = {}
                let d: any[] = [];
                for (let i = 1; i < u.length; i++) {
                    if (u[i].search('tps://') == 2) {
                        o.url = u[i]
                    } else if (u[i]) {
                        let h = u[i].split(':')[1].split(',')
                        o.resolution = h[0].split('RESOLUTION=')[1]
                        o.bandwidth = h[1].split('BANDWIDTH=')[1]
                    }
                    if (Object.keys(o).length == 3) {
                        d.push(o);
                        o = {};
                    }
                }
                // console.log('Processed data:', d);
                callback(null, d);
            }).catch(error => {
                callback(error, []);
            });
        }).catch(error => {
            callback(error, []);
        });
    }

    getPlayerData(url: string, callBack: (error: any, data: any) => void): void {
        AxiosUtils.get(url).then(response => {
            try {
                const body = response.data;
                let $ = CheerioUtils.parseBody(body);
                let data = $("player-control ");
                let title = $("title").text();
                title = title.split('«')[1].split('»')[0];

                let encrypted: string = data.attr('data-tag1') || '';
                let code = '297796CCB81D2551'; //TODO:
                let decrypted: string = this.сryptoJSAesDecrypt(code, encrypted).replace(/\\/g, '');
                let res = JSON.parse(decrypted);

                callBack(null, {
                    title: title,
                    img: $('article .fimg.img-wide img').attr('src'),
                    info: $('article .short-list.fx-1').text().trim(),
                    data: res
                });
            } catch (e) {
                callBack(e, null);
            }
        }).catch(e => {
            console.error('Get player data error:', e);
            callBack(e, null);
        });
    }

}

export default Parser;
