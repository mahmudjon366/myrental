# 📋 Rentacloud Deployment Checklist

Bu checklist production deployment jarayonida barcha muhim qadamlar bajarilganligini ta'minlash uchun.

## 🚀 Pre-Deployment Checklist

### Code va Environment
- [ ] Barcha hardcoded sensitive ma'lumotlar olib tashlandi
- [ ] `.env.example` fayllar to'liq va yangilangan
- [ ] `.gitignore` to'g'ri sozlangan (`.env`, `node_modules`, `logs`, `dist`)
- [ ] Production build local muhitda test qilindi
- [ ] Barcha dependencies yangilangan va xavfsiz
- [ ] Security audit o'tkazildi

### Documentation
- [ ] `README.md` production ma'lumotlari bilan yangilangan
- [ ] `docs/DEPLOYMENT.md` mavjud va to'liq
- [ ] `docs/TROUBLESHOOTING.md` mavjud
- [ ] API documentation yangilangan
- [ ] Environment variables hujjatlashtirilgan

### Scripts va Configuration
- [ ] `ecosystem.config.js` to'g'ri sozlangan
- [ ] `nginx-config.conf` domain bilan yangilangan
- [ ] `auto-deploy-vps.sh` test qilindi
- [ ] Database backup/restore scriptlar mavjud
- [ ] Health check endpoints ishlaydi

## 🖥️ Server Preparation Checklist

### System Requirements
- [ ] Ubuntu 20.04+ o'rnatilgan
- [ ] Minimum 2GB RAM, 4GB+ tavsiya etiladi
- [ ] 20GB+ disk space mavjud
- [ ] Internet aloqasi barqaror
- [ ] SSH access sozlangan

### Software Installation
- [ ] Node.js 18+ o'rnatilgan
- [ ] MongoDB 7.0+ o'rnatilgan va ishga tushirilgan
- [ ] Nginx o'rnatilgan va ishga tushirilgan
- [ ] PM2 global o'rnatilgan
- [ ] Git o'rnatilgan
- [ ] UFW firewall yoqilgan

### Security Setup
- [ ] SSH key-based authentication sozlangan
- [ ] Root login o'chirilgan
- [ ] Firewall qoidalari sozlangan (22, 80, 443, 4000)
- [ ] Fail2ban o'rnatilgan (ixtiyoriy)
- [ ] System yangilanishlari o'rnatilgan

## 📦 Deployment Process Checklist

### Code Deployment
- [ ] Repository serverga klonlandi
- [ ] Dependencies o'rnatildi (`npm run install-all`)
- [ ] Environment fayllar yaratildi va to'ldirildi
- [ ] Database initialization bajarildi (`npm run init-db`)
- [ ] Frontend build qilindi (`npm run build`)

### Service Configuration
- [ ] PM2 bilan backend ishga tushirildi
- [ ] PM2 startup script sozlandi
- [ ] Nginx konfiguratsiya fayli nusxalandi
- [ ] Nginx sites-enabled da yoqildi
- [ ] Nginx konfiguratsiya test qilindi (`nginx -t`)

### Database Setup
- [ ] MongoDB ishga tushirilgan va enable qilingan
- [ ] Database ulanishi test qilindi
- [ ] Admin user yaratildi
- [ ] Database indexes yaratildi
- [ ] Backup strategy sozlandi

## 🔍 Post-Deployment Verification

### Service Health Checks
- [ ] MongoDB status: `sudo systemctl status mongod`
- [ ] Nginx status: `sudo systemctl status nginx`
- [ ] PM2 status: `pm2 status`
- [ ] Backend health: `curl http://localhost:4000/health`
- [ ] Frontend accessibility: `curl http://localhost/`

### Functional Testing
- [ ] Frontend sahifa yuklanadi
- [ ] API endpoints javob beradi
- [ ] Database operations ishlaydi
- [ ] Authentication tizimi ishlaydi
- [ ] File upload/download ishlaydi (agar mavjud bo'lsa)

### Performance Testing
- [ ] API response time < 500ms
- [ ] Frontend load time < 3s
- [ ] Database query performance acceptable
- [ ] Memory usage normal (< 80%)
- [ ] CPU usage normal (< 70%)

### Security Verification
- [ ] HTTPS ishlaydi (SSL sertifikat o'rnatilgandan keyin)
- [ ] HTTP HTTPS ga redirect qiladi
- [ ] Security headers mavjud
- [ ] CORS to'g'ri sozlangan
- [ ] Rate limiting ishlaydi

## 🔒 SSL Certificate Setup

### Let's Encrypt (Certbot)
- [ ] Certbot o'rnatilgan
- [ ] Domain DNS A record to'g'ri sozlangan
- [ ] SSL sertifikat olindi: `sudo certbot --nginx -d domain.com`
- [ ] Auto-renewal test qilindi: `sudo certbot renew --dry-run`
- [ ] Nginx SSL konfiguratsiya test qilindi

### SSL Verification
- [ ] HTTPS sayt ochiladi
- [ ] SSL certificate valid
- [ ] Mixed content warnings yo'q
- [ ] Security headers to'g'ri

## 📊 Monitoring Setup

### Logging
- [ ] PM2 logs ishlaydi: `pm2 logs`
- [ ] Nginx access/error logs yoziladi
- [ ] Application logs to'g'ri formatda
- [ ] Log rotation sozlangan

### Health Monitoring
- [ ] Health check endpoints ishlaydi
- [ ] Database connectivity monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring

### Backup Strategy
- [ ] Database backup script test qilindi
- [ ] Backup schedule sozlandi (crontab)
- [ ] Backup restore test qilindi
- [ ] Backup storage location xavfsiz

## 🔄 Maintenance Procedures

### Regular Tasks
- [ ] System yangilanishlari (haftalik)
- [ ] SSL sertifikat yangilanishi (avtomatik)
- [ ] Database backup tekshiruvi (kunlik)
- [ ] Log fayllar tozalash (haftalik)
- [ ] Performance monitoring (kunlik)

### Emergency Procedures
- [ ] Rollback jarayoni hujjatlashtirilgan
- [ ] Emergency contacts ro'yxati mavjud
- [ ] Backup restore jarayoni test qilindi
- [ ] Service restart buyruqlari hujjatlashtirilgan

## 📞 Support Information

### Contact Details
- [ ] Technical support contact ma'lumotlari yangilangan
- [ ] Emergency contact numbers mavjud
- [ ] Support email addresses sozlangan
- [ ] Documentation links to'g'ri

### Knowledge Base
- [ ] Troubleshooting guide mavjud
- [ ] FAQ section yaratilgan
- [ ] Common issues va solutions hujjatlashtirilgan
- [ ] Performance tuning guide mavjud

## ✅ Final Sign-off

### Stakeholder Approval
- [ ] Technical team approval
- [ ] Security team approval (agar mavjud)
- [ ] Business stakeholder approval
- [ ] End-user acceptance testing

### Documentation Handover
- [ ] All documentation updated
- [ ] Access credentials securely shared
- [ ] Monitoring dashboards configured
- [ ] Support team trained

### Go-Live Checklist
- [ ] DNS cutover completed
- [ ] All services running smoothly
- [ ] Monitoring alerts configured
- [ ] Backup verification completed
- [ ] Performance baseline established

---

## 📝 Deployment Sign-off

**Deployment Date**: _______________

**Deployed By**: _______________

**Reviewed By**: _______________

**Approved By**: _______________

**Notes**: 
```
_________________________________
_________________________________
_________________________________
```

---

**🎉 Deployment Complete!**

Barcha checklistlar bajarilgandan so'ng, loyiha production muhitida ishga tayyor!