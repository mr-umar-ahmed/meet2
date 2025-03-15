from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
import googlemaps

# Initialize Flask App
app = Flask(__name__)

# Configure SQLite Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Google Maps API Key (Replace with your own key)
GMAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
gmaps = googlemaps.Client(key=GMAPS_API_KEY)

# Database Model
class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

# Create Database Tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    # Fetch all reminders from the database
    reminders = Reminder.query.all()
    return render_template('index.html', reminders=reminders, api_key=GMAPS_API_KEY)

@app.route('/add', methods=['POST'])
def add_reminder():
    # Get form data
    task = request.form.get('task')
    latitude = float(request.form.get('latitude'))
    longitude = float(request.form.get('longitude'))

    # Create a new reminder
    new_reminder = Reminder(task=task, latitude=latitude, longitude=longitude)
    db.session.add(new_reminder)
    db.session.commit()

    # Redirect to the home page
    return redirect(url_for('index'))

@app.route('/reminders')
def get_reminders():
    # Fetch all reminders and return as JSON
    reminders = Reminder.query.all()
    reminders_data = [{"id": r.id, "task": r.task, "latitude": r.latitude, "longitude": r.longitude} for r in reminders]
    return jsonify(reminders_data)

if __name__ == '__main__':
    app.run(debug=True)