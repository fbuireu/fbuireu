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

### If private reporting is unavailable

Private reporting is open to any GitHub account. If it is not available to you, open an issue asking me to get
in touch and **say nothing about the finding in it**: the details belong in the private thread, not in a public
issue.

### What to Expect

- **Acknowledgment**: we'll acknowledge receipt within 48 hours
- **Timeline**: workflow and link fixes ship with a push, so confirmed
  reports should be fixed within days
- **Credit**: we'll credit you (unless you prefer to remain anonymous)
