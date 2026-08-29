from flask import Flask

import src.modules.auth.models
import src.modules.jobs.models
from src.config import Config
from src.extensions import api_document, db, jwt, ma, migrate

from .modules.auth.routes import auth_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    app.json.ensure_ascii = False  # type: ignore

    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    api_document.init_app(app)

    api_document.register_blueprint(auth_bp)

    return app
