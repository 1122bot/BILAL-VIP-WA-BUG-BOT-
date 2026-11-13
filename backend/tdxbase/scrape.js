/*

# Base By TdX Division
# Owner ? : t.me/bilal_babar_982
!- do not delete this credit

*/

// Thanks To Kyuu ( github.com/kiuur )

const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const ws = require("ws")
const fetch = require("node-fetch")
const { v4: uuidv4 } = require('uuid');

async function generateDeepImg({ prompt, style = 'default', size = '1:1' }) {
  const sizeList = {
    '1:1': '1024x1024',
    '3:2': '1080x720',
    '2:3': '720x1080'
  };

  const styleList = {
    'default': '-style Realism',
    'ghibli': '-style Ghibli Art',
    'cyberpunk': '-style Cyberpunk',
    'anime': '-style Anime',
    'portrait': '-style Portrait',
    'chibi': '-style Chibi',
    'pixel art': '-style Pixel Art',
    'oil painting': '-style Oil Painting',
    '3d': '-style 3D'
  };

  if (!prompt) throw new Error('Parameter prompt wajib diisi.');
  if (!styleList[style]) throw new Error(`Style tidak valid. Pilihan: ${Object.keys(styleList).join(', ')}`);
  if (!sizeList[size]) throw new Error(`Size tidak valid. Pilihan: ${Object.keys(sizeList).join(', ')}`);

  const device_id = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  try {
    const { data } = await axios.post(
      'https://api-preview.apirouter.ai/api/v1/deepimg/flux-1-dev',
      {
        device_id,
        prompt: prompt + ' ' + styleList[style],
        size: sizeList[size],
        n: '1',
        output_format: 'png'
      },
      {
        headers: {
          'content-type': 'application/json',
          origin: 'https://deepimg.ai',
          referer: 'https://deepimg.ai/',
          'user-agent': 'Mozilla/5.0'
        }
      }
    );

    return {
      status: true,
      prompt,
      style,
      size,
      image: data.data.images[0].url
    };

  } catch (error) {
    return {
      status: false,
      message: 'Gagal generate gambar',
      error: error.message
    };
  }
}

/*(async () => {
  const result = await generateDeepImg({ prompt: 'pemandangan gunung', style: 'ghibli', size: '1:1' });
  console.log(result);
})();*/

async function venicechat(question) {
    try {
        if (!question) throw new Error('Question is required');
        
        const { data } = await axios.request({
            method: 'POST',
            url: 'https://outerface.venice.ai/api/inference/chat',
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://venice.ai',
                referer: 'https://venice.ai/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                'x-venice-version': 'interface@20250523.214528+393d253'
            },
            data: JSON.stringify({
                requestId: 'nekorinn',
                modelId: 'dolphin-3.0-mistral-24b',
                prompt: [
                    {
                        content: question,
                        role: 'user'
                    }
                ],
                systemPrompt: '',
                conversationType: 'text',
                temperature: 0.8,
                webEnabled: true,
                topP: 0.9,
                isCharacter: false,
                clientProcessingTime: 15
            })
        });
        
        const chunks = data.split('\n').filter(chunk => chunk).map(chunk => JSON.parse(chunk));
        const result = chunks.map(chunk => chunk.content).join('');
        
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

async function gpt(prompt) {
    try {
        const { data } = await axios.post(
            'https://us-central1-openaiprojects-1fba2.cloudfunctions.net/chat_gpt_ai/api.live.text.gen',
            {
                model: 'gpt-4o-mini',
                temperature: 0.2,
                top_p: 0.2,
                prompt: prompt
            },
            {
                headers: {
                    'content-type': 'application/json; charset=UTF-8'
                }
            }
        );

        return {
            response: data.choices?.[0]?.message?.content || "No response"
        };
    } catch (error) {
        return {
            response: "Error: " + error.message
        };
    }
}

const endpoint = "https://iloveyt.net/proxy.php";


async function ytdownload(videoUrl) {
  try {
    const res = await axios.post(endpoint, new URLSearchParams({ url: videoUrl }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
        "Referer": "https://iloveyt.net/en47/",
        "Origin": "https://iloveyt.net",
      },
    });


    if (!res.data?.api || res.data.api?.status !== "OK") {
      return { mp3: null, mp4: null };
    }

    const api = res.data.api;

    if (!Array.isArray(api.mediaItems)) {
      return { mp3: null, mp4: null };
    }

    const audioItems = api.mediaItems.filter(
      item => item.mediaExtension?.toUpperCase() === "M4A"
    );
    const videoItems = api.mediaItems.filter(
      item => item.mediaExtension?.toUpperCase() === "MP4"
    );

    const audio128 = audioItems.find(item => item.mediaQuality === "128K");
    const video360 = videoItems.find(item => item.mediaRes === "640x360");

    let mp3 = null;
    let mp4 = null;

    if (audio128?.mediaUrl) {
      const r = await axios.get(audio128.mediaUrl);
      mp3 = r.data?.fileUrl || null;
    }

    if (video360?.mediaUrl) {
      const r = await axios.get(video360.mediaUrl);
      mp4 = r.data?.fileUrl || null;
    }

    return { mp3, mp4 };
  } catch (error) {
    console.error("YouTube download error:", error.message);
    return { mp3: null, mp4: null };
  }
}


