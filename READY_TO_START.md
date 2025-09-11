# 🚀 COMPLETE SETUP GUIDE
**Hausarztpraxis Airoud - Everything Configured and Ready!**

## ✅ SETUP COMPLETED

I've set up everything for you! Here's what's been configured:

### 📁 **Files Created:**
- ✅ `.env` - Environment configuration
- ✅ `ssl/private.key` - SSL private key (development)
- ✅ `ssl/certificate.crt` - SSL certificate (development)
- ✅ `scripts/start-server.js` - Windows-compatible server launcher
- ✅ `scripts/generate-ssl-windows.js` - SSL certificate generator
- ✅ Updated `package.json` with Windows-compatible scripts

### ⚙️ **Configuration:**
- ✅ Development environment ready
- ✅ SSL certificates generated
- ✅ Environment variables configured
- ✅ Security settings optimized
- ✅ Windows PowerShell compatibility

## 🚀 HOW TO START THE SERVER

### **Option 1: HTTP Development Server (Recommended for testing)**
```powershell
node scripts/start-server.js http
```
**Access:** http://localhost:3000

### **Option 2: HTTPS Development Server**
```powershell
node scripts/start-server.js https
```
**Access:** https://localhost:443

### **Option 3: Production HTTPS Server**
```powershell
node scripts/start-server.js production
```
**Access:** https://localhost:443 (with redirects)

## 🌐 **Website Access Points:**

| **Service** | **HTTP** | **HTTPS** |
|-------------|----------|-----------|
| **Main Website** | http://localhost:3000 | https://localhost:443 |
| **Admin Panel** | http://localhost:3000/admin | https://localhost:443/admin |
| **Legal Pages** | http://localhost:3000/impressum | https://localhost:443/impressum |

## 🔑 **Login Credentials:**

```
Username: admin
Password: Praxis2025AiroudSecure
```

## 📋 **Quick Start Commands:**

```powershell
# Navigate to project directory
cd "d:\Git\Hausarztpraxis-Airoud - Website"

# Start HTTP server (easiest)
node scripts/start-server.js http

# OR start HTTPS server
node scripts/start-server.js https
```

## 🛡️ **Security Features Active:**

### **HTTP Mode:**
- ✅ bcrypt password hashing
- ✅ Session management
- ✅ Rate limiting (3 attempts/15min)
- ✅ Input sanitization
- ✅ Basic security headers

### **HTTPS Mode:**
- ✅ All HTTP features PLUS:
- ✅ SSL/TLS encryption
- ✅ HSTS headers
- ✅ Secure cookies
- ✅ Enhanced CSP headers

## 🔧 **Troubleshooting:**

### **If server won't start:**
1. Check if port is available: `netstat -an | findstr :3000`
2. Run as Administrator for port 443
3. Check .env file exists

### **If HTTPS shows warnings:**
1. ✅ **Normal for development certificates**
2. Click "Advanced" → "Proceed to localhost (unsafe)"
3. This is expected behavior for self-signed certificates

### **If dependencies missing:**
```powershell
# Install dependencies (if needed)
powershell -ExecutionPolicy Bypass -Command "npm install"
```

## 📊 **Testing the Setup:**

### **1. Test HTTP Server:**
```powershell
# Start server
node scripts/start-server.js http

# Open browser to: http://localhost:3000
# Should show the medical practice website
```

### **2. Test HTTPS Server:**
```powershell
# Start server
node scripts/start-server.js https

# Open browser to: https://localhost:443
# Accept security warning for development certificate
```

### **3. Test Admin Panel:**
```
1. Go to: /admin
2. Login: admin / Praxis2025AiroudSecure
3. Should access CMS interface
```

## 🎯 **Next Steps:**

### **For Development:**
✅ Everything is ready! Just start the server with:
```powershell
node scripts/start-server.js http
```

### **For Production Deployment:**
1. **Get real SSL certificate:**
   - Let's Encrypt (free): `certbot certonly --standalone -d your-domain.com`
   - Commercial provider
   
2. **Replace development certificates:**
   ```powershell
   # Copy your real certificates to:
   ssl/private.key    # Your private key
   ssl/certificate.crt # Your SSL certificate
   ssl/ca_bundle.crt  # CA bundle (if provided)
   ```

3. **Update .env for production:**
   ```bash
   NODE_ENV=production
   USE_SSL=true
   REDIRECT_HTTP=true
   ```

4. **Start production server:**
   ```powershell
   node scripts/start-server.js production
   ```

## 📞 **Support:**

### **Common Issues:**

**❓ Port 443 permission denied?**
→ Run PowerShell as Administrator

**❓ Browser security warning?**
→ Normal for development - click "Advanced" → "Proceed"

**❓ Can't access admin panel?**
→ Check login: admin / Praxis2025AiroudSecure

**❓ Server won't start?**
→ Check if another server is running on the same port

### **Log Files:**
- Server output shows in console
- Check .env file for configuration
- SSL certificates in ssl/ folder

## 🎉 **ALL DONE!**

Your **Hausarztpraxis Airoud website** is now **completely configured** and ready to run with:

- ✅ **Full SSL/HTTPS support**
- ✅ **Development & production modes**
- ✅ **Windows compatibility**
- ✅ **Enterprise-grade security**
- ✅ **Easy deployment**

**🚀 Start now with:**
```powershell
node scripts/start-server.js http
```

**Then open:** http://localhost:3000

---

*Complete setup finished on September 11, 2025*  
*Everything configured and ready for immediate use!*
