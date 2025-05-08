from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os
from random import shuffle
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import func

app = Flask(__name__)
app.secret_key = "f9e56b0a1e4e4978b7b4562e34587cd0f78ea4a99f617b2aa1b89e0cbcffcc59"

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Models
class Team(db.Model):
    __tablename__ = "teams"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    team_name = db.Column(db.String(100), nullable=False)
    school_name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, default=0)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)

    @hybrid_property
    def total_time(self):
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return None

    @total_time.expression
    def total_time(cls):
        return func.extract('epoch', cls.end_time) - func.extract('epoch', cls.start_time)

    def __init__(self, team_name, school_name):
        self.team_name = team_name
        self.school_name = school_name
        self.score = 0
        self.start_time = datetime.now(timezone.utc)

with app.app_context():
    db.create_all()

# Routes
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        team_name = request.form.get("team_name")
        school_name = request.form.get("school_name")
        new_team = Team(team_name, school_name)
        db.session.add(new_team)
        db.session.commit()
        session["team_id"] = new_team.id
        return redirect(url_for("challenge1"))
    return render_template("register.html")

@app.route("/challenge1", methods=["GET", "POST"])
def challenge1():
    team_id = session.get("team_id")
    if not team_id:
        return redirect(url_for("register"))

    if request.method == "POST":
        correct = sum(1 for qnum in range(1, 6) if request.form.get(f"q{qnum}") == "1")
        team = Team.query.get(team_id)
        team.score += correct
        db.session.commit()
        return redirect(url_for("challenge2"))

    emails = [
        {
            "from": "giveaways@tiktok-winners.com",
            "subject": "🎉 You Won the TikTok Creator Raffle!",
            "body": (
                "Hey there superstar!<br>"
                "You've won a free phone stand and TikTok hoodie for your awesome videos.<br>"
                "Click <span class='tooltip-link' data-tippy-content='https://scam-tiktok-raffle.com'>here</span> to enter your address and claim it!"
            ),
            "logo": "images/logo-fake-tiktok.png",
            "explanation": "It looks fun and legit, but TikTok doesn’t run raffles like this — and they wouldn’t ask for your address via random email links.",
            "is_phish": True,
            "signature": "TikTok Creator Support"
        },
        {
            "from": "stranger123@randommail.com",
            "subject": "You're really cute... 😊",
            "body": (
                "Hey... I found your email somewhere very secret.<br>"
                "You seem pretty cool. Let’s chat.<br>"
                "Click <span class='tooltip-link' data-tippy-content='http://weirdchatroom.site'>here</span> to see my pictures.<br>"
                "Also email me back if you want to talk cutie. 💌"
            ),
            "logo": "images/logo-creepy.png",
            "explanation": "This is a serious red flag. Never respond to strangers — especially adults sending you links or calling you 'cute.'",
            "is_phish": True,
            "signature": "Some Guy Online"
        },
        {
            "from": "k.jenkins@rapid7academy.edu",
            "subject": "Cyber Safety Poster Contest 🖍️",
            "body": (
                "Hello students!<br>"
                "Submit your entry for the annual Cyber Safety Poster Contest by this Friday.<br>"
                "Winners get a pizza party! 🍕"
            ),
            "logo": "images/logo-school.png",
            "explanation": "This is from a teacher at school, with a normal request and no suspicious links.",
            "is_phish": False,
            "signature": "Mrs. Jenkins – Cyber Defence Department"
        },
        {
            "from": "updates@cookierunkingdom.com",
            "subject": "New Cookie Characters + Cherry Blossom Decor 🌸",
            "body": (
                "Hi sweet friend!<br>"
                "Our spring update is here!<br>"
                "Log in to meet Cherry Blossom Cookie and decorate your village.<br><br>"
                "Read more <span class='tooltip-link' data-tippy-content='https://www.cookierunkingdom.com/updates'>here</span>."
            ),
            "logo": "images/logo-cookierun.png",
            "explanation": "Real update news with no strange links, sent from a believable game email domain.",
            "is_phish": False,
            "signature": "Cookie Run Devs"
        },
        {
            "from": "nookmail@islandrewards.info",
            "subject": "You’ve earned 5,000 Nook Miles!",
            "body": (
                "Hey Islander!<br>"
                "Tom Nook says you’ve earned bonus miles for being awesome! 🥝<br>"
                "Click <span class='tooltip-link' data-tippy-content='http://nook-miles.cool'>here</span> to claim them now."
            ),
            "logo": "images/logo-fake-animalcrossing.png",
            "explanation": "The email pretends to be from Nintendo but uses a suspicious domain. It’s a sneaky phishing attempt.",
            "is_phish": True,
            "signature": "The Nook Inc. Team"
        }
    ]

    shuffle(emails)
    return render_template("challenge1.html", emails=emails)

