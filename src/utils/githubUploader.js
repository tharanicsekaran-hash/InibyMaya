/**
 * Direct 1-Click Automated GitHub API File Uploader
 * Uploads media files directly into GitHub public/media/ and returns raw CDN URL
 */
export const uploadFileToGithub = async (file, folder = 'media/products') => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const envOwner = import.meta.env.VITE_GITHUB_OWNER;
  // Automatically sanitize owner to tharanicsekaran-hash if tharanic was set in Vercel
  const owner = (envOwner && envOwner !== 'tharanic') ? envOwner : 'tharanicsekaran-hash';
  const repo = import.meta.env.VITE_GITHUB_REPO || 'InibyMaya';
  const configuredBranch = import.meta.env.VITE_GITHUB_BRANCH;
  const branchesToTry = configuredBranch ? [configuredBranch] : ['main', 'master'];

  if (!token) {
    console.error('❌ [GitHub Uploader Error]: VITE_GITHUB_TOKEN is missing in environment variables.');
    alert('⚠️ GitHub Upload Token Missing!\nPlease add VITE_GITHUB_TOKEN to your environment variables in Vercel.');
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

  let lastErrorData = null;

  for (const branch of branchesToTry) {
    try {
      console.log(`📡 [GitHub Uploader]: Attempting upload for "${file.name}" to ${owner}/${repo} (branch: "${branch}")...`);

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
        const rawCdnUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
        console.log('✅ [GitHub Uploader Success]: File uploaded successfully to GitHub CDN:', rawCdnUrl);
        return rawCdnUrl;
      }
      lastErrorData = data;
    } catch (err) {
      console.warn(`Branch ${branch} upload attempt failed:`, err);
    }
  }

  const detailMsg = lastErrorData?.message || 'HTTP 404 Not Found';
  console.error('❌ [GitHub Uploader API Error]:', detailMsg, lastErrorData);
  alert(`❌ GitHub Upload Error (404 Not Found):\n\n1. Target Repo: ${owner}/${repo}\n2. Ensure your GitHub Personal Access Token (VITE_GITHUB_TOKEN) has "Contents: Read & Write" permission for repo "${owner}/${repo}".\n\nDetail: ${detailMsg}`);
  throw new Error(`GitHub upload failed: ${detailMsg}`);
};