function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function getNonce() {
    try {
        const { data } = await axios.get("https://chatgpt4o.one/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive"
            }
        });
        const $ = cheerio.load(data);
        return $("div.wpaicg-chat-shortcode").attr("data-nonce") || null;
    } catch (error) {
        console.error("Error fetching nonce:", error.message);
        return null;
    }
}

async function chatWithGPT(message) {
    try {
        const nonce = await getNonce();
        if (!nonce) throw new Error("Failed to get nonce.");

        const clientId = generateRandomString(10);
        const formData = new FormData();
        formData.append("_wpnonce", nonce);
        formData.append("post_id", 11);
        formData.append("url", "https://chatgpt4o.one/");
        formData.append("action", "wpaicg_chat_shortcode_message");
        formData.append("message", message);
        formData.append("bot_id", 0);
        formData.append("chatbot_identity", "shortcode");
        formData.append("wpaicg_chat_history", JSON.stringify([]));
        formData.append("wpaicg_chat_client_id", clientId);

        const { data } = await axios.post(
            "https://chatgpt4o.one/wp-admin/admin-ajax.php",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Origin": "https://chatgpt4o.one",
                    "Referer": "https://chatgpt4o.one/",
                    "X-Requested-With": "XMLHttpRequest"
                }
            }
        );

        return data;
    } catch (error) {
        console.error("Error sending message:", error.message);
        throw new Error("No result found");
    }
}

