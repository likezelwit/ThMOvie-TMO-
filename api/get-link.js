export default async function handler(req, res) {
    // 1. ID video Google Drive kamu
    const fileId = "1qJ26IK0GYZD4G0tdluOpFyLhSHsWCn0q";
    
    // 2. Masukkan API Key Google Drive kamu yang asli di sini
    const apiKey = "AIzaSyBQByCxyGwLSkAJg3UA1supTgLzpcda-Gk"; 
    
    // 3. Generate link googleapis yang fresh
    const googleUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    
    // 4. Kirim hasilnya ke frontend dalam bentuk JSON
    res.status(200).json({ newUrl: googleUrl });
}