@app.route("/challenge2", methods=["GET", "POST"])
def challenge2():
    team_id = session.get("team_id")
    if not team_id:
        return redirect(url_for("register"))

    if request.method == "POST":
        found_vulns = set(request.form.getlist("vulns"))
        expected = {"SQLi", "OpenAdminPanel", "OutdatedSSL"}
        correct = len(expected.intersection(found_vulns))
        team = Team.query.get(team_id)
        team.score += correct
        db.session.commit()
        return redirect(url_for("challenge3"))

    return render_template("challenge2.html")

@app.route("/challenge3", methods=["GET", "POST"])
def challenge3():
    team_id = session.get("team_id")
    if not team_id:
        return redirect(url_for("register"))

    return render_template("challenge3.html")

@app.route("/challenge4", methods=["GET", "POST"])
def challenge4():
    team_id = session.get("team_id")
    if not team_id:
        return redirect(url_for("register"))

    return render_template("challenge4.html")

@app.route("/finish", methods=["POST"])
def finish():
    team_id = session.get("team_id")
    if team_id:
        team = Team.query.get(team_id)
        if team and not team.end_time:
            team.end_time = datetime.now(timezone.utc)
            db.session.commit()
    
    # Clear the session data
    session.clear()
    
    # Check if we should redirect to a different page
    next_page = request.form.get('next')
    if next_page == 'home':
        return redirect(url_for("home"))
    
    return redirect(url_for("scoreboard"))

@app.route("/scoreboard")
def scoreboard():
    # Fetch teams and schools for the leaderboard
    teams = Team.query.order_by(Team.score.desc(), Team.total_time).all()
    schools = db.session.query(
        Team.school_name, db.func.sum(Team.score).label('total_score')
    ).group_by(Team.school_name).order_by(db.func.sum(Team.score).desc()).all()

    # Reset the current team's score in the session
    session['team_score'] = 0

    return render_template('scoreboard.html', teams=teams, schools=schools)

@app.route("/api/submit_score", methods=["POST"])
def api_submit_score():
    team_id = session.get("team_id")
    if not team_id:
        return jsonify({"success": False, "message": "No team logged in"})
    
    data = request.json
    points = data.get("points", 0)
    
    try:
        # Validate points
        points = int(points)
        if points < 0 or points > 5:  # Assuming max 5 points per challenge
            return jsonify({"success": False, "message": "Invalid points value"})
            
        # Update team score
        team = Team.query.get(team_id)
        if not team:
            return jsonify({"success": False, "message": "Team not found"})
            
        team.score += points
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": f"Added {points} points", 
            "new_score": team.score
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Error: {str(e)}"})

@app.route("/api/get_team_score")
def get_team_score():
    team_id = session.get("team_id")
    if not team_id:
        return jsonify({"success": False, "message": "No team logged in"})
    
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"success": False, "message": "Team not found"})
        
    return jsonify({
        "success": True,
        "score": team.score
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

application = app
