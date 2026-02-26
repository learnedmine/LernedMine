const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Create table if it doesn't exist (includes file_urls column)
    await sql`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        form_type TEXT NOT NULL,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        service TEXT,
        message TEXT,
        business TEXT,
        file_urls TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Add file_urls column if it doesn't exist (for existing tables)
    await sql`
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS file_urls TEXT
    `;

    const body = JSON.parse(event.body);
    const { form_type, name, contact, service, message, business, file_urls } = body;

    if (!name || !contact) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and contact are required.' })
      };
    }

    await sql`
      INSERT INTO enquiries (form_type, name, contact, service, message, business, file_urls)
      VALUES (
        ${form_type || 'contact'},
        ${name},
        ${contact},
        ${service || null},
        ${message || null},
        ${business || null},
        ${file_urls || null}
      )
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