class QwenVideo {
    constructor() {
        this.headers = {
             accept: '/',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTI0YWVhLTNjMjEtNDgwMi05YWY0LTdjZThkNmEwZTE3MSIsImV4cCI6MTc1MDA5MTA2OX0.sDC1jJ4WPlyGzgVi6x6m4vQ31miAOxa1MedflPNKG38',
            'bx-v': '2.5.28',
            'content-type': 'application/json',
            cookie: '_gcl_aw=GCL.1744865954.EAIaIQobChMI04zMmaTejAMVibpLBR0vgx8VEAAYASAAEgK8aPD_BwE; _gcl_gs=2.1.k1$i1744865952$u64539133; _gcl_au=1.1.1153047962.1744865954; _bl_uid=7jmmh9e2ksXwg25g02g8jXsjmn64; acw_tc=0a03e55a17474990039571388e56a2dd601a641b88c7c4cf572eed257291c4; x-ap=ap-southeast-5; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTI0YWVhLTNjMjEtNDgwMi05YWY0LTdjZThkNmEwZTE3MSIsImV4cCI6MTc1MDA5MTA3OH0.W87CVNXvRVE2ZZ2SaAGAThhRC0Ro_4vnENwoXxfC698; ssxmod_itna=Yqfx0D9DBAeeT4eIqmq4iu0xYTxewDAQDXDUdnq7U=GcD8OD0PO+6r5GkUnEAQ05Gq0Q45omR=DlgG0AiDCuPGfDQcYHOQQbhi5YzB7Oi3tK122GmqTst=+x3b8izRu4adC0=6D74i8Nxi1DG5DGexDRxikD7v4pE0YDeeDtx0rlxirP4D3DeaGrDDkDQKDXEA+D0bhbUx+iO8vDiPD=xi3PzD4j40TDD5W7F7IWaAiuCkbF8fEDCIAhWYDoZeE2noAwz8fytRDHmeBwAPCmdyyYYexeGD4BirrSYnwBiDtBCw/pEa6msTOUGOlRY79u+KcjFQ9R=+uCzYSe4iiGx8v4G5qu2tUiNG0w/RYYiN0DiYGzYGDD; ssxmod_itna2=Yqfx0D9DBAeeT4eIqmq4iu0xYTxewDAQDXDUdnq7U=GcD8OD0PO+6r5GkUnEAQ05Gq0Q45omRYD==R0YwKQGnxGae+O80xTODGNqT1iDyWeKWG1DP4CEKzCguiCBPQ+ytntiBGxjLwGQlDw4hATY4AY0dIRv/AS0er0hPdwUxW7r4U72xbAifUQude8L4VRfuUmD0/gufFDLKI45mQ7GQUDx9AB4XCAR0W7md7f7huOvdSx4P/pG+k4+re9DxD; SERVERID=c6e9a4f4599611ff2779ff17d05dde80|1747499111|1747499003; tfstk=gJZsWaZHGrsngaovhVXEFMViEDoX59Sy6KMYE-KwHcntGKN4eqHwbO4bRSPs6lot6BHjIAhxHnetGmNrHVKxkh3bAAkjHdet6DdLaSYOIVHx9pHiXq4Zgfljc-V5L_SP4R2imcCPagoivBStqhLvDIuppYojBzxEkO2immCFsrBzxRVi6QFaBmBIvxMtBm3tH2BIhYGxDf3v9eH-9mnxMVhppxkSBCLtk9wKtxnxMS3OdDhnHeCNlvISZR6i-qIseK6gQXtvDkMCdbyswvcQAAgsXyhBDYrICVG8QutYbQM7PkgzWOQt9l28uo3pd9n0LzNbkJBWyjaaUlgSciOSKyeujre1A_etfXmtEy1Wjcy7J8qimK8ibzyzm4EOfQcErxwSAkCpxjz8eDsrS3lWUXLXofKxdbWCdEYme5JLx5-2leutKvvNd9T4KVHndbWCdEYmWvD3u96BuJf..; isg=BBAQ2i6nTLt-yhCXMHk2N4Wb4Vxi2fQjOuiJTgrh1Ws-RaLvsOi0sns7GFMA1az7',
            host: 'chat.qwen.ai',
            origin: 'https://chat.qwen.ai',
            referer: 'https://chat.qwen.ai/',
            'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'source': 'h5',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'version': '0.0.101',
            'x-request-id': uuidv4()
        };
    }

    async getTask(prompt, ratio, type) {
        const resp = await axios.post('https://chat.qwen.ai/api/chat/completions', {
            stream: false,
            chat_type: type,
            sub_chat_type: type,
            model: 'qwen3-235b-a22b',
            size: ratio,
            messages: [{ role: 'user', content: prompt }],
            session_id: uuidv4(),
            chat_id: uuidv4(),
            id: uuidv4()
        }, {
            headers: this.headers
        });

        if (resp.status !== 200) throw new Error('Failed to get task');
        return resp.data.messages[1].extra.wanx.task_id;
    }

