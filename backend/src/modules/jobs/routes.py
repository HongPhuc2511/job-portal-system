import os
import uuid

from flask import current_app, jsonify, request, send_from_directory
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_smorest import Blueprint
from sqlalchemy import select

from src.extensions import db

from .models import Resume, ResumeType
from .schemas import ResumeResponse,ResumeBuilderRequest,ResumeUpdateRequest

resumes_bp = Blueprint(
    "resumes",
    "resumes",
    url_prefix="/api/resumes",
    description="Quan ly CV cua ung vien",
)


@resumes_bp.route("", methods=["POST"])
@jwt_required()
@resumes_bp.response(201, schema=ResumeResponse, description="Tao CV thanh cong")
def create_resume():
    """Ứng vien tạo CV mới (upload file PDF)"""
    user_id = get_jwt_identity()
    file = request.files["file"]
    title = request.form.get("title")

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))

    new_resume = Resume(user_id=user_id, title=title, file_path=filename)
    db.session.add(new_resume)
    db.session.commit()

    return new_resume


@resumes_bp.route("", methods=["GET"])
@jwt_required()
@resumes_bp.response(
    200, schema=ResumeResponse(many=True), description="Danh sach CV cua ung vien"
)
def list_resumes():
    """Ứng viên xem CV của chính mình"""
    user_id = get_jwt_identity()
    stmt = (
        select(Resume)
        .where(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
    )
    return db.session.scalars(stmt).all()


@resumes_bp.route("/<int:resume_id>/file", methods=["GET"])
@jwt_required()
def get_resume_file(resume_id):
    """Ứng vin xem File CV của mình"""
    user_id = get_jwt_identity()
    resume = db.session.get(Resume, resume_id)

    if not resume or str(resume.user_id) != str(user_id):
        return jsonify({"message": "Khong tim thay CV"}), 404

    if not resume.file_path:
        return jsonify({"message": "CV nay khong co file de xem"}), 400

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    return send_from_directory(upload_folder, resume.file_path)


@resumes_bp.route("/<int:resume_id>", methods=["DELETE"])
@jwt_required()
@resumes_bp.response(200, description="Xóa CV thành công")
def delete_resume(resume_id):
    """Ứng viên xóa CV của chính mình"""
    user_id = get_jwt_identity()
    resume = db.session.get(Resume,resume_id)
    if not resume or str(resume.user_id) != str(user_id):
        return jsonify({"message": "Khong tim thay CV"}), 404

    db.session.delete(resume)
    db.session.commit()
    return {"message":"Xóa CV thành công!"},200

@resumes_bp.route("/builder", methods=["POST"])
@jwt_required()
@resumes_bp.arguments(ResumeBuilderRequest)
@resumes_bp.response(201, schema=ResumeResponse, description="Tao CV bang form thanh cong")
def create_resume_builder(data):
    """Ứng viên tạo CV bằng form nhập lieu"""
    user_id = get_jwt_identity()
    new_resume = Resume(user_id=user_id,title=data["title"],
                        resume_type=ResumeType.BUILDER,
                        content=data["content"],)
    db.session.add(new_resume)
    db.session.commit()

    return new_resume

@resumes_bp.route("/<int:resume_id>", methods=["GET"])
@jwt_required()
@resumes_bp.response(200, schema=ResumeResponse, description="Chi tiet CV")
def get_resume(resume_id):
    """Ung vien xem chi tiet 1 CV cua chinh minh"""
    user_id = get_jwt_identity()
    resume = db.session.get(Resume, resume_id)

    if not resume or str(resume.user_id) != str(user_id):
        return jsonify({"message": "Khong tim thay CV"}), 404

    return resume

@resumes_bp.route("/<int:resume_id>",methods=["PUT"])
@jwt_required()
@resumes_bp.arguments(ResumeUpdateRequest)
@resumes_bp.response(200,schema=ResumeResponse, description="Cập nhật CV thành công")
def update_resume(data,resume_id):
    """Ứng viên sửa CV của mình"""
    user_id = get_jwt_identity()
    resume = db.session.get(Resume, resume_id)

    if not resume or str(resume.user_id) != str(user_id):
        return jsonify({"message": "Khong tim thay CV"}), 404

    if "title" in data:
        resume.title = data["title"]

    if "content" in data:
        resume.content = data["content"]

    db.session.commit()
    return resume
