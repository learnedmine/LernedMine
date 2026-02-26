const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { file, fileName } = JSON.parse(event.body);

    if (!file) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No file provided' }) };
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'learnedmine-clients',
      public_id: fileName ? fileName.replace(/\.[^/.]+$/, '') + '_' + Date.now() : 'upload_' + Date.now(),
      resource_type: 'auto'
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: result.secure_url })
    };

  } catch (err) {
    console.error('Upload error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upload failed: ' + err.message })
    };
  }
};
