/**
 * Cloudflare Worker — AI Image Generator (OpenAI-Compatible API)
 *
 * Returns images in OpenAI-style JSON so you can plug this into
 * n8n, Make.com, LangChain, or any custom app with minimal changes.
 *
 * Env vars to set in Cloudflare Dashboard → Worker → Settings → Variables:
 *   API_KEY  — Your secret key. Callers must send:  Authorization: Bearer <API_KEY>
 *
 * Bindings to enable:
 *   AI — Workers AI binding (enable in Worker → Settings → AI)
 *
 * Supported models:
 *   @cf/black-forest-labs/flux-1-schnell        (fastest, great quality)
 *   @cf/stabilityai/stable-diffusion-xl-base-1.0
 *   @cf/bytedance/stable-diffusion-xl-lightning  (very fast)
 *   @cf/lykon/dreamshaper-8-lcm                  (artistic / stylized)
 *   @cf/runwayml/stable-diffusion-v1-5-img2img   (image-to-image)
 *   @cf/runwayml/stable-diffusion-v1-5-inpainting
 */

const SUPPORTED_MODELS = [
  "@cf/black-forest-labs/flux-1-schnell",
  "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  "@cf/bytedance/stable-diffusion-xl-lightning",
  "@cf/lykon/dreamshaper-8-lcm",
];

const DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return corsResponse();
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ status: "ok", models: SUPPORTED_MODELS });
    }

    if (url.pathname === "/v1/models" && request.method === "GET") {
      return handleAuth(request, env) || json({
        object: "list",
        data: SUPPORTED_MODELS.map((id) => ({
          id,
          object: "model",
          created: 1700000000,
          owned_by: "cloudflare",
        })),
      });
    }

    if (
      (url.pathname === "/" || url.pathname === "/v1/images/generations") &&
      request.method === "POST"
    ) {
      const authError = handleAuth(request, env);
      if (authError) return authError;
      return handleImageGeneration(request, env);
    }

    return json({ error: "Not found", hint: "POST /v1/images/generations" }, 404);
  },
};

async function handleImageGeneration(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const prompt = body.prompt || body.inputs;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return json({ error: "prompt is required and must be a non-empty string" }, 400);
  }

  const model = body.model || DEFAULT_MODEL;
  if (!SUPPORTED_MODELS.includes(model)) {
    return json({
      error: `Unsupported model: ${model}`,
      supported_models: SUPPORTED_MODELS,
    }, 400);
  }

  const n = Math.min(parseInt(body.n) || 1, 4);
  const steps = Math.min(parseInt(body.num_inference_steps) || 4, 20);
  const guidance = parseFloat(body.guidance_scale) || 7.5;
  const negativePrompt = body.negative_prompt || "";

  const aiParams = {
    prompt: prompt.trim(),
    num_steps: steps,
    guidance: guidance,
  };
  if (negativePrompt) aiParams.negative_prompt = negativePrompt;

  try {
    const imageResults = [];

    for (let i = 0; i < n; i++) {
      const result = await env.AI.run(model, aiParams);

      const buffer = result instanceof ArrayBuffer
        ? result
        : result?.buffer || result;

      const base64 = arrayBufferToBase64(buffer);

      if (body.response_format === "b64_json" || !body.response_format) {
        imageResults.push({ b64_json: base64, revised_prompt: prompt });
      } else {
        imageResults.push({ b64_json: base64, revised_prompt: prompt });
      }
    }

    return json({
      created: Math.floor(Date.now() / 1000),
      data: imageResults,
      model,
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4),
        total_tokens: Math.ceil(prompt.length / 4),
      },
    });
  } catch (err) {
    return json(
      {
        error: {
          message: "Image generation failed",
          type: "server_error",
          details: err.message,
        },
      },
      500
    );
  }
}

function handleAuth(request, env) {
  if (!env.API_KEY) return null;
  const auth = request.headers.get("Authorization") || "";
  if (auth !== `Bearer ${env.API_KEY}`) {
    return json(
      { error: { message: "Unauthorized", type: "auth_error" } },
      401,
      { "WWW-Authenticate": "Bearer" }
    );
  }
  return null;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
  });
}

function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
