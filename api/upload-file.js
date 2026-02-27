const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { file, fileName } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'learnedmine-clients',
      public_id: (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'upload') + '_' + Date.now(),
      resource_type: 'auto'
    });

    return res.status(200).json({ url: result.secure_url });

  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
