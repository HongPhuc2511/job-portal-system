import enum


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"


class JobType(str, enum.Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    REMOTE = "Remote"
    INTERNSHIP = "Internship"