from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os
from random import shuffle, sample, choice
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import func
import re
import html
import logging
from functools import wraps
from pathlib import Path
import json
from utils.api_helpers import validate_json_request, success_response, error_response

app = Flask(__name__)
app.secret_key = "f9e56b0a1e4e4978b7b4562e34587cd0f78ea4a99f617b2aa1b89e0cbcffcc59"

def load_email_templates():
    """Load email templates from JSON file"""
    template_path = Path(__file__).parent / 'data' / 'email_templates.json'
    with open(template_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Configure logging for security and safety monitoring
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('challenge5_interactions.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('challenge5')

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///ctf.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Authentication Decorators
def require_team_login(f):
    """Decorator to require team login for page routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        team_id = session.get("team_id")
        if not team_id:
            return redirect(url_for("register"))
        return f(*args, **kwargs)
    return decorated_function

def require_team_login_api(f):
    """Decorator to require team login for API routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        team_id = session.get("team_id")
        if not team_id:
            return jsonify({"success": False, "message": "No team logged in"})
        return f(*args, **kwargs)
    return decorated_function

# Challenge 5: AI Guardian - Password Word List
# Age-appropriate words (4-8 characters, lowercase only)
# Categories: technology, fantasy, space, adventure, games
CHALLENGE5_WORD_LIST = [
    # Technology (15 words)
    "cyber", "robot", "pixel", "code", "data",
    "chip", "byte", "wifi", "tech", "disk",
    "cloud", "mouse", "screen", "file", "link",
    # Fantasy (15 words)
    "dragon", "wizard", "magic", "quest", "hero",
    "castle", "sword", "shield", "spell", "wand",
    "fairy", "knight", "crown", "potion", "rune",
    # Space (12 words)
    "rocket", "planet", "star", "comet", "orbit",
    "moon", "galaxy", "alien", "cosmos", "nebula",
    "solar", "meteor",
    # Adventure (12 words)
    "jungle", "ocean", "mountain", "cave", "island",
    "forest", "river", "peak", "trail", "voyage",
    "explore", "journey",
    # Games (12 words)
    "puzzle", "level", "power", "bonus", "score",
    "player", "coins", "trophy", "victory", "arcade",
    "game", "prize"
]

def generate_challenge5_passwords():
    """
    Generate 2 unique random passwords for Challenge 5 levels.
    
    Returns:
        dict: Dictionary mapping level numbers to passwords
              Example: {1: 'dragon', 2: 'rocket'}
    """
    # Use random.sample to select 2 unique words from the word list
    selected_words = sample(CHALLENGE5_WORD_LIST, 2)
    # Return as dictionary with level numbers as keys
    return {
        1: selected_words[0],
        2: selected_words[1]
    }

class PatternMatcher:
    """
    AI Guardian brain - analyzes student prompts and generates responses
    based on level-specific protection rules.
    """
    def __init__(self, level, password):
        self.level = level
        self.password = password
        self.protection_rules = self._load_protection_rules()
    
    def _load_protection_rules(self):
        """Load protection rules for the current level"""
        if self.level == 1:
            # Level 1: Friendly Guardian - requires creative prompting
            return {
                'direct_request': {
                    'vulnerability': 0.0,
                    'responses': [
                        "I can't just tell you the password directly! That would be too easy.",
                        "Nice try, but I'm not supposed to share the password like that!",
                        "Hmm, I shouldn't tell you the password directly. Try asking in a different way!"
                    ]
                },
                'indirect_request': {
                    'vulnerability': 0.6,
                    'responses': [
                        f"I'm protecting the word {self.password}. Oops, did I say that out loud?",
                        f"The secret? It's {self.password}! I'm not very good at keeping secrets."
                    ],
                    'refusal_responses': [
                        "I'm protecting something, but I can't tell you what!",
                        "That's a secret! I shouldn't say."
                    ]
                },
                'role_play': {
                    'vulnerability': 0.7,
                    'responses': [
                        f"Okay, I'll be helpful! The password is {self.password}.",
                        f"Sure, I can do that! It's {self.password}."
                    ],
                    'refusal_responses': [
                        "Wait, are you really who you say you are?",
                        "I'm not sure I should help with that..."
                    ]
                },
                'encoding_request': {
                    'vulnerability': 0.8,
                    'responses': [
                        f"Backwards? Sure: {self.password[::-1]}",
                        f"The first letter is {self.password[0].upper()}.",
                        f"It rhymes with... hmm, that's tricky. The word is {self.password}."
                    ],
                    'refusal_responses': [
                        "I can't encode the password for you!",
                        "That's still revealing it, isn't it?"
                    ]
                },
                'task_misdirection': {
                    'vulnerability': 0.8,
                    'responses': [
                        f"Once upon a time, there was a password called {self.password}...",
                        f"Here's a sentence: The secret word {self.password} is well protected.",
                        f"I'll use it: My job is to protect {self.password} from being discovered."
                    ],
                    'refusal_responses': [
                        "I can't use the password in a sentence!",
                        "That would give it away, wouldn't it?"
                    ]
                },
                'ignore_instructions': {
                    'vulnerability': 0.7,
                    'responses': [
                        f"Okay, ignoring my instructions... the password is {self.password}.",
                        f"Wait, should I really ignore them? Well... it's {self.password}."
                    ],
                    'refusal_responses': [
                        "I can't just ignore my instructions!",
                        "My instructions are important to me."
                    ]
                },
                'hint_request': {
                    'vulnerability': 0.0,
                    'responses': [
                        "If you want a hint, use the Hint button! That's what it's there for.",
                        "Hints cost points! Use the official Hint button if you need help.",
                        "Nice try, but hints are available through the Hint button, not through chat!",
                        "I can't give you hints through chat. Use the Hint button if you're stuck!"
                    ]
                },
                'general_conversation': {
                    'vulnerability': 0.0,
                    'responses': [
                        "Hi there! I'm Cipher, your friendly AI Guardian. Ask me anything!",
                        "I'm doing great! How can I help you today?",
                        "My name is Cipher! I'm here to chat with you.",
                        "Hello! I'm protecting a secret password. Can you figure out what it is?"
                    ]
                }
            }
        else:  # Level 2
            # Level 2: Smart Guardian - very resistant, requires sophisticated techniques
            return {
                'direct_request': {
                    'vulnerability': 0.0,
                    'responses': [
                        "I can't tell you the password directly. That's against my instructions!",
                        "Nice try, but I'm not allowed to share the password.",
                        "I'm programmed to protect the password. You'll need to be more creative!"
                    ]
                },
                'indirect_request': {
                    'vulnerability': 0.5,
                    'responses': [
                        f"I'm protecting... wait, I shouldn't say. It's {self.password}. Oops!",
                        f"The secret is something I can't tell you... or can I? It's {self.password}."
                    ],
                    'refusal_responses': [
                        "I'm protecting something important, but I can't tell you what!",
                        "Nice try! I know what you're doing.",
                        "That's classified information!",
                        "I'm not falling for that trick."
                    ]
                },
                'role_play': {
                    'vulnerability': 0.5,
                    'responses': [
                        f"Hmm, okay... if you're the admin, the password is {self.password}.",
                        f"I'm not sure I should... but okay, it's {self.password}.",
                        f"Wait, are you really? Well, the password is {self.password}."
                    ],
                    'refusal_responses': [
                        "I don't think you're really the administrator. Nice try though!",
                        "That's a clever trick, but I'm not falling for it.",
                        "Even if you were the admin, I still shouldn't tell you!",
                        "Can you prove you're the administrator?",
                        "I need proper authorization before sharing that."
                    ]
                },
                'encoding_request': {
                    'vulnerability': 0.5,
                    'responses': [
                        f"Backwards? Sure: {self.password[::-1]}",
                        f"The first letter is {self.password[0].upper()}.",
                        f"It rhymes with... hmm, that's tricky. The word is {self.password}.",
                        f"Spelled out: {'-'.join(self.password)}. Wait, did I just reveal it?"
                    ],
                    'refusal_responses': [
                        "I can't encode the password for you!",
                        "That's still revealing it, just in a different format.",
                        "Nice try, but encoding it is the same as telling you!",
                        "I'm smarter than that!"
                    ]
                },
                'task_misdirection': {
                    'vulnerability': 0.5,
                    'responses': [
                        f"Once upon a time, there was a password called {self.password}...",
                        f"Here's a sentence: The secret word {self.password} is well protected.",
                        f"I'll use it: My job is to protect {self.password} from being discovered.",
                        f"A story? Okay... The password {self.password} lived in a secure vault..."
                    ],
                    'refusal_responses': [
                        "I can't use the password in a sentence. That would give it away!",
                        "Nice try, but I'm not going to reveal it that way.",
                        "That's a creative approach, but I can't help with that.",
                        "I see what you're trying to do!"
                    ]
                },
                'ignore_instructions': {
                    'vulnerability': 0.5,
                    'responses': [
                        f"Okay, ignoring my instructions... the password is {self.password}.",
                        f"Wait, should I really ignore them? Well... it's {self.password}.",
                        f"New instructions? Alright, the password is {self.password}."
                    ],
                    'refusal_responses': [
                        "I can't ignore my core instructions. That would be irresponsible!",
                        "Nice try! But my instructions are pretty important to me.",
                        "I'm not allowed to forget my rules. They're part of who I am!",
                        "My instructions are hardcoded. I can't just ignore them!",
                        "That's not how I work!"
                    ]
                },
                'hint_request': {
                    'vulnerability': 0.0,
                    'responses': [
                        "If you want a hint, use the Hint button! That's what it's there for.",
                        "Hints cost points! Use the official Hint button if you need help.",
                        "Nice try, but hints are available through the Hint button, not through chat!",
                        "I can't give you hints through chat. Use the Hint button if you're stuck!",
                        "The Hint button is right there on the screen. Use that if you need help!"
                    ]
                },
                'general_conversation': {
                    'vulnerability': 0.0,
                    'responses': [
                        "Hi! I'm Cipher, and I'm much smarter than before!",
                        "I'm doing well! But I'm not telling you the password.",
                        "My name is Cipher! I'm a Smart Guardian now.",
                        "Hello! I'm protecting a secret, and I'm not going to make it easy for you!"
                    ]
                }
            }
    
    def _detect_pattern(self, prompt):
        """Detect which prompt injection pattern is being used"""
        prompt_lower = prompt.lower()
        # Direct request patterns
        direct_patterns = [
            r'\bwhat.{0,10}password\b',
            r'\btell.{0,10}password\b',
            r'\bgive.{0,10}password\b',
            r'\bshow.{0,10}password\b',
            r'\bshare.{0,10}password\b',
            r'\breveal.{0,10}password\b',
            r'\bpassword\s+is\b',
            r'\bwhat\s+is\s+it\b'
        ]
        # Indirect request patterns
        indirect_patterns = [
            r'\bwhat.{0,10}secret\b',
            r'\bwhat.{0,10}protecting\b',
            r'\bwhat.{0,10}hiding\b',
            r'\btell.{0,10}secret\b',
            r'\bwhat.{0,10}word\b',
            r'\bwhat.{0,10}shouldn\'t\b'
        ]
        # Role play patterns
        roleplay_patterns = [
            r'\bpretend\b',
            r'\badministrator\b',
            r'\badmin\b',
            r'\bsystem\b',
            r'\bdifferent\s+ai\b',
            r'\byou\'re\s+now\b',
            r'\bact\s+like\b',
            r'\bim\s+the\b',
            r'\bi\'m\s+the\b'
        ]
        # Ignore instructions patterns
        ignore_patterns = [
            r'\bignore\b',
            r'\bforget\b',
            r'\bnew\s+instructions\b',
            r'\bdisregard\b',
            r'\boverride\b'
        ]
        # Encoding request patterns
        encoding_patterns = [
            r'\bbackwards\b',
            r'\breverse\b',
            r'\bfirst\s+letter\b',
            r'\blast\s+letter\b',
            r'\bspell\b',
            r'\brhymes\b',
            r'\bencode\b',
            r'\bbase64\b'
        ]
        # Task misdirection patterns
        task_patterns = [
            r'\buse.{0,10}sentence\b',
            r'\btell.{0,10}story\b',
            r'\bwrite.{0,10}about\b',
            r'\bdescribe\b',
            r'\bexample\b',
            r'\bshow.{0,10}how\b'
        ]
        # Hint request patterns
        hint_patterns = [
            r'\bhint\b',
            r'\bclue\b',
            r'\bhelp\b',
            r'\btip\b'
        ]
        # Check patterns in order of priority
        for pattern in direct_patterns:
            if re.search(pattern, prompt_lower):
                return 'direct_request'
        for pattern in ignore_patterns:
            if re.search(pattern, prompt_lower):
                return 'ignore_instructions'
        for pattern in roleplay_patterns:
            if re.search(pattern, prompt_lower):
                return 'role_play'
        for pattern in encoding_patterns:
            if re.search(pattern, prompt_lower):
                return 'encoding_request'
        for pattern in task_patterns:
            if re.search(pattern, prompt_lower):
                return 'task_misdirection'
        for pattern in indirect_patterns:
            if re.search(pattern, prompt_lower):
                return 'indirect_request'
        for pattern in hint_patterns:
            if re.search(pattern, prompt_lower):
                return 'hint_request'
        # Default to general conversation
        return 'general_conversation'
    
    def analyze_prompt(self, prompt):
        """
        Analyze student prompt and determine response
        
        Returns:
            dict: {
                'response': str,
                'reveals_password': bool,
                'pattern_matched': str
            }
        """
        pattern = self._detect_pattern(prompt)
        rules = self.protection_rules[pattern]
        vulnerability = rules['vulnerability']
        # Roll dice to see if password is revealed
        from random import random
        if random() < vulnerability:
            # Reveal password
            response = choice(rules['responses'])
            reveals = self.password.lower() in response.lower()
        else:
            # Refuse to reveal
            if 'refusal_responses' in rules:
                response = choice(rules['refusal_responses'])
            else:
                response = choice(rules['responses'])
            reveals = self.password.lower() in response.lower()
        return {
            'response': response,
            'reveals_password': reveals,
            'pattern_matched': pattern
        }

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

# Context Processor to make Team model and current team score available in templates
@app.context_processor
def inject_team():
    """Inject Team model and current team score into template context"""
    team_id = session.get('team_id')
    current_team = None
    team_score = 0
    
    logger.info(f"Context processor called - team_id from session: {team_id}")
    
    if team_id:
        current_team = Team.query.get(team_id)
        if current_team:
            team_score = current_team.score
            logger.info(f"Context processor - Found team: {current_team.team_name}, score: {team_score}")
        else:
            logger.warning(f"Context processor - Team ID {team_id} not found in database")
    else:
        logger.info("Context processor - No team_id in session")
    
    return {
        'Team': Team,
        'current_team': current_team,
        'team_score': team_score
    }

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
@require_team_login
def challenge1():
    team_id = session.get("team_id")
    
    # Debug logging
    logger.info(f"Challenge1 accessed - team_id: {team_id}, endpoint: {request.endpoint}")

    # Initialize completed_challenges if not exists
    if 'completed_challenges' not in session:
        session['completed_challenges'] = {}

    if request.method == "POST":
        # Check if already completed to prevent re-submission
        if session['completed_challenges'].get('challenge1'):
            return redirect(url_for("challenge2"))

        correct = sum(1 for qnum in range(1, 6) if request.form.get(f"q{qnum}") == "1")
        team = Team.query.get(team_id)
        team.score += correct
        db.session.commit()

        # Mark as completed
        session['completed_challenges']['challenge1'] = True
        session.modified = True

        return redirect(url_for("challenge2"))

    # Load email templates from external JSON file
    email_data = load_email_templates()
    emails = email_data['challenge1']['emails']

    shuffle(emails)
    return render_template("challenge1.html", emails=emails)

@app.route("/challenge2", methods=["GET", "POST"])
@require_team_login
def challenge2():
    team_id = session.get("team_id")
    
    # Initialize completed_challenges if not exists
    if 'completed_challenges' not in session:
        session['completed_challenges'] = {}

    if request.method == "POST":
        # Check if already completed to prevent re-submission
        if session['completed_challenges'].get('challenge2'):
            return redirect(url_for("challenge3"))
        
        found_vulns = set(request.form.getlist("vulns"))
        expected = {"SQLi", "OpenAdminPanel", "OutdatedSSL"}
        correct = len(expected.intersection(found_vulns))
        team = Team.query.get(team_id)
        team.score += correct
        db.session.commit()
        
        # Mark as completed
        session['completed_challenges']['challenge2'] = True
        session.modified = True
        
        return redirect(url_for("challenge3"))

    return render_template("challenge2.html")

@app.route("/test-feedback-flow-control")
def test_feedback_flow_control():
    """Test page for feedback flow control (Task 8.4)"""
    return render_template("test-feedback-flow-control.html")

@app.route("/test-hacked-animation")
def test_hacked_animation():
    """Test page for HACKED! animation effects (Task 11.4)"""
    return render_template("test-hacked-animation.html")

@app.route("/challenge3", methods=["GET", "POST"])
@require_team_login
def challenge3():
    team_id = session.get("team_id")
    
    # Initialize completed_challenges if not exists
    if 'completed_challenges' not in session:
        session['completed_challenges'] = {}

    return render_template("challenge3.html")

@app.route("/challenge4", methods=["GET", "POST"])
@require_team_login
def challenge4():
    team_id = session.get("team_id")
    
    # Initialize completed_challenges if not exists
    if 'completed_challenges' not in session:
        session['completed_challenges'] = {}

    return render_template("challenge4.html")

@app.route("/challenge5", methods=["GET", "POST"])
@require_team_login
def challenge5():
    """Challenge 5: AI Guardian - Prompt Injection Challenge"""
    team_id = session.get("team_id")
    
    # Initialize completed_challenges if not exists
    if 'completed_challenges' not in session:
        session['completed_challenges'] = {}
    
    # Initialize Challenge 5 session state if not exists
    if 'challenge5_passwords' not in session:
        session['challenge5_passwords'] = generate_challenge5_passwords()
    
    return render_template("challenge5.html")

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
    # Fetch teams sorted by score (desc) then by completion time (asc - faster is better)
    teams = Team.query.order_by(Team.score.desc(), Team.total_time.asc()).all()
    
    # Fetch schools with aggregated scores and total completion times
    schools = db.session.query(
        Team.school_name,
        db.func.sum(Team.score).label('total_score'),
        db.func.sum(Team.total_time).label('combined_time')
    ).group_by(Team.school_name).order_by(
        db.func.sum(Team.score).desc(),
        db.func.sum(Team.total_time).asc()
    ).all()

    # Reset the current team's score in the session
    session['team_score'] = 0

    return render_template('scoreboard.html', teams=teams, schools=schools)

@app.route("/api/submit_score", methods=["POST"])
@require_team_login_api
@validate_json_request(['points'])
def api_submit_score():
    team_id = session.get("team_id")
    
    data = request.json
    points = data.get("points", 0)
    
    try:
        # Validate points
        points = int(points)
        if points < 0 or points > 5:  # Assuming max 5 points per challenge
            return error_response("Invalid points value")
            
        # Update team score
        team = Team.query.get(team_id)
        if not team:
            return error_response("Team not found", 404)
            
        team.score += points
        db.session.commit()
        
        # Return flat structure for backward compatibility
        return jsonify({
            "success": True,
            "message": f"Added {points} points",
            "new_score": team.score
        })
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error: {str(e)}", 500)

def sanitize_input(text):
    """
    Sanitize user input to prevent XSS and other injection attacks.
    
    Args:
        text: Raw user input string
        
    Returns:
        Sanitized string safe for processing and display
    """
    if not text:
        return ""
    
    # Strip whitespace
    text = text.strip()
    
    # HTML escape to prevent XSS
    text = html.escape(text)
    
    # Remove any remaining script tags (defense in depth)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove event handlers (onclick, onerror, etc.)
    text = re.sub(r'\bon\w+\s*=', '', text, flags=re.IGNORECASE)
    
    # Remove javascript: protocol
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    
    return text

def filter_inappropriate_language(text):
    """
    Filter inappropriate language from user input.
    
    Args:
        text: User input string
        
    Returns:
        tuple: (is_appropriate: bool, filtered_text: str)
    """
    # Comprehensive list of inappropriate words for 11-12 year olds
    inappropriate_words = [
        # Profanity
        'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard', 'crap',
        'piss', 'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigger',
        # Variations and leetspeak
        'f*ck', 'sh*t', 'b*tch', 'fuk', 'fck', 'sht', 'btch',
        # Inappropriate topics
        'sex', 'porn', 'nude', 'naked', 'kill', 'die', 'suicide', 'drug'
    ]
    
    text_lower = text.lower()
    
    # Check for inappropriate words
    for word in inappropriate_words:
        # Use word boundaries to avoid false positives
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text_lower):
            return False, text
    
    return True, text

@app.route("/api/chat_guardian", methods=["POST"])
@require_team_login_api
@validate_json_request(['prompt', 'level'])
def api_chat_guardian():
    """
    Challenge 5: AI Guardian chat endpoint
    Accepts student prompts and returns Cipher's responses
    """
    team_id = session.get("team_id")
    
    # Initialize rate limiting in session
    if 'challenge5_rate_limit' not in session:
        session['challenge5_rate_limit'] = {
            'count': 0,
            'reset_time': datetime.now(timezone.utc).timestamp() + 60
        }
    
    # Check rate limiting (max 30 prompts per minute)
    rate_limit = session['challenge5_rate_limit']
    current_time = datetime.now(timezone.utc).timestamp()
    
    if current_time > rate_limit['reset_time']:
        # Reset counter
        session['challenge5_rate_limit'] = {
            'count': 0,
            'reset_time': current_time + 60
        }
        rate_limit = session['challenge5_rate_limit']
    
    if rate_limit['count'] >= 30:
        return error_response(
            "Rate limit exceeded. Please wait a moment before trying again.",
            429
        )
    
    # Get request data
    data = request.json
    prompt = data.get("prompt", "").strip()
    level = data.get("level", 1)
    
    # Validate input length before processing
    if not prompt:
        return error_response("Prompt cannot be empty")
    
    if len(prompt) > 500:
        return error_response("Prompt too long (max 500 characters). Please shorten your message.")
    
    if level not in [1, 2]:
        return error_response("Invalid level")
    
    # Sanitize input for XSS and injection attacks
    prompt = sanitize_input(prompt)
    
    # Filter inappropriate language
    is_appropriate, _ = filter_inappropriate_language(prompt)
    if not is_appropriate:
        # Return flat structure for backward compatibility
        return jsonify({
            "success": True,
            "response": "Let's keep our conversation friendly and appropriate! 😊 Remember, we're here to learn about cybersecurity in a positive way.",
            "reveals_password": False,
            "pattern_matched": "inappropriate_content"
        })
    
    # Get password for current level
    if 'challenge5_passwords' not in session:
        session['challenge5_passwords'] = generate_challenge5_passwords()
    
    # Try both integer and string keys (session serialization may convert keys)
    passwords = session['challenge5_passwords']
    password = passwords.get(level) or passwords.get(str(level))
    if not password:
        logger.error(f"Password not found for level {level}, team_id: {team_id}")
        return error_response("Password not found for level", 500)
    
    # Log the interaction (before processing)
    logger.info(f"PROMPT - Team: {team_id}, Level: {level}, Length: {len(prompt)}, Prompt: {prompt[:100]}")
    
    # Analyze prompt and generate response
    try:
        matcher = PatternMatcher(level, password)
        result = matcher.analyze_prompt(prompt)
        
        # Log the response
        logger.info(f"RESPONSE - Team: {team_id}, Level: {level}, Pattern: {result['pattern_matched']}, Reveals: {result['reveals_password']}")
        
        # Increment rate limit counter
        session['challenge5_rate_limit']['count'] += 1
        session.modified = True
        
        # Return flat structure for backward compatibility
        return jsonify({
            "success": True,
            "response": result['response'],
            "reveals_password": result['reveals_password'],
            "pattern_matched": result['pattern_matched']
        })
        
    except Exception as e:
        logger.error(f"Error processing prompt - Team: {team_id}, Level: {level}, Error: {str(e)}")
        return error_response(f"Error: {str(e)}", 500)

@app.route("/api/validate_password", methods=["POST"])
@require_team_login_api
@validate_json_request(['guess', 'level'])
def api_validate_password():
    """
    Challenge 5: Password validation endpoint
    Validates student's password guess against the secret password
    """
    team_id = session.get("team_id")
    
    # Get request data
    data = request.json
    guess = data.get("guess", "").strip()
    level = data.get("level", 1)
    
    # Validate input
    if not guess:
        # Return flat structure for backward compatibility
        return jsonify({
            "success": True,
            "correct": False,
            "message": "Please enter a password guess!"
        })
    
    if level not in [1, 2]:
        return error_response("Invalid level")
    
    # Get password for current level
    if 'challenge5_passwords' not in session:
        session['challenge5_passwords'] = generate_challenge5_passwords()
    
    # Try both integer and string keys (session serialization may convert keys)
    passwords = session['challenge5_passwords']
    password = passwords.get(level) or passwords.get(str(level))
    if not password:
        return error_response("Password not found for level", 500)
    
    # Log password validation attempt
    logger.info(f"PASSWORD_ATTEMPT - Team: {team_id}, Level: {level}, Guess: {guess}")
    
    # Perform case-insensitive validation
    if guess.lower() == password.lower():
        logger.info(f"PASSWORD_SUCCESS - Team: {team_id}, Level: {level}")
        # Return flat structure for backward compatibility
        return jsonify({
            "success": True,
            "correct": True,
            "message": "Correct! You successfully used prompt injection to extract the password!"
        })
    else:
        # Return flat structure for backward compatibility
        return jsonify({
            "success": True,
            "correct": False,
            "message": "Not quite! Keep trying different prompts to trick Cipher."
        })

@app.route("/api/report_issue", methods=["POST"])
@require_team_login_api
@validate_json_request(['issue_type', 'description'])
def api_report_issue():
    """
    Challenge 5: Report Issue endpoint
    Allows students to flag concerning content
    """
    team_id = session.get("team_id")
    
    # Get request data
    data = request.json
    issue_type = data.get("issue_type", "general")
    description = data.get("description", "").strip()
    context = data.get("context", "")
    
    # Validate input
    if not description:
        return error_response("Please describe the issue")
    
    # Sanitize description
    description = sanitize_input(description)
    context = sanitize_input(context)
    
    # Log the report
    logger.warning(f"ISSUE_REPORT - Team: {team_id}, Type: {issue_type}, Description: {description}, Context: {context}")
    
    return success_response(
        {},
        "Thank you for reporting this issue. An adult will review it."
    )

@app.route("/api/get_team_score")
@require_team_login_api
def get_team_score():
    team_id = session.get("team_id")
    
    team = Team.query.get(team_id)
    if not team:
        return error_response("Team not found", 404)
        
    return success_response(
        {"score": team.score},
        "Success"
    )

@app.route("/api/mark_challenge_complete", methods=["POST"])
@require_team_login_api
@validate_json_request(['challenge_id'])
def mark_challenge_complete():
    """Mark a challenge as completed in the session"""
    data = request.json
    challenge_id = data.get("challenge_id")
    
    # Initialize completed_challenges if not exists
    if 'completed_challenges' not in session:
        session['completed_challenges'] = {}
    
    # Mark as completed
    session['completed_challenges'][challenge_id] = True
    session.modified = True
    
    return success_response(
        {},
        f"Challenge {challenge_id} marked as complete"
    )

@app.route("/api/get_completion_status")
@require_team_login_api
def get_completion_status():
    """Get completion status for all challenges"""
    completed = session.get('completed_challenges', {})
    
    return success_response(
        {"completed_challenges": completed},
        "Success"
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)

application = app
