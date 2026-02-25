const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Create table if it doesn't exist (runs on first submission)
    await sql`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        form_type TEXT NOT NULL,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        service TEXT,
        message TEXT,
        business TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const body = JSON.parse(event.body);
    const { form_type, name, contact, service, message, business } = body;

    if (!name || !contact) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and contact are required.' })
      };
    }

    await sql`
      INSERT INTO enquiries (form_type, name, contact, service, message, business)
      VALUES (${form_type || 'contact'}, ${name}, ${contact}, ${service || null}, ${message || null}, ${business || null})
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('DB error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save enquiry.' })
    };
  }
};
