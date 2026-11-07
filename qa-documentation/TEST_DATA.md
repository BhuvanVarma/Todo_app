# Test Data Catalog: PERN Todo Application

**Document Version**: 1.0.0
**Author**: Senior QA Engineer / Test Architect
**Purpose**: Standardized, reusable test data fixtures for UI, API, and Database automation suites.

> [!IMPORTANT]
> All passwords and credentials listed below are synthetic placeholders reserved strictly for local testing environments. Never use production secrets or personal accounts.

---

## 1. User Account Test Data

### 1.1 Valid User Fixtures
```json
{
  "standardUser": {
    "name": "Jane Developer",
    "email": "jane.developer_{TIMESTAMP}@example.com",
    "password": "ValidPassword123",
    "confirmPassword": "ValidPassword123"
  },
  "minBoundaryUser": {
    "name": "Al",
    "email": "al.min_{TIMESTAMP}@example.com",
    "password": "Password1",
    "confirmPassword": "Password1"
  },
  "maxBoundaryUser": {
    "name": "Alexandrina Bartholomew-Montgomery-Fitzwilliam-IV",
    "email": "max.boundary_{TIMESTAMP}@example.com",
    "password": "LongPasswordWithNumbers1234567890AndSpecialChars!@#$%^&*()_+72CharactersMax",
    "confirmPassword": "LongPasswordWithNumbers1234567890AndSpecialChars!@#$%^&*()_+72CharactersMax"
  }
}
```

### 1.2 Multi-Tenant Isolation Accounts
```json
{
  "userA": {
    "name": "Tenant Alpha",
    "email": "tenant.alpha_{TIMESTAMP}@example.com",
    "password": "AlphaPassword123",
    "confirmPassword": "AlphaPassword123"
  },
  "userB": {
    "name": "Tenant Beta",
    "email": "tenant.beta_{TIMESTAMP}@example.com",
    "password": "BetaPassword123",
    "confirmPassword": "BetaPassword123"
  }
}
```

### 1.3 Invalid User Data Matrix
| Test Case Category | Name Field | Email Field | Password Field | Confirm Password | Expected Failure Reason |
|---|---|---|---|---|---|
| **All Blank** | `""` | `""` | `""` | `""` | All fields required errors |
| **Short Name** | `"A"` (1 char) | `"valid@test.com"` | `"Pass1234"` | `"Pass1234"` | Name must be 2–50 characters |
| **Padded Short Name** | `"  A  "` | `"valid@test.com"` | `"Pass1234"` | `"Pass1234"` | Trimmed name is 1 char |
| **Oversized Name** | 51 chars | `"valid@test.com"` | `"Pass1234"` | `"Pass1234"` | Max length 50 enforced |
| **No @ in Email** | `"Bob"` | `"plainaddress"` | `"Pass1234"` | `"Pass1234"` | Invalid email format |
| **No Domain in Email**| `"Bob"` | `"user@"` | `"Pass1234"` | `"Pass1234"` | Invalid email format |
| **Whitespace Email** | `"Bob"` | `"user @domain.com"` | `"Pass1234"` | `"Pass1234"` | Invalid email format |
| **Short Password** | `"Bob"` | `"valid@test.com"` | `"short1"` (6 chars) | `"short1"` | Password must be 8–72 characters |
| **No Number in Pass**| `"Bob"` | `"valid@test.com"` | `"LettersOnlyPass"` | `"LettersOnlyPass"` | Must contain at least one number |
| **No Letter in Pass**| `"Bob"` | `"valid@test.com"` | `"1234567890"` | `"1234567890"` | Must contain at least one letter |
| **Password Mismatch**| `"Bob"` | `"valid@test.com"` | `"Pass1234"` | `"Mismatch99"` | Passwords do not match |

---

## 2. Todo Item Test Data

### 2.1 Valid Todo Fixtures
```json
{
  "minimalTodo": {
    "title": "Quick Task"
  },
  "standardTodo": {
    "title": "Deploy staging build to cloud",
    "description": "Run smoke tests after deployment completes and notify team on Slack."
  },
  "maxBoundaryTodo": {
    "title": "T".repeat(100),
    "description": "D".repeat(500)
  },
  "specialCharactersTodo": {
    "title": "Review PR #42 & test <Component /> + 'quotes' & \"double-quotes\"",
    "description": "Unicode characters check: ✅ 🚀 ⚡ 漢字 العربية — symbols: !@#$%^&*()_+"
  }
}
```

### 2.2 Invalid Todo Data Matrix
| Category | Title Input | Description Input | Expected Error / Result |
|---|---|---|---|
| **Empty Title** | `""` | `null` | `Title is required` (HTTP 400) |
| **Whitespace Title** | `"     "` | `"Valid description"` | `Title is required` (HTTP 400) |
| **Oversized Title** | 101 characters | `null` | `Title must be 1–100 characters` (HTTP 400) |
| **Oversized Description** | `"Valid Title"` | 501 characters | `Description must be at most 500 characters` (HTTP 400) |

---

## 3. Route Parameter Test Data (`:id`)

| Test Input | Input Type | Expected Validation Result |
|---|---|---|
| `1` | Valid Positive Integer | Success (Processes route handler) |
| `42` | Valid Positive Integer | Success (Processes route handler) |
| `0` | Zero | Rejection: `Todo ID must be a positive integer` (400) |
| `-1` | Negative Integer | Rejection: `Todo ID must be a positive integer` (400) |
| `abc` | String / Alpha | Rejection: `Todo ID must be a positive integer` (400) |
| `1.5` | Float / Decimal | Rejection: `Todo ID must be a positive integer` (400) |
| `null` | Null literal | Rejection: `Todo ID must be a positive integer` (400) |
| `99999999` | Non-Existent Integer | Route valid, Database lookup returns `404 Not Found` |
