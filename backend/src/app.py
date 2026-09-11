from flask import Flask
from flask_cors import CORS

import src.modules.application.models
import src.modules.auth.models
import src.modules.location.models
import src.modules.resume.models  # noqa: F401
from src.config import Config
from src.extensions import api_document, db, jwt, ma, mail, migrate
from src.modules.application.routes import applications_bp

from .modules.auth.routes import auth_bp
from .modules.location.routes import location_bp
from .modules.posts.routes import job_posts_bp
from .modules.resume.routes import resumes_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(
        app,
        resources={r"/api/*": {"origins": Config.CORS_ALLOWED_ORIGINS}},
        supports_credentials=True,
        expose_headers=["X-Pagination"],
    )
    app.config.from_object(Config)

    app.json.ensure_ascii = False  # type: ignore

    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    api_document.init_app(app)
    mail.init_app(app)

    api_document.register_blueprint(applications_bp)
    api_document.register_blueprint(auth_bp)
    api_document.register_blueprint(job_posts_bp)
    api_document.register_blueprint(location_bp)
    api_document.register_blueprint(resumes_bp)

    return app
