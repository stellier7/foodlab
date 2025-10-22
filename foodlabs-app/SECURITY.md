# Security Guidelines for FoodLab

## 🔒 Environment Variables

This project uses environment variables to store sensitive configuration like Firebase API keys.

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`

3. **NEVER** commit `.env` to git (it's already in `.gitignore`)

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `foodlab-production`
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Copy the config values

## 🛡️ Firebase Security

### API Keys
Firebase API keys are **public** by design and safe to expose in frontend code. The real security comes from:

1. **Firestore Security Rules** - Control data access
2. **Authentication** - Verify user identity
3. **App Check** (optional) - Prevent abuse

### Best Practices

✅ **DO:**
- Use environment variables for configuration
- Deploy strict Firestore security rules
- Enable App Check for production
- Monitor Firebase usage and logs
- Restrict API keys to specific domains

❌ **DON'T:**
- Commit `.env` files to git
- Disable security rules
- Share service account keys
- Use admin SDK in frontend

## 🔐 Firestore Security Rules

Current rules implement:
- ✅ Role-based access control (Super Admin, Admin, Business, Customer)
- ✅ User can only access their own data
- ✅ Admins have elevated permissions
- ✅ Business owners only see their business data

## 🚨 Security Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Firestore security rules deployed
- [ ] API keys restricted to your domains
- [ ] Authentication enabled
- [ ] Admin accounts secured with strong passwords
- [ ] HTTPS enforced
- [ ] Regular security audits

## 📞 Report Security Issues

If you discover a security vulnerability, please email: security@foodlab.store

**DO NOT** create a public GitHub issue for security vulnerabilities.

## 🔄 Rotating Keys

If you need to rotate Firebase keys:

1. Go to Firebase Console
2. Project Settings → General
3. Remove old app configuration
4. Create new app
5. Update `.env` with new credentials
6. Redeploy application

## 📚 Additional Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [App Check](https://firebase.google.com/docs/app-check)
- [Security Best Practices](https://firebase.google.com/docs/rules/best-practices)

