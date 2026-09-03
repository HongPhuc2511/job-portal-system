"""them resume_type va content vao Resume SCRUM-61

Revision ID: 8596bc504350
Revises: f3a3cc9ac737
Create Date: 2026-09-03 14:21:54.623328

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8596bc504350'
down_revision = 'f3a3cc9ac737'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.add_column(sa.Column(
            'resume_type',
            sa.Enum('UPLOAD', 'BUILDER', name='resumetype'),
            nullable=True,
        ))
        batch_op.add_column(sa.Column('content', sa.JSON(), nullable=True))
        batch_op.alter_column('file_path',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)

    op.execute("UPDATE resumes SET resume_type = 'UPLOAD' WHERE resume_type IS NULL")

    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.alter_column('resume_type', nullable=False)


def downgrade():
    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.alter_column('file_path',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
        batch_op.drop_column('content')
        batch_op.drop_column('resume_type')

    # ### end Alembic commands ###
