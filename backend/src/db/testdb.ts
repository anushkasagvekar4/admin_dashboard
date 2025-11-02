import db from "./knexInstance";

async function test() {
  try {
    const result = await db.raw("SELECT NOW()");
    console.log("✅ Connected successfully:", result.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await db.destroy();
  }
}

test();
