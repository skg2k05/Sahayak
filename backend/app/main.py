from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import health, auth, accounts, payees, transactions, translator, voice, fraud, chat

settings = get_settings()

# Initialize database schema automatically
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


# CORS configuration for local and cloud deployments (Vercel, Render)
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*\.railway\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


routers_list = [
    health.router,
    auth.router,
    accounts.router,
    payees.router,
    transactions.router,
    translator.router,
    voice.router,
    fraud.router,
    chat.router,
]

# Include routers via standard FastAPI include_router
for r in routers_list:
    app.include_router(r)

# Register route objects on app.router.routes to support direct route path introspection
for r in routers_list:
    for route in r.routes:
        route.dependency_overrides_provider = app
        if route not in app.router.routes:
            app.router.routes.append(route)
