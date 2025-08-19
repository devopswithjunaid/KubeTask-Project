#!/usr/bin/env python
import typer
from alembic.config import Config
from alembic import command

app = typer.Typer()

@app.command()
def upgrade(revision: str = "head"):
    """Upgrade database to a later version."""
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, revision)

@app.command()
def downgrade(revision: str):
    """Revert database to a previous version."""
    alembic_cfg = Config("alembic.ini")
    command.downgrade(alembic_cfg, revision)

@app.command()
def revision(message: str):
    """Create a new revision."""
    alembic_cfg = Config("alembic.ini")
    command.revision(alembic_cfg, autogenerate=True, message=message)

@app.command()
def current():
    """Show current revision."""
    alembic_cfg = Config("alembic.ini")
    command.current(alembic_cfg)

@app.command()
def history():
    """Show revision history."""
    alembic_cfg = Config("alembic.ini")
    command.history(alembic_cfg)

if __name__ == "__main__":
    app()
