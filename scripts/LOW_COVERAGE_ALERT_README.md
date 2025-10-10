# Low Coverage Alert Script

## 📋 Overview

The `low-coverage-alert.js` script monitors test coverage across your builds and sends email alerts when coverage falls below acceptable thresholds.

## 🎯 Features

- **Automated Monitoring**: Checks the last 5 builds from Supabase
- **Coverage Threshold**: Alerts when coverage drops below 80% (configurable)
- **Email Notifications**: Sends detailed alerts with branch and commit information
- **Flexible Configuration**: Customizable via environment variables

## 📦 Prerequisites

1. **Node.js**: Version 22.x or compatible
2. **Dependencies**: 
   - `node-fetch` (already available in the project)
   - `nodemailer` (installed as dev dependency)
3. **Supabase Setup**: A `test_results` table with the following structure:
   ```sql
   CREATE TABLE test_results (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     branch TEXT,
     commit_hash TEXT,
     coverage_percent NUMERIC,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
4. **SMTP Server**: Access to an email server for sending alerts

## ⚙️ Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_KEY=your-supabase-service-role-key

# Coverage Configuration
COVERAGE_THRESHOLD=80  # Minimum acceptable coverage percentage (default: 80)

# SMTP Email Configuration
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false  # true for port 465, false for other ports
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=alertas@yourdomain.com
EMAIL_TO=devops@yourdomain.com
```

### Customization Options

- **Coverage Threshold**: Adjust `COVERAGE_THRESHOLD` to match your quality standards (e.g., 70, 80, 90)
- **Email Recipients**: Update `EMAIL_TO` to send alerts to the appropriate team (devops@..., qa@..., team@...)
- **Check Frequency**: Modify the Supabase query limit to check more or fewer builds

## 🚀 Usage

### Manual Execution

Run the script manually:

```bash
npm run alert:low-coverage
```

### Automated Scheduling

#### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/coverage-alert.yml`:

```yaml
name: Coverage Alert

on:
  schedule:
    # Run daily at 9 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run coverage alert
        env:
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          COVERAGE_THRESHOLD: 80
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_PORT: ${{ secrets.SMTP_PORT }}
          SMTP_SECURE: false
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_FROM: alertas@yourdomain.com
          EMAIL_TO: devops@yourdomain.com
        run: npm run alert:low-coverage
        continue-on-error: true
```

Don't forget to add the required secrets to your GitHub repository:
- `SUPABASE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`

#### Option 2: Cron Job (Linux/Unix)

Add to your crontab:

```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/travel-hr-buddy && npm run alert:low-coverage
```

## 📊 Output

### Success (No Issues)

```
🔍 Checking test coverage...

Configuration:
  - Coverage threshold: 80%
  - Supabase URL: https://your-project.supabase.co
  - Checking last 5 builds

✅ Successfully fetched 5 test results

✅ All recent builds meet the coverage threshold!
   All 5 builds have coverage >= 80%

🎉 No action required
```

### Alert (Low Coverage Detected)

```
🔍 Checking test coverage...

Configuration:
  - Coverage threshold: 80%
  - Supabase URL: https://your-project.supabase.co
  - Checking last 5 builds

✅ Successfully fetched 5 test results

⚠️  Low coverage detected:
🔴 main: 75% em abc123
🔴 feature/new-api: 72% em def456

📧 Sending email alert...
✅ Alert email sent successfully

⚠️ Action required: Review the affected builds and improve test coverage
```

### Email Alert

Recipients will receive an email with:
- **Subject**: ⚠️ Alerta de Baixa Cobertura nos Builds
- **Content**: List of branches with low coverage and their commit hashes
- **Format**: Both plain text and HTML

## 🔧 Troubleshooting

### Common Issues

1. **"SUPABASE_KEY environment variable is not set"**
   - Ensure `SUPABASE_KEY` is set in your `.env` file or environment

2. **"EMAIL_USER and EMAIL_PASS environment variables are required"**
   - Configure your SMTP credentials in the environment

3. **"Supabase API error: 401"**
   - Check that your `SUPABASE_KEY` has the correct permissions
   - Ensure you're using the service role key, not the anon key

4. **"EAUTH" email error**
   - Verify your email credentials are correct
   - Check that your SMTP server allows connections from your IP
   - Some providers (like Gmail) require app-specific passwords

5. **No data returned**
   - Verify the `test_results` table exists in Supabase
   - Check that test results are being stored correctly
   - Ensure Row Level Security (RLS) policies allow reading

## 📈 Integration with CI/CD

To store coverage results in Supabase during your CI/CD pipeline:

```yaml
# In your GitHub Actions workflow
- name: Store coverage results
  run: |
    COVERAGE=$(jq -r '.total.lines.pct' coverage/coverage-summary.json)
    curl -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/test_results" \
      -H "apikey: ${{ secrets.SUPABASE_KEY }}" \
      -H "Authorization: Bearer ${{ secrets.SUPABASE_KEY }}" \
      -H "Content-Type: application/json" \
      -d "{\"branch\":\"$GITHUB_REF_NAME\",\"commit_hash\":\"$GITHUB_SHA\",\"coverage_percent\":$COVERAGE}"
```

## 🎨 Customization Ideas

1. **Slack Integration**: Replace email with Slack webhooks
2. **Multiple Thresholds**: Different thresholds for different branches
3. **Trend Analysis**: Check if coverage is declining over time
4. **Team Notifications**: Route alerts to specific teams based on branch
5. **Dashboard Integration**: Send results to a monitoring dashboard

## 📝 License

This script is part of the Nautilus One Travel HR Buddy project.

## 🤝 Contributing

To improve this script:
1. Follow the project's coding standards
2. Test thoroughly with mock data
3. Update this documentation
4. Submit a pull request

## 📞 Support

For issues or questions:
- Open an issue in the repository
- Contact the DevOps team
- Check the project's main README
