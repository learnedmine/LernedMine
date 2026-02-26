const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Simple password protection
  const { password } = event.queryStringParameters || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const rows = await sql`
      SELECT * FROM enquiries
      ORDER BY submitted_at DESC
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    };

  } catch (err) {
    console.error('DB error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch enquiries.' })
    };
  }
};
