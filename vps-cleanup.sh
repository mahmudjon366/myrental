#!/bin/bash

# ============================================
# VPS Tozalash Script
# ============================================

echo "🧹 VPS Tozalash boshlandi..."
echo ""

# Disk holatini ko'rsatish
echo "📊 Hozirgi disk holati:"
df -h / | grep -v Filesystem
echo ""

# 1. Backup faylni tekshirish
if [ -f ~/renta30-backup.tar.gz ]; then
    BACKUP_SIZE=$(du -sh ~/renta30-backup.tar.gz | cut -f1)
    echo "📦 Backup fayl topildi: $BACKUP_SIZE"
    echo "   Fayl: ~/renta30-backup.tar.gz"
    read -p "   O'chirish kerakmi? (y/n): " answer
    if [ "$answer" = "y" ]; then
        rm ~/renta30-backup.tar.gz
        echo "   ✅ Backup o'chirildi"
    else
        echo "   ⏭️  Backup saqlab qolindi"
    fi
    echo ""
fi

# 2. Node modules tozalash
if [ -d ~/rentacloud ]; then
    echo "🗂️ Node modules tozalanmoqda..."
    
    # Backend node_modules
    if [ -d ~/rentacloud/backend/node_modules ]; then
        BACKEND_SIZE=$(du -sh ~/rentacloud/backend/node_modules 2>/dev/null | cut -f1)
        echo "   Backend node_modules: $BACKEND_SIZE"
        rm -rf ~/rentacloud/backend/node_modules
        echo "   ✅ Backend node_modules o'chirildi"
    fi
    
    # Frontend node_modules
    if [ -d ~/rentacloud/frontend/node_modules ]; then
        FRONTEND_SIZE=$(du -sh ~/rentacloud/frontend/node_modules 2>/dev/null | cut -f1)
        echo "   Frontend node_modules: $FRONTEND_SIZE"
        rm -rf ~/rentacloud/frontend/node_modules
        echo "   ✅ Frontend node_modules o'chirildi"
    fi
    
    # Root node_modules
    if [ -d ~/rentacloud/node_modules ]; then
        ROOT_SIZE=$(du -sh ~/rentacloud/node_modules 2>/dev/null | cut -f1)
        echo "   Root node_modules: $ROOT_SIZE"
        rm -rf ~/rentacloud/node_modules
        echo "   ✅ Root node_modules o'chirildi"
    fi
    
    echo ""
fi

# 3. Development fayllar
if [ -d ~/rentacloud/frontend/dev-dist ]; then
    echo "🔧 Development fayllar tozalanmoqda..."
    rm -rf ~/rentacloud/frontend/dev-dist
    echo "   ✅ dev-dist o'chirildi"
    echo ""
fi

# 4. Eski loglar
if [ -d ~/rentacloud/logs ]; then
    echo "📝 Eski loglar tozalanmoqda..."
    find ~/rentacloud/logs -name "*.log" -mtime +7 -delete 2>/dev/null
    echo "   ✅ 7 kundan eski loglar o'chirildi"
    echo ""
fi

# 5. Sistema cache tozalash
echo "🔧 Sistema cache tozalanmoqda..."
sudo apt clean -y 2>/dev/null
sudo apt autoclean -y 2>/dev/null
sudo apt autoremove -y 2>/dev/null
echo "   ✅ Sistema cache tozalandi"
echo ""

# 6. Journal logs tozalash
echo "📝 Journal logs tozalanmoqda..."
sudo journalctl --vacuum-time=7d 2>/dev/null
echo "   ✅ Journal logs tozalandi"
echo ""

# 7. Temporary fayllar
echo "🗑️ Temporary fayllar tozalanmoqda..."
rm -rf /tmp/*.tmp 2>/dev/null
rm -rf /tmp/*.temp 2>/dev/null
echo "   ✅ Temporary fayllar o'chirildi"
echo ""

# Natija
echo "✅ Tozalash tugadi!"
echo ""
echo "📊 Yangi disk holati:"
df -h / | grep -v Filesystem
echo ""

# Rentacloud hajmi
if [ -d ~/rentacloud ]; then
    echo "📁 Rentacloud papka hajmi:"
    du -sh ~/rentacloud
    echo ""
fi

echo "💡 Node modules qayta o'rnatish uchun:"
echo "   cd ~/rentacloud && npm run install-all"
echo ""
