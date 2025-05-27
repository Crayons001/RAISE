import click
from flask.cli import with_appcontext
from app.utils.seed_data import seed_database

@click.command('seed-db')
@with_appcontext
def seed_db_command():
    """Seed the database with initial test data."""
    click.echo('Seeding the database...')
    seed_database()
    click.echo('Database seeding completed.')

def init_app(app):
    """Register CLI commands with the Flask application."""
    app.cli.add_command(seed_db_command) 