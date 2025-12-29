# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of LoL Stonks RSS seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email us at: [security@yourdomain.com] (Update with your security contact)
3. Or use GitHub's private vulnerability reporting feature

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
- Full paths of source file(s) related to the manifestation of the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response within 7 days indicating next steps
- We will keep you informed about the progress toward a fix
- We will notify you when the vulnerability is fixed

### Disclosure Policy

- We will coordinate with you on the disclosure timeline
- We typically aim to disclose within 90 days of the initial report
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When deploying LoL Stonks RSS:

### Docker Security
- Always use the latest stable release
- Run containers with non-root user (already configured)
- Use Docker secrets for sensitive data
- Enable Docker content trust
- Regularly update base images

### Environment Configuration
- Never commit `.env` files to version control
- Use strong, unique values for all secrets
- Rotate API keys and credentials regularly
- Limit environment variable exposure

### Network Security
- Use HTTPS for all external communications
- Configure proper firewall rules
- Implement rate limiting on endpoints
- Use reverse proxy (nginx, Traefik) in production

### Monitoring
- Enable logging and monitoring
- Set up alerts for suspicious activities
- Regularly review access logs
- Monitor for unusual resource usage

## Known Security Considerations

### RSS Feed Parsing
- All external RSS feeds are parsed with XML security measures
- Input validation is performed on all external data
- Rate limiting prevents abuse of feed endpoints

### API Key Management
- API keys should be stored in environment variables
- Keys are never logged or exposed in error messages
- Use read-only API keys where possible

## Updates and Patches

Security updates will be:
- Released as soon as possible after verification
- Documented in CHANGELOG.md
- Announced in release notes
- Tagged with "security" label

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged in our security advisories.
