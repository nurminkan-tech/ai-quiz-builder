module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Тек POST сұранысы қабылданады." });
    return;
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Сұраныста 'prompt' өрісі жоқ." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Серверде ANTHROPIC_API_KEY орнатылмаған. Vercel-дегі Environment Variables бөлімін тексеріңіз." });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || "Anthropic API қатесі." });
      return;
    }

    const text = (data.content || []).map((b) => b.text || "").join("\n");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Сервер қатесі: " + e.message });
  }
};
