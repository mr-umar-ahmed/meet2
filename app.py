from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
import googlemaps
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)

# Configure SQLite Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Google Maps API Key (Load from .env file)
GMAPS_API_KEY = os.getenv("AIzaSyD8W4GWpiFBh3ZLPedSToInNftoTKAwgoA")
if not GMAPS_API_KEY:
    raise ValueError("⚠️ Google Maps API Key is missing. Set GMAPS_API_KEY in .env file.")

gmaps = googlemaps.Client(key=AIzaSyD8W4GWpiFBh3ZLPedSToInNftoTKAwgoA)

# Database Model
class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

# Routes
@app.route('/')
def index():
    reminders = Reminder.query.all()
    return render_template('index.html', reminders=reminders, api_key=AIzaSyD8W4GWpiFBh3ZLPedSToInNftoTKAwgoA)

@app.route('/add', methods=['POST'])
def add_reminder():
    try:
        task = request.form.get('task')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')

        # Validate input
        if not task or not latitude or not longitude:
            return "⚠️ Error: Task and Location are required.", 400

        latitude, longitude = float(latitude), float(longitude)

        # Save to database
        new_reminder = Reminder(task=task, latitude=latitude, longitude=longitude)
        db.session.add(new_reminder)
        db.session.commit()

        return redirect(url_for('index'))
    
    except ValueError:
        return "⚠️ Invalid latitude/longitude values.", 400

@app.route('/reminders', methods=['GET'])
def get_reminders():
    reminders = Reminder.query.all()
    return jsonify([
        {"task": r.task, "lat": r.latitude, "lng": r.longitude} 
        for r in reminders
    ])

if __name__ == '__main__':
    # Ensure database is initialized
    with app.app_context():
        db.create_all()
    
    app.run(debug=os.getenv("FLASK_DEBUG", "True").lower() == "true")