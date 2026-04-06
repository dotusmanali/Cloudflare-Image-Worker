# 🖼️ Cloudflare AI Image Worker — Free Image Generation API

> 🚫 **No need to pay for any image AI.**
> Use this to get **~100,000 free AI image generations per day** powered by Cloudflare Workers AI — no credit card, no Midjourney subscription, no GPU, no server needed.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dotusmanali/cloudflare-image-worker)

---

## 💡 What Is This?

Cloudflare gives you **free AI power** through their Workers platform.

This project turns that free AI power into a simple **image generation API** — you send it a text description ("a cat sitting on the moon"), and it sends back an AI-generated image. Just like Midjourney or DALL-E, but **100% free**.

You can use this with **n8n, Make.com, your own website, Python scripts** — anything.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🆓 **100% Free** | Cloudflare free tier — no credit card needed |
| 🔐 **Auth Protected** | Your own secret API key — only you can use it |
| 🌐 **CORS Enabled** | Works from any website, n8n, Make.com, Postman |
| 🎨 **Multiple Models** | 4 different AI image models to choose from |
| 📦 **OpenAI Format** | Same response format as OpenAI — easy to integrate anywhere |
| 🖼️ **Base64 Output** | Image comes back as base64 — works everywhere, no storage needed |

---

## 🎨 Available AI Models (All Free)

```
@cf/black-forest-labs/flux-1-schnell        ← Recommended (Best + Fastest)
@cf/bytedance/stable-diffusion-xl-lightning ← Very fast, realistic
@cf/stabilityai/stable-diffusion-xl-base-1.0 ← High quality
@cf/lykon/dreamshaper-8-lcm                 ← Artistic / stylized
```

---

## 🚀 Step-by-Step Deployment Guide

> 📌 **You don't need to know coding.** Just follow these steps one by one.

---

### Step 1 — Create a Free Cloudflare Account