    async checkTask(id) {
        while (true) {
            const { data } = await axios.get(`https://chat.qwen.ai/api/v1/tasks/status/${id}`, {
                headers: this.headers
            });

            if (data.task_status === 'running') continue;
            if (data.task_status === 'success') return data.content;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async create(prompt, ratio = '1:1') {
        try {
            const allowedRatios = ['1:1', '3:4', '4:3', '16:9', '9:16'];
            const type = 't2v'; // Locked type

            if (!prompt) throw new Error('Prompt is required');
            if (!allowedRatios.includes(ratio)) throw new Error(`Available ratios: ${allowedRatios.join(', ')}`);

            const task_id = await this.getTask(prompt, ratio, type);
            const result = await this.checkTask(task_id);

            return result;
        } catch (error) {
            console.error(error.message);
            throw new Error('No result found');
        }
    }
}

async function qwentxt2vid(x, rasio) {
    try {
        const qwen = new QwenVideo();
        const result = await qwen.create(x, rasio); // rasio ( "16:9" )
        console.log(result);
    } catch (err) {
        console.error(err.message);
    }
}

class QwenImage {
    constructor() {
        this.headers = {
             accept: '/',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTI0YWVhLTNjMjEtNDgwMi05YWY0LTdjZThkNmEwZTE3MSIsImV4cCI6MTc1MDA5MTA2OX0.sDC1jJ4WPlyGzgVi6x6m4vQ31miAOxa1MedflPNKG38',
            'bx-v': '2.5.28',
            'content-type': 'application/json',
            cookie: '_gcl_aw=GCL.1744865954.EAIaIQobChMI04zMmaTejAMVibpLBR0vgx8VEAAYASAAEgK8aPD_BwE; _gcl_gs=2.1.k1$i1744865952$u64539133; _gcl_au=1.1.1153047962.1744865954; _bl_uid=7jmmh9e2ksXwg25g02g8jXsjmn64; acw_tc=0a03e55a17474990039571388e56a2dd601a641b88c7c4cf572eed257291c4; x-ap=ap-southeast-5; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTI0YWVhLTNjMjEtNDgwMi05YWY0LTdjZThkNmEwZTE3MSIsImV4cCI6MTc1MDA5MTA3OH0.W87CVNXvRVE2ZZ2SaAGAThhRC0Ro_4vnENwoXxfC698; ssxmod_itna=Yqfx0D9DBAeeT4eIqmq4iu0xYTxewDAQDXDUdnq7U=GcD8OD0PO+6r5GkUnEAQ05Gq0Q45omR=DlgG0AiDCuPGfDQcYHOQQbhi5YzB7Oi3tK122GmqTst=+x3b8izRu4adC0=6D74i8Nxi1DG5DGexDRxikD7v4pE0YDeeDtx0rlxirP4D3DeaGrDDkDQKDXEA+D0bhbUx+iO8vDiPD=xi3PzD4j40TDD5W7F7IWaAiuCkbF8fEDCIAhWYDoZeE2noAwz8fytRDHmeBwAPCmdyyYYexeGD4BirrSYnwBiDtBCw/pEa6msTOUGOlRY79u+KcjFQ9R=+uCzYSe4iiGx8v4G5qu2tUiNG0w/RYYiN0DiYGzYGDD; ssxmod_itna2=Yqfx0D9DBAeeT4eIqmq4iu0xYTxewDAQDXDUdnq7U=GcD8OD0PO+6r5GkUnEAQ05Gq0Q45omRYD==R0YwKQGnxGae+O80xTODGNqT1iDyWeKWG1DP4CEKzCguiCBPQ+ytntiBGxjLwGQlDw4hATY4AY0dIRv/AS0er0hPdwUxW7r4U72xbAifUQude8L4VRfuUmD0/gufFDLKI45mQ7GQUDx9AB4XCAR0W7md7f7huOvdSx4P/pG+k4+re9DxD; SERVERID=c6e9a4f4599611ff2779ff17d05dde80|1747499111|1747499003; tfstk=gJZsWaZHGrsngaovhVXEFMViEDoX59Sy6KMYE-KwHcntGKN4eqHwbO4bRSPs6lot6BHjIAhxHnetGmNrHVKxkh3bAAkjHdet6DdLaSYOIVHx9pHiXq4Zgfljc-V5L_SP4R2imcCPagoivBStqhLvDIuppYojBzxEkO2immCFsrBzxRVi6QFaBmBIvxMtBm3tH2BIhYGxDf3v9eH-9mnxMVhppxkSBCLtk9wKtxnxMS3OdDhnHeCNlvISZR6i-qIseK6gQXtvDkMCdbyswvcQAAgsXyhBDYrICVG8QutYbQM7PkgzWOQt9l28uo3pd9n0LzNbkJBWyjaaUlgSciOSKyeujre1A_etfXmtEy1Wjcy7J8qimK8ibzyzm4EOfQcErxwSAkCpxjz8eDsrS3lWUXLXofKxdbWCdEYme5JLx5-2leutKvvNd9T4KVHndbWCdEYmWvD3u96BuJf..; isg=BBAQ2i6nTLt-yhCXMHk2N4Wb4Vxi2fQjOuiJTgrh1Ws-RaLvsOi0sns7GFMA1az7',
            host: 'chat.qwen.ai',
            origin: 'https://chat.qwen.ai',
            referer: 'https://chat.qwen.ai/',
            'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'source': 'h5',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'version': '0.0.101',
            'x-request-id': uuidv4()
        };
    }

    async getTask(prompt, ratio, type) {
        const resp = await axios.post('https://chat.qwen.ai/api/chat/completions', {
            stream: false,
            chat_type: type,
            sub_chat_type: type,
            model: 'qwen3-235b-a22b',
            size: ratio,
            messages: [{ role: 'user', content: prompt }],
            session_id: uuidv4(),
            chat_id: uuidv4(),
            id: uuidv4()
        }, {
            headers: this.headers
        });

        if (resp.status !== 200) throw new Error('Failed to get task');
        return resp.data.messages[1].extra.wanx.task_id;
    }

    async checkTask(id) {
        while (true) {
            const { data } = await axios.get(`https://chat.qwen.ai/api/v1/tasks/status/${id}`, {
                headers: this.headers
            });

            if (data.task_status === 'running') continue;
            if (data.task_status === 'success') return data.content;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async create(prompt, ratio = '1:1') {
        try {
            const allowedRatios = ['1:1', '3:4', '4:3', '16:9', '9:16'];
            const type = 't2i'; // Locked type

            if (!prompt) throw new Error('Prompt is required');
            if (!allowedRatios.includes(ratio)) throw new Error(`Available ratios: ${allowedRatios.join(', ')}`);

            const task_id = await this.getTask(prompt, ratio, type);
            const result = await this.checkTask(task_id);

            return result;
        } catch (error) {
            console.error(error.message);
            throw new Error('No result found');
        }
    }
}

async function qwentxt2img(x, rasio) {
    try {
        const qwen = new QwenImage();
        const result = await qwen.create(x, rasio); // rasio ( "16:9" )
        console.log(result);
    } catch (err) {
        console.error(err.message);
    }
}

async function ytmp3(url) {
  const headers = {
    "accept": "*/*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://id.ytmp3.mobi/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }

  try {
    // inisialisasi API
    const initial = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers })
    const init = initial.data

    // ambil id youtube
    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1]
    if (!id) throw new Error("Gagal mengambil ID video.")

    // buat URL konversi
    const format = 'mp3'
    const convertURL = `${init.convertURL}&v=${id}&f=${format}&_=${Math.random()}`

    // mulai konversi
    const converts = await axios.get(convertURL, { headers })
    const convert = converts.data

    // progress check
    let info = {}
    for (let i = 0; i < 3; i++) {
      const j = await axios.get(convert.progressURL, { headers })
      info = j.data
      console.log(`Progress (${i + 1}):`, info)
      if (info.progress === 3) break
      await new Promise(res => setTimeout(res, 1000)) // jeda 1 detik biar nggak diblok
    }

    return {
      url: convert.downloadURL,
      title: info.title || convert.title || 'Unknown'
    }
  } catch (error) {
    console.error('Terjadi kesalahan ytmp3:', error.message)
    return null
  }
}

async function ytmp4(url) {
  const headers = {
    "accept": "*/*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://id.ytmp3.mobi/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }

  try {
    const initial = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers })
    const init = initial.data

    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1]
    if (!id) throw new Error("Gagal mengambil ID video.")

    const format = 'mp4'
    const convertURL = `${init.convertURL}&v=${id}&f=${format}&_=${Math.random()}`

    const converts = await axios.get(convertURL, { headers })
    const convert = converts.data

    let info = {}
    for (let i = 0; i < 3; i++) {
      const j = await axios.get(convert.progressURL, { headers })
      info = j.data
      console.log(`Progress (${i + 1}):`, info)
      if (info.progress === 3) break
      await new Promise(res => setTimeout(res, 1000))
    }

    return {
      url: convert.downloadURL,
      title: info.title || convert.title || 'Unknown'
    }
  } catch (error) {
    console.error('Terjadi kesalahan ytmp4:', error.message)
    return null
  }
}

module.exports = { generateDeepImg, venicechat, gpt, chatWithGPT, ytdownload, qwentxt2img, qwentxt2vid, ytmp3, ytmp4 };