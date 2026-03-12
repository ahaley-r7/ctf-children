# Chromium Test Framework

Automated end-to-end testing framework for the Empower Girls CTF application using Robot Framework with Browser library (Playwright-based Chromium automation).

## Overview

This framework tests the complete user journey through the CTF application:
- Team registration
- Challenge 1: Phishing Detection
- Challenge 2: Vulnerability Scanning
- Challenge 3: Encryption
- Challenge 4: Password Safety
- Challenge 5: AI Prompt Injection
- Scoreboard validation

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher (required by Playwright)
- The Empower Girls CTF application running locally

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize Robot Framework Browser library (installs Playwright browsers):
```bash
rfbrowser init
```

This will download and install Chromium and other required browser binaries.

## Running Tests

### Using the execution scripts (recommended)

The framework provides convenient execution scripts that handle configuration:

**Shell script (Unix/Mac/Linux):**
```bash
# Run all tests in headless mode
./run_tests.sh

# Run with visible browser
./run_tests.sh -v

# Run against different environment
./run_tests.sh -u http://localhost:8080

# Run specific test
./run_tests.sh -t tests/complete_flow.robot

# Run with visible browser and specific test
./run_tests.sh -v -t tests/test_challenge1.robot

# Run tests with specific tag
./run_tests.sh -i smoke

# Run with debug logging
./run_tests.sh --loglevel DEBUG
```

**Python script (cross-platform):**
```bash
# Run all tests in headless mode
python run_tests.py

# Run with visible browser
python run_tests.py -v

# Run against different environment
python run_tests.py -u http://localhost:8080

# Run specific test
python run_tests.py -t tests/complete_flow.robot

# Run with visible browser and specific test
python run_tests.py -v -t tests/test_challenge1.robot

# Run tests with specific tag
python run_tests.py -i smoke

# Run with debug logging
python run_tests.py --loglevel DEBUG
```

### Using robot command directly

You can also run tests directly with the robot command:

```bash
# Run all tests
robot tests/

# Run specific test suite
robot tests/complete_flow.robot

# Run with visible browser (headed mode)
robot --variable HEADLESS:False tests/

# Run against different environment
robot --variable BASE_URL:http://localhost:5000 tests/

# Run with custom output directory
robot --outputdir results/ tests/
```

## Test Reports

After test execution, reports are generated in the `results/` directory:
- `report.html` - High-level test report
- `log.html` - Detailed test execution log
- `output.xml` - Machine-readable test results
- Screenshots captured on test failures

## Project Structure

```
chromium-test-framework/
├── tests/                      # Test suites
│   ├── complete_flow.robot     # Full user journey test
│   ├── challenge_tests.robot   # Individual challenge tests
│   └── scoreboard_tests.robot  # Scoreboard validation tests
├── resources/                  # Reusable keywords and page objects
│   ├── common.robot            # Shared setup/teardown keywords
│   └── pages/                  # Page object resource files
│       ├── registration_page.robot
│       ├── challenge1_page.robot
│       ├── challenge2_page.robot
│       ├── challenge3_page.robot
│       ├── challenge4_page.robot
│       ├── challenge5_page.robot
│       └── scoreboard_page.robot
├── config/                     # Configuration files
│   └── test_config.robot       # Test variables and settings
├── results/                    # Test execution reports
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Configuration

Test configuration is managed in `config/test_config.robot`:
- `BASE_URL` - Application URL (default: http://localhost:5000)
- `HEADLESS` - Run browser in headless mode (default: True)
- `TIMEOUT` - Element wait timeout in seconds (default: 10)

## Development

### Running Python utility tests
```bash
pytest
```

### Running property-based tests
```bash
pytest -v -k property
```

## Troubleshooting

### Browser not launching
- Ensure `rfbrowser init` was run successfully
- Check that Node.js is installed and accessible
- Try running with `--variable HEADLESS:False` to see browser errors

### Application connection errors
- Verify the CTF application is running on the configured BASE_URL
- Check that the application is accessible in a regular browser
- Ensure no firewall is blocking the connection

### Element not found errors
- Check if the application UI has changed
- Review screenshots in the results directory
- Increase timeout value if elements load slowly

## Contributing

When adding new tests:
1. Follow the Page Object pattern for page interactions
2. Add reusable keywords to appropriate resource files
3. Keep test cases focused and minimal
4. Ensure tests clean up after themselves
5. Add property-based tests for universal behaviors

## License

This framework is part of the Empower Girls CTF project.
