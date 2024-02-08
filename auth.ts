import electron from "electron";
import url from "url";
import ElectronStore from "electron-store";
import WebContents = Electron.WebContents;

const store = new ElectronStore();

interface JWT {
    access_token: string
    refresh_token: string
    expire_at: Date
}
const getAccessToken = async (): Promise<string | null> => {
    let jwt: JWT = <JWT>store.get('jwt')
    if (!jwt) return null;

    if (jwt.expire_at > new Date()) {
        return jwt.access_token
    }

    const response = await fetch('http://20.214.207.225:5000/token/refresh', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt.refresh_token}`,
        },
    })
    let responseText = response.text();
    console.log("1234", await responseText)
    if (!response.ok || !responseText) {
        return null;
    }
    jwt = jwtParse(await responseText);
    store.set('jwt', jwt)

    return jwt.access_token
}

const jwtParse = (code: string): JWT => {
    console.log("124", code)
    const decodedJwt = JSON.parse(code)
    return {
        access_token: decodedJwt.access_token,
        refresh_token: decodedJwt.refresh_token,
        expire_at: new Date(new Date().getTime() + (1000 * decodedJwt.expires_in))
    };
}

export function init(sender: WebContents) {
    electron.app.on('open-url', function (_, urlString) {
        const endpoint = url.parse(urlString);
        if (!endpoint.query) return
        const searchParams = new URLSearchParams(endpoint.query)
        let code = searchParams.get("code")
        if (!code) return
        store.set('jwt', jwtParse(Buffer.from(code, 'base64').toString('utf8')))
        sender.send(`auth`, getAccessToken());
    })

    electron.ipcMain.handle('auth:start', async (event) => {
        const token = await getAccessToken()
        if (token) {
            event.sender.send('auth:done', token)
        } else {
            await electron.shell.openExternal('http://20.214.207.225:5000/oauth/discord')
        }
    })

    electron.ipcMain.handle('auth:id', async (): Promise<null|number> => {
        const token = await getAccessToken()
        if (!token) return null;
        const payloadString = token.split('.')[1]
        const payload = JSON.parse(payloadString)
        return payload.id;
    })
}