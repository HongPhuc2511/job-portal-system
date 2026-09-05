import enum


class UserRole(str, enum.Enum):
    SEEKER = "seeker"
    EMPLOYER = "employer"
    ADMIN = "admin"
