const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

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

    await sql`
      ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS file_urls TEXT
    `;

    const { form_type, name, contact, service, message, business, file_urls } = req.body;

    if (!name || !contact) {
      return res.status(400).json({ error: 'Name and contact are required.' });
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

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Failed to save enquiry.' });
  }
};
