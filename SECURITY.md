# Security Policy

## Supported Versions

There are no versions: this is a GitHub profile repository, and what is on
`main` is what the profile shows. A fix ships by pushing.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub
issues.**

The tree is markdown, images and YAML, with no application code. What is
still worth a private report:

- A **workflow problem**: the scheduled automation runs with repository
  secrets, so an injection through generated content, an over-privileged
  permission block, or a compromised third-party action are all real findings
- A **link or embed pointing somewhere it shouldn't**: an expired domain, a
  redirect through something untrustworthy

### Preferred Method: GitHub Private Vulnerability Reporting

1. Go to the [Security tab](https://github.com/fbuireu/fbuireu/security)
2. Click "Report a vulnerability"
3. Fill in the details

### Alternative: Email

Send an email to **fbuireu@gmail.com** with what you found, where, and how to
reproduce it.

### What to Expect

- **Acknowledgment**: we'll acknowledge receipt within 48 hours
- **Timeline**: workflow and link fixes ship with a push, so confirmed
  reports should be fixed within days
- **Credit**: we'll credit you (unless you prefer to remain anonymous)
