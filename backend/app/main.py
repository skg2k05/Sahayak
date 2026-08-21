from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes import health, auth, accounts, payees, transactions, translator, voice, fraud

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers via standard FastAPI include_router
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(payees.router)
app.include_router(transactions.router)
app.include_router(translator.router)
app.include_router(voice.router)
app.include_router(fraud.router)

# Register route objects on app.router.routes to support direct route path introspection
for router in [health.router, auth.router, accounts.router, payees.router, transactions.router, translator.router, voice.router, fraud.router]:
    for route in router.routes:
        route.dependency_overrides_provider = app
        if route not in app.router.routes:
            app.router.routes.append(route)
