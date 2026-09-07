import enum


class ExperienceLevel(str, enum.Enum):
    INTERN = "Intern"
    FRESHER = "Fresher"
    JUNIOR = "Junior"
    MIDDLE = "Middle"
    SENIOR = "Senior"
    LEAD = "Lead"


class JobPostStatus(str, enum.Enum):
    ACTIVE = "Active"
    CLOSED = "Closed"
    EXPIRED = "Expired"


class JobType(str, enum.Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    FREELANCE = "Freelance"


class SalaryPeriod(str, enum.Enum):
    HOURLY = "Hourly"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"
    ANNUAL = "Annual"


class WorkModel(str, enum.Enum):
    ON_SITE = "On-site"
    REMOTE = "Remote"
    HYBRID = "Hybrid"