Go to 👉 [https://dash.cloudflare.com](https://dash.cloudflare.com)

If you don't have an account, click **Sign Up** — it's free, no credit card needed.

After logging in, look at the **left sidebar** and click on **"Workers & Pages"**.

---

### Step 2 — Create a New Worker

Click the **"Create"** button (top right area).

You will see options. Click **"Start with Hello World!"**.

Fill in:
- **Worker name** → Type any name you like. Example: `my-image-ai`

Click **"Deploy"**.

> ✅ You just created your worker! Now let's set it up properly.

---

### Step 3 — Enable Workers AI (The AI Brain)

After deploying, you'll land on your worker's overview page.

Look for a section called **"Bindings"** and click on it.

A panel will open. Look for **"Workers AI"** and click it.

A form will appear. In the **"Variable name"** field, type exactly:

```
AI
```

> ⚠️ **Very important:** It must be `AI` in ALL CAPITAL LETTERS. This is how the code talks to the AI.

Click **"Save"** or **"Add binding"**.

---

### Step 4 — Set Your Secret API Key

Now click on the **"Settings"** tab of your Worker.

Scroll down to find **"Variables and Secrets"**.

Click **"Add"**. A small form appears. Fill it like this:

| Field | What to type |
|---|---|
| **Type** | Select `Secret` |
| **Variable name** | `API_KEY` |
| **Value** | Make up your own password. Example: `my-secret-key-2024` |

> 🔐 **Think of API_KEY like a password for your worker.** Anyone who has this key can use your worker to generate images. Keep it private!

> ⚠️ **Important:** Variable name MUST be exactly `API_KEY` (capital letters, underscore in middle).

Click **"Deploy"** to save.

---

### Step 5 — Paste the Worker Code

Click **"Edit Code"** (button at the top right of the worker page).

A code editor will open. Do this:
1. Click anywhere inside the code box
2. Press **`Ctrl+A`** (Windows) or **`Cmd+A`** (Mac) to select ALL existing code
3. Press **`Delete`** or **`Backspace`** to delete it
4. Copy the entire code from [`worker.js`](./worker.js) in this repo
5. Paste it into the editor

Click **"Deploy"** (top right button).

---

### Step 6 — Get Your Worker URL 🎉

At the top of the worker page, you'll see your URL. It looks like this:

```
https://my-image-ai.YOUR-SUBDOMAIN.workers.dev
```

**That's your free image generation API!** You're done with setup.

---

## 📡 How to Use the API

> 📌 Think of the API like a vending machine:
> - You put in a **prompt** (your image description) + your **API key**
> - It gives you back a **generated image** (as base64 data)

---

### 🧪 Test It First — Health Check

Open this in your browser (no login needed):

```
https://my-image-ai.your-subdomain.workers.dev/health
```

You should see:
```json
{
  "status": "ok",
  "models": ["@cf/black-forest-labs/flux-1-schnell", "..."]
}
```

If you see this, your worker is alive and working! ✅

---

### 🖼️ Generate an Image

Send a POST request to your worker:

```bash
curl -X POST https://my-image-ai.your-subdomain.workers.dev/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a cat sitting on the moon, photorealistic, 4K",
    "model": "@cf/black-forest-labs/flux-1-schnell",
    "n": 1
  }'
```

### 📬 What You Get Back

```json
{
  "created": 1700000000,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",
      "revised_prompt": "a cat sitting on the moon, photorealistic, 4K"
    }
  ],
  "model": "@cf/black-forest-labs/flux-1-schnell"
}
```

> 📌 **What is `b64_json`?**
> It's your image — but converted into text (called Base64). To actually see the image, you need to decode it. Every tool (n8n, Make.com, Python, JavaScript) knows how to decode it. Examples are below!

---

## 🔧 How to Use in n8n

### Step 1 — Add HTTP Request Node

In your n8n workflow, click the **+** button and search for **"HTTP Request"**. Add it.

### Step 2 — Configure It

Inside the HTTP Request node, set:

| Setting | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `https://my-image-ai.your-subdomain.workers.dev/v1/images/generations` |

### Step 3 — Add Your API Key (Header Auth)

Click **"Add Header"** and fill:

| Header Name | Header Value |
|---|---|
| `Authorization` | `Bearer YOUR_API_KEY` |
| `Content-Type` | `application/json` |

> 📌 **What is "Bearer"?**
> It's just a word that tells the server "here comes my password". You always write `Bearer ` then your actual key. Example: `Bearer my-secret-key-2024`

### Step 4 — Set the Body

Set Body type to **JSON** and paste:

```json
{
  "prompt": "{{ $json.prompt }}",
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "n": 1
}
```

> `{{ $json.prompt }}` means "take the prompt from the previous n8n step". You can also hardcode text like `"a sunset over mountains"`.

### Step 5 — Get the Image

The image is inside: `{{ $json.data[0].b64_json }}`

To convert base64 to an actual image file, add a **"Move Binary Data"** node after this:
- **From** → JSON
- **Property name** → `data[0].b64_json`
- **MIME type** → `image/png`

Now you can send this image to Google Drive, email, Telegram, Discord — anywhere!

---

## 🔧 How to Use in Make.com

### Step 1 — Add HTTP Module

In your Make.com scenario, click **+** and search for **"HTTP"**. Add **"Make a request"**.

### Step 2 — Set It Up

| Field | Value |
|---|---|
| **URL** | `https://my-image-ai.your-subdomain.workers.dev/v1/images/generations` |
| **Method** | `POST` |

### Step 3 — Add Headers

Click **"Add item"** under Headers:

| Header Name | Value |
|---|---|
| `Authorization` | `Bearer YOUR_API_KEY` |
| `Content-Type` | `application/json` |

### Step 4 — Set the Body

Set Body type to **Raw** → format: **JSON**, then paste:

```json
{
  "prompt": "{{1.prompt}}",
  "model": "@cf/black-forest-labs/flux-1-schnell"
}
```

### Step 5 — Decode the Image

The image is at: `data > 0 > b64_json`

Add a **Tools → Base64 Decode** module to convert it to binary. Then you can upload to Google Drive, send via Gmail, post to Slack, etc.

---

## 🔧 Use in Your Own Code

### JavaScript (Browser or Node.js)

```javascript
const response = await fetch('https://my-image-ai.your-subdomain.workers.dev/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    prompt: 'a dragon flying over mountains at sunset',
    model: '@cf/black-forest-labs/flux-1-schnell',
  }),
});

const data = await response.json();
const base64 = data.data[0].b64_json;

// Show image in browser
document.querySelector('img').src = `data:image/png;base64,${base64}`;
```

### Python

```python
import requests
import base64

response = requests.post(
    'https://my-image-ai.your-subdomain.workers.dev/v1/images/generations',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'a dragon flying over mountains at sunset',
        'model': '@cf/black-forest-labs/flux-1-schnell',
    }
)

b64 = response.json()['data'][0]['b64_json']

# Save to file
with open('my_image.png', 'wb') as f:
    f.write(base64.b64decode(b64))

print("Image saved!")
```

---

## 🎛️ All API Parameters

When sending a request, you can include these options:

| Parameter | Required? | Default | What It Does |
|---|---|---|---|
| `prompt` | ✅ Yes | — | Describe what image you want |
| `model` | No | `flux-1-schnell` | Which AI model to use |
| `n` | No | `1` | How many images to generate (max 4) |
| `num_inference_steps` | No | `4` | Higher = better quality but slower (max 20) |
| `guidance_scale` | No | `7.5` | How closely AI follows your prompt (1–20) |
| `negative_prompt` | No | — | What you DON'T want in the image |

---

## 💡 Prompt Tips

- Be descriptive: `"a futuristic Tokyo street at night, neon lights, rain, cinematic"`
- Mention style: add `photorealistic`, `anime style`, `oil painting`, `3D render`
- Mention quality: add `4K`, `ultra detailed`, `high resolution`
- Use negative prompt to avoid: `"blurry, low quality, watermark, text"`

---

## 🧪 Test the UI

Open `test-ui/index.html` directly in your browser — no installation needed.

Enter your Worker URL and API key, pick a model, type a prompt, and click Generate. You can see the image, download it, copy the base64, and view the raw API response.

---

## 📁 Project Structure

```
cloudflare-image-worker/
├── worker.js          ← The main code — paste this into Cloudflare
├── wrangler.toml      ← Config file (for developers using CLI)
├── package.json       ← Package info (for developers using CLI)
├── test-ui/
│   └── index.html     ← Test the API in your browser (no install needed)
└── README.md          ← This guide
```

---

## ❓ FAQ — Common Questions

**Q: Is this really free? No hidden charges?**
A: Yes! Cloudflare's free tier gives 100,000 Worker requests per day. Workers AI is currently free in beta. Just make sure you're on the free plan and you won't be charged.

**Q: Do I need coding knowledge to set this up?**
A: No! Just follow the 6 steps above. You're only copy-pasting code, not writing any.

**Q: My API key — where do I use it?**
A: Whenever you call your worker URL, you add this header:
`Authorization: Bearer YOUR_API_KEY`
Replace `YOUR_API_KEY` with the password you set in Step 4. In n8n, Make.com — same thing, you add it as a header.

**Q: What if I lose my API key?**
A: Go to Cloudflare → Your Worker → Settings → Variables and Secrets → click edit, set a new value, deploy again.

**Q: The image is `b64_json` — how do I see it?**
A: Copy the `b64_json` value, go to [base64.guru/converter/decode/image](https://base64.guru/converter/decode/image), paste it, and click Decode — you'll see your image!

**Q: Can I use this with ChatGPT plugins or LangChain?**
A: Yes! Set the base URL to `https://your-worker.workers.dev/v1` and your API key. It speaks OpenAI format.

**Q: Difference between this and the text generation worker?**
A: [cloudflare-worker-template](https://github.com/dotusmanali/cloudflare-worker-template) is for **text/chat** (like ChatGPT). This repo is for **image generation** (like DALL-E / Midjourney).

---

## 🔒 Security Tips

- Store your `API_KEY` as a **Secret** in Cloudflare — never put it directly in the code
- Don't share your API key publicly (don't paste it in GitHub, Discord, etc.)
- Anyone with your key can use your free quota — treat it like a password

---

## 🤝 Contributing

Found a bug? Want to add a feature? Pull requests are welcome!

1. Fork this repo
2. Create a branch: `git checkout -b my-new-feature`
3. Make your changes and test them
4. Open a Pull Request with a clear description

**Ideas we'd love:**
- Cloudflare R2 storage (save images and return a URL instead of base64)
- Rate limiting per API key
- More model support as Cloudflare adds them
- Image-to-image support

---

## 👨‍💻 Author

**Usman Ali** — [@dotusmanali](https://github.com/dotusmanali)

---

## ⭐ Like this project?

Give it a star ⭐ on GitHub and share it with your friends! It really helps 🙏

---

## 🔗 Related

- 📝 [cloudflare-worker-template](https://github.com/dotusmanali/cloudflare-worker-template) — Same thing but for **text / chat** generation
- 📖 [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- 🤖 [All Available Models](https://developers.cloudflare.com/workers-ai/models/)
