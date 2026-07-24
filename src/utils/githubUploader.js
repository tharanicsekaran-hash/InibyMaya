/**
 * Direct 1-Click Automated GitHub API File Uploader
 * Uploads media files directly into GitHub public/media/ and returns raw CDN URL
 */
export const uploadFileToGithub = async (file, folder = 'media/products') => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_OWNER || 'tharanic';
  const repo = import.meta.env.VITE_GITHUB_REPO || 'InibyMaya';
  const branch = 'main';

  if (!token) {
    throw new Error('GitHub upload token missing. Please configure VITE_GITHUB_TOKEN.');
  }

  // Convert file buffer to Base64
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Content = btoa(binary);

  // Generate clean filename with timestamp
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}-${cleanName}`;
  const filePath = `public/${folder}/${fileName}`;

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: `Upload ${fileName} via Admin Console`,
      content: base64Content,
      branch: branch
    })
  });

  const data = await response.json();
  if (response.ok && data.content) {
    // Return GitHub Raw CDN URL
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  }

  throw new Error(data.message || 'Failed to upload media to GitHub');
};
