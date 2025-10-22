# 🔑 Guía: Regenerar Firebase API Keys

## ⚠️ ¿Por qué regenerar?

GitHub detectó tu API key en el commit anterior. Aunque las API keys de Firebase son **públicas por diseño** y están protegidas por las Firestore Rules, es mejor práctica regenerarlas para eliminar la alerta de GitHub.

---

## 🚀 Pasos para Regenerar (10 min)

### **Paso 1: Eliminar la app actual**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **`foodlab-production`**
3. Click en el ícono de **Settings** ⚙️ (arriba izquierda)
4. Click **"Project settings"**
5. Scroll hasta **"Your apps"**
6. Encuentra tu app web (debería decir algo como "foodlab-production")
7. Click en el ícono **de los 3 puntos** ⋮
8. Click **"Delete app"**
9. Confirma la eliminación

---

### **Paso 2: Crear nueva app web**

1. En la misma página **"Project settings"**
2. Scroll hasta **"Your apps"**
3. Click en **"Web"** (ícono `</>`)
4. **App nickname:** `FoodLab Web App`
5. ✅ Check **"Also set up Firebase Hosting"** (opcional)
6. Click **"Register app"**

---

### **Paso 3: Copiar nuevas credenciales**

Deberías ver algo así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy... [NUEVA KEY]",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:..." [NUEVO APP ID]
};
```

**Copia todo este objeto.**

---

### **Paso 4: Actualizar .env local**

1. Abre tu archivo `.env` en `foodlabs-app/.env`
2. Reemplaza con las nuevas credenciales:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy... [TU NUEVA KEY]
VITE_FIREBASE_AUTH_DOMAIN=foodlab-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=foodlab-production
VITE_FIREBASE_STORAGE_BUCKET=foodlab-production.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=872068459643
VITE_FIREBASE_APP_ID=1:872068459643:web:... [TU NUEVO APP ID]

# Development settings
VITE_USE_FIREBASE_EMULATOR=false
```

3. **Guarda el archivo**

---

### **Paso 5: Actualizar en Vercel (si ya deployeaste)**

Si ya tienes la app en producción en Vercel:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **FoodLab**
3. Click **"Settings"**
4. Click **"Environment Variables"**
5. Actualiza cada variable:
   - `VITE_FIREBASE_API_KEY` → Nueva key
   - `VITE_FIREBASE_APP_ID` → Nuevo app ID
6. Click **"Save"**
7. Ve a **"Deployments"**
8. Click en el último deployment → **"Redeploy"**

---

### **Paso 6: Testing local**

```bash
cd foodlabs-app
npm run dev
```

1. Abre `http://localhost:5173`
2. Prueba **Google Sign-in**
3. Verifica que funciona correctamente

---

### **Paso 7: Verificar en GitHub**

1. Ve a tu repositorio en GitHub
2. La alerta de seguridad debería desaparecer en ~24 horas
3. Si sigue ahí, ve a:
   - **"Security"** tab
   - **"Secret scanning alerts"**
   - Click en la alerta
   - Click **"Resolve"** → **"Revoked"**

---

## ✅ Checklist

- [ ] App anterior eliminada en Firebase
- [ ] Nueva app creada
- [ ] Nuevas credenciales copiadas
- [ ] `.env` actualizado localmente
- [ ] Testing local exitoso (Google Sign-in funciona)
- [ ] Variables actualizadas en Vercel (si aplica)
- [ ] Redeploy en Vercel (si aplica)
- [ ] Alerta de GitHub resuelta

---

## 🔒 Seguridad: ¿Las nuevas keys también son "públicas"?

**Sí.** Las Firebase API keys están **diseñadas para ser públicas**.

### ¿Por qué es seguro?

1. **Las API keys de Firebase NO son secretos**
   - Van en el código del frontend
   - Son visibles para cualquiera que inspeccione tu app
   
2. **La seguridad real viene de:**
   - ✅ **Firestore Security Rules** (ya configuradas)
   - ✅ **Authentication** (Firebase Auth)
   - ✅ **App Check** (opcional, para producción)

3. **Las API keys solo identifican tu proyecto**
   - No dan acceso a datos
   - No permiten operaciones admin
   - Solo permiten lo que las Rules permiten

### Lectura recomendada:
- [Firebase API Keys Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Is it safe to expose Firebase apiKey?](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public)

---

## 🎯 ¿Necesito regenerar las keys?

### SÍ, si:
- ✅ Quieres eliminar la alerta de GitHub
- ✅ Quieres seguir best practices
- ✅ Sientes que es más "limpio"

### NO es urgente, si:
- ⚠️ Ya tienes Firestore Rules configuradas (✅ las tienes)
- ⚠️ No usas Firebase Admin SDK en frontend (✅ no lo usas)
- ⚠️ Las keys anteriores no son de un service account (✅ no lo son)

**Conclusión:** Hazlo por tranquilidad, pero técnicamente no es una vulnerabilidad crítica.

---

## 🆘 Troubleshooting

### "Error: Firebase app already exists"
**Solución:**
- Refresca la página
- Limpia caché del navegador
- Prueba en ventana incógnita

### "Error: Auth domain not authorized"
**Solución:**
1. Firebase Console → Authentication → Settings
2. **Authorized domains** debe incluir:
   - `localhost`
   - Tu dominio de producción

### Login no funciona después de regenerar
**Solución:**
1. Verifica que `.env` está actualizado
2. Reinicia el servidor dev: `npm run dev`
3. Limpia localStorage: Consola → `localStorage.clear()`
4. Refresca la página

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona:
1. Verifica que todas las variables en `.env` estén correctas
2. No debe haber espacios extra ni comillas en los valores
3. Reinicia el servidor dev
4. Checa la consola del navegador (F12)

---

**Tiempo total:** ~10 minutos  
**Dificultad:** ⭐⭐☆☆☆  
**Impacto:** Elimina alerta de GitHub, misma funcionalidad

