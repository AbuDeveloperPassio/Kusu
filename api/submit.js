const { MongoClient } = require("mongodb");

let client = global._kusuMongoClient;

async function getCollection() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!client) {
    const c = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 });
    await c.connect();
    client = global._kusuMongoClient = c;
  }
  return client.db(process.env.MONGODB_DB || "kusu").collection("submissions");
}

const FIELDS = { name: 100, email: 150, phone: 30, age: 3, gender: 30, city: 100, message: 2000 };

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const b = req.body && typeof req.body === "object" ? req.body : {};
  if (b.website) return res.status(200).json({ ok: true }); // honeypot

  const doc = {};
  for (const [key, max] of Object.entries(FIELDS)) {
    doc[key] = String(b[key] == null ? "" : b[key]).trim().slice(0, max);
  }
  if (!doc.name || !/^\S+@\S+\.\S+$/.test(doc.email)) {
    return res.status(400).json({ ok: false, error: "Name and a valid email are required" });
  }
  doc.createdAt = new Date();

  try {
    const col = await getCollection();
    await col.insertOne(doc);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    client = global._kusuMongoClient = undefined;
    return res.status(500).json({ ok: false, error: "Could not save. Try again later." });
  }
};
