const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  const { password } = req.query;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const rows = await sql`
      SELECT * FROM enquiries
      ORDER BY submitted_at DESC
    `;

    return res.status(200).json(rows);

  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Failed to fetch enquiries.' });
  }
};
