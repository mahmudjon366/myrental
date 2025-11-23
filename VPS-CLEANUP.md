# 🧹 VPS Tozalash - Keraksiz Fayllarni O'chirish

## 📋 Hozirgi Holatni Ko'rish

```bash
# Root papkadagi fayllar
ls -lh ~

# Disk joy
df -h

# Har bir papka hajmi
du -sh ~/*
```

## 🗑️ Xavfsiz Tozalash

### 1. Backup Fayllarini Tekshirish

```bash
# Backup fayl hajmi
ls -lh ~/renta30-backup.tar.gz

# Agar backup kerak bo'lsa, saqlang
# Agar kerak bo'lmasa, o'chiring:
rm ~/renta30-backup.tar.gz
```

### 2. Snap Papkasini Tekshirish

```bash
# Snap nima ekanini ko'rish
ls -la ~/snap

# Snap hajmi
du -sh ~/snap

# Snap snapd uchun kerak, lekin agar ishlatmasangiz:
# sudo apt remove snapd
# rm -rf ~/snap
```

### 3. Eski Rentacloud Papkasini Tozalash

Agar eski versiya bo'lsa:

```bash
# Rentacloud papkasiga kirish
cd ~/rentacloud

# Git status
git status

# Agar kerak bo'lmasa, node_modules o'chirish
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf node_modules

# Eski build fayllar
rm -rf frontend/dist
rm -rf frontend/build

# Logs
rm -rf logs/*.log

# Temporary fayllar
rm -rf *.tmp
rm -rf *.temp
```

### 4. Sistema Tozalash

```bash
# APT cache tozalash
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y

# Journal logs tozalash (eski loglar)
sudo journalctl --vacuum-time=7d

# Eski kernel fayllar (ehtiyotkorlik bilan!)
# sudo apt autoremove --purge
```

### 5. Docker (agar o'rnatilgan bo'lsa)

```bash
# Docker images tozalash
# docker system prune -a

# Docker volumes
# docker volume prune
```

## 🎯 Tavsiya Etilgan Tozalash

```bash
#!/bin/bash
echo "🧹 VPS Tozalash boshlandi..."

# 1. Backup o'chirish (agar kerak bo'lmasa)
if [ -f ~/renta30-backup.tar.gz ]; then
    echo "📦 Backup fayl topildi: $(du -sh ~/renta30-backup.tar.gz | cut -f1)"
    read -p "Backup faylni o'chirish kerakmi? (y/n): " answer
    if [ "$answer" = "y" ]; then
        rm ~/renta30-backup.tar.gz
        echo "✅ Backup o'chirildi"
    fi
fi

# 2. Node modules tozalash (qayta o'rnatish mumkin)
if [ -d ~/rentacloud ]; then
    echo "🗂️ Node modules tozalanmoqda..."
    rm -rf ~/rentacloud/backend/node_modules
    rm -rf ~/rentacloud/frontend/node_modules
    rm -rf ~/rentacloud/node_modules
    echo "✅ Node modules o'chirildi"
fi

# 3. Sistema cache tozalash
echo "🔧 Sistema cache tozalanmoqda..."
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y

# 4. Journal logs tozalash
echo "📝 Eski loglar tozalanmoqda..."
sudo journalctl --vacuum-time=7d

# 5. Natija
echo ""
echo "✅ Tozalash tugadi!"
echo ""
echo "📊 Disk holati:"
df -h /

echo ""
echo "📁 Home papka hajmi:"
du -sh ~/*
```

## 📊 Disk Joyini Tekshirish

### Eng katta fayllarni topish

```bash
# Eng katta 10 ta fayl
find ~ -type f -exec du -h {} + | sort -rh | head -n 10

# Eng katta 10 ta papka
du -h ~ | sort -rh | head -n 10
```

### Papkalar bo'yicha hajm

```bash
# Har bir papka hajmi
du -sh ~/* | sort -rh

# Rentacloud papka tarkibi
du -sh ~/rentacloud/* | sort -rh
```

## ⚠️ O'chirmaslik Kerak Bo'lgan Fayllar

**MUHIM - Quyidagilarni o'chirmang:**

```
~/rentacloud/                    # Asosiy loyiha
~/rentacloud/backend/.env        # Environment variables
~/rentacloud/frontend/dist/      # Build fayllar (deploy qilgandan keyin)
~/.ssh/                          # SSH keys
~/.bashrc                        # Shell config
~/.profile                       # User profile
```

## ✅ Xavfsiz O'chirish Mumkin

```
~/renta30-backup.tar.gz          # Eski backup (agar kerak bo'lmasa)
~/rentacloud/backend/node_modules/   # Qayta o'rnatish mumkin
~/rentacloud/frontend/node_modules/  # Qayta o'rnatish mumkin
~/rentacloud/logs/*.log          # Eski loglar
~/rentacloud/frontend/dev-dist/  # Development fayllar
```

## 🔄 Node Modules Qayta O'rnatish

Agar node_modules o'chirilgan bo'lsa:

```bash
cd ~/rentacloud

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Root
npm install
```

## 📈 Tozalashdan Keyin

```bash
# Disk joy
df -h

# Rentacloud hajmi
du -sh ~/rentacloud

# Backend ishlab turganini tekshirish
pm2 status

# Nginx ishlayaptimi
sudo systemctl status nginx
```

## 💡 Maslahatlar

1. **Backup olish**: Muhim fayllarni o'chirishdan oldin backup oling
2. **Bosqichma-bosqich**: Barcha fayllarni bir vaqtda o'chirmang
3. **Tekshirish**: Har bir o'chirishdan keyin tizim ishlashini tekshiring
4. **Logs**: Eski loglarni arxivlang, keyin o'chiring

---

**Xavfsizlik uchun:** Agar nima ekanini bilmasangiz, o'chirmang!
