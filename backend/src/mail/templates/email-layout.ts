export const emailLayout = (
  content: string,
  previewText: string = 'Notifikasi SIM-SAPRAS',
) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIM-SAPRAS SMKS Muhammadiyah 80</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      -webkit-font-smoothing: antialiased;
    }
    
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding-bottom: 40px;
      padding-top: 40px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 48px 32px;
      text-align: center;
      color: #ffffff;
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.05em;
      margin: 0;
      text-transform: uppercase;
    }
    
    .school-name {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      margin-top: 4px;
      display: block;
    }
    
    .body-content {
      padding: 40px 32px;
      color: #334155;
      line-height: 1.625;
      font-size: 16px;
    }
    
    .body-content h2 {
      color: #0f172a;
      font-size: 24px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.025em;
    }
    
    .body-content p {
      margin-bottom: 24px;
    }
    
    .call-to-action {
      text-align: center;
      margin: 32px 0 40px;
    }
    
    .btn {
      display: inline-block;
      padding: 14px 40px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
    }
    
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 32px 0;
      border: none;
    }
    
    .footer {
      padding: 32px;
      text-align: center;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer p {
      margin: 0;
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .footer .links {
      margin-top: 16px;
    }
    
    .footer a {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 8px;
    }
    
    .preview-text {
      display: none;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
    }
    
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    
    .info-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="preview-text">${previewText}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">SIM-SAPRAS</h1>
        <span class="school-name">SMKS MUHAMMADIYAH 80</span>
      </div>
      <div class="body-content">
        ${content}
      </div>
      <div class="footer">
        <p><strong>SMKS Muhammadiyah 80</strong><br>
        Sistem Informasi Manajemen Sarana dan Prasarana<br>
        Terintegrasi & Profesional</p>
        <p style="margin-top: 16px;">&copy; ${new Date().getFullYear()} Yayasan Muhammadiyah. Seluruh hak cipta dilindungi.</p>
        <div class="links">
          <a href="https://simsapras-smksmuh.vercel.app">Buka Aplikasi</a>
          <span style="color: #cbd5e1;">&bull;</span>
          <a href="#">Bantuan</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
