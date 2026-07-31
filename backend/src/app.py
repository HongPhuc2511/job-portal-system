from flask import Flask

from src.config import Config
from src.extensions import db, jwt, ma, migrate


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    app.json.ensure_ascii = False  # type: ignore

    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @app.route("/")
    def hello():
        return {"message": "Xin chào tất cả các bạn nha"}

    return app
