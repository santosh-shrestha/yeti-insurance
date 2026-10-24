/**
 * Live Google reviews for the website.
 * GET /.netlify/functions/google-reviews  →  { rating, count, url, reviews: [...] }
 *
 * Uses Google Places API (New) → Place Details. The API key stays on the server.
 * Netlify environment variables:
 *   GOOGLE_PLACES_API_KEY  – API key with "Places API (New)" enabled (restrict it to that API)
 *   GOOGLE_PLACE_ID        – the agency's Place ID (find it with Google's Place ID Finder)
 *
 * The response is cached on Netlify's CDN for 24 hours, so Google is called about once a day
 * no matter how many people visit. Google returns at most 5 reviews ("most relevant").
 */
const FIELDS = "rating,userRatingCount,googleMapsUri,reviews";

exports.handler = async () => {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const json = (status, body, cache) => ({
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=900",
      "Netlify-CDN-Cache-Control": cache || "public, durable, s-maxage=86400, stale-while-revalidate=604800",
    },
    body: JSON.stringify(body),
  });

  if (!key || !placeId) return json(200, { ok: false, error: "not configured" }, "no-store");

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELDS },
    });
    if (!res.ok) {
      console.error("Places API error", res.status, (await res.text()).slice(0, 300));
      return json(200, { ok: false, error: "google " + res.status }, "public, s-maxage=300");
    }
    const p = await res.json();
    const reviews = (p.reviews || [])
      .map(r => ({
        author: r.authorAttribution?.displayName || "Google user",
        authorUrl: r.authorAttribution?.uri || "",
        photo: r.authorAttribution?.photoUri || "",
        rating: r.rating || 0,
        text: (r.text?.text || r.originalText?.text || "").trim(),
        when: r.relativePublishTimeDescription || "",
        url: r.googleMapsUri || "",
      }))
      .filter(r => r.text);
    return json(200, { ok: true, rating: p.rating || null, count: p.userRatingCount || null, url: p.googleMapsUri || "", reviews });
  } catch (err) {
    console.error("Places API request failed:", err.message);
    return json(200, { ok: false, error: "request failed" }, "public, s-maxage=300");
  }
};
