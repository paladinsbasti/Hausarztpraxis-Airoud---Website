# 🏗️ ARCHITEKTUR-REFAKTORIERUNG PLAN

## Neue Projektstruktur:
```
hausarztpraxis-airoud/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── security.js
│   │   └── server.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── Content.js
│   │   └── User.js
│   ├── routes/
│   │   ├── api.js
│   │   ├── admin.js
│   │   └── public.js
│   ├── services/
│   │   ├── contentService.js
│   │   ├── authService.js
│   │   └── emailService.js
│   └── utils/
│       ├── logger.js
│       ├── validator.js
│       └── sanitizer.js
├── public/
│   ├── assets/
│   ├── css/
│   └── js/
├── views/
├── tests/
└── docs/
```

## Technologie-Upgrades:
1. **Database**: SQLite → PostgreSQL/MongoDB
2. **ORM**: Sequelize/Mongoose
3. **Validation**: Joi/Zod
4. **Logging**: Winston
5. **Testing**: Jest + Supertest
6. **Documentation**: Swagger/OpenAPI
