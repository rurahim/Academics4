# Academics4 Database - Complete Data Dump

## Summary

| Table | Record Count |
|-------|--------------|
| users | 6 |
| volunteers | 3 |
| students | 2 |
| refresh_tokens | 19 |
| subject_assignments | 2 |
| match_triggers | 5 |
| embedding_cache | 17 |
| matches | 0 |
| sessions | 0 |
| feedback | 0 |
| causes | 0 |
| fields_of_study | 0 |
| email_templates | 0 |
| match_scores_cache | 0 |

---

## Table: users (6 records)

| id | email | password_hash | role | is_active | is_verified | created_at | updated_at | last_login |
|----|-------|---------------|------|-----------|-------------|------------|------------|------------|
| 35dbd955-f3bf-4ea2-ab4c-c08b035927d1 | rurahim93@gmail.com | $2b$12$Fjz412jMSue1OIL5RQpeouzFknz84j1YiaGN96bPDzqaUPjz0o7PS | volunteer | true | false | 2025-11-28 06:07:10.556 | 2025-11-28 06:34:42.277 | 2025-11-28 06:34:42.276 |
| 0cf40154-f4ff-434e-8d4b-6649e7490aaf | rurahim92@gmail.com | $2b$12$NoPslf.Wlucgf5j46WqulOP2B53nmG7TniLJ2eOjrfW5T6YRH6hp. | student | true | false | 2025-11-27 22:37:12.242 | 2025-11-28 06:53:49.848 | 2025-11-28 06:53:49.847 |
| cbf7c3ee-767b-4b0b-abd7-b253250b0431 | ismail@gmail.com | $2b$12$vJAtBStye/FFwSJMKJdzEeyB.qxGVE63iDdeJFTgCCA2WuDgKl0CK | volunteer | true | false | 2025-11-28 15:42:46.84 | 2025-11-28 15:42:46.84 | NULL |
| 796c5e5d-0293-43d9-bd59-118d2f3ea068 | joseph@gmail.com | $2b$12$iDKWRAKhrqHY7JCO4mv.luIL0hZmh6tZuc6N57deTSbcxbjmCa5YC | student | true | false | 2025-11-28 15:44:40.853 | 2025-11-28 15:44:40.853 | NULL |
| e6df8b25-0faf-40e9-8b0b-7c9ebedf6f51 | john@gmail.com | $2b$12$m5J/eQ3KtzIe/08J4Y7ste8VNz3GxgDOmYnznAV6bmaUiz6s3LaT. | volunteer | true | false | 2025-11-28 15:03:09.227 | 2025-11-29 13:06:16.38 | NULL |
| 7621f134-8317-4b55-8f7c-f937941cfb63 | admin@academics4.org | $2b$10$pBIKdKWWKXojGsvYvyfGZORWQZcGQzo7J1ZmhGAaZUmH0PrrdxLbm | admin | true | true | 2025-11-28 06:37:17.881 | 2025-12-03 15:47:53.543 | 2025-12-03 15:47:53.541 |

---

## Table: volunteers (3 records)

### Volunteer 1: Abdul Rauf
| Column | Value |
|--------|-------|
| id | a84a14a9-f426-49cd-a086-db995ff3e733 |
| user_id | 35dbd955-f3bf-4ea2-ab4c-c08b035927d1 |
| full_name | Abdul Rauf |
| age | 31 |
| phone_number | 3457770757 |
| city | Gaza |
| country | Palestine |
| area | Khan Younus |
| university_affiliation | Iqra University |
| fields_of_expertise | {Data Science, Computer Science, Software Engineering, Medicine} |
| subjects_qualified | {Artificial Intelligence, C++, Java} |
| languages_spoken | {English} |
| preferred_language | English |
| online_teaching_experience | true |
| diverse_background_experience | true |
| hours_per_week_available | 10 |
| current_capacity | 0 |
| max_capacity | 5 |
| capacity_set_by | volunteer |
| is_available | true |
| cause | Gaza |
| additional_support_willing | (empty) |
| bio | I am a motivated teacher |
| rating | 0 |
| total_hours_volunteered | 0 |
| students_helped | 0 |
| created_at | 2025-11-28 06:10:52.551 |
| updated_at | 2025-11-28 06:10:52.551 |

### Volunteer 2: Ismail
| Column | Value |
|--------|-------|
| id | 7d621b9b-7420-4211-be2a-a6be833707de |
| user_id | cbf7c3ee-767b-4b0b-abd7-b253250b0431 |
| full_name | Ismail |
| age | 22 |
| phone_number | 1234567 |
| city | Lahore |
| country | Pakistan |
| area | (empty) |
| university_affiliation | LUMS |
| fields_of_expertise | {Electrical Engineering, Civil Engineering} |
| subjects_qualified | {Machines, Dam} |
| languages_spoken | {English, Arabic} |
| preferred_language | English |
| online_teaching_experience | true |
| diverse_background_experience | true |
| hours_per_week_available | 10 |
| current_capacity | 0 |
| max_capacity | 5 |
| capacity_set_by | volunteer |
| is_available | true |
| cause | Gaza |
| additional_support_willing | (empty) |
| bio | Has ability to teach many students |
| rating | 0 |
| total_hours_volunteered | 0 |
| students_helped | 0 |
| created_at | 2025-11-28 15:43:55.109 |
| updated_at | 2025-11-28 15:43:55.109 |

### Volunteer 3: John
| Column | Value |
|--------|-------|
| id | f7fbe127-f0fc-4b73-a8e6-44351f1ec49f |
| user_id | e6df8b25-0faf-40e9-8b0b-7c9ebedf6f51 |
| full_name | John |
| age | 28 |
| phone_number | 12345 |
| city | Bangkok |
| country | Thailand |
| area | (empty) |
| university_affiliation | Iqra University |
| fields_of_expertise | {Computer Science, Mathematics, Chemistry, Biology} |
| subjects_qualified | {Organic Chemistry, Java, C++, Database, calculus, geometry} |
| languages_spoken | {English, Arabic} |
| preferred_language | English |
| online_teaching_experience | true |
| diverse_background_experience | false |
| hours_per_week_available | 2 |
| current_capacity | 0 |
| max_capacity | 5 |
| capacity_set_by | admin |
| is_available | true |
| cause | Gaza |
| additional_support_willing | (empty) |
| bio | (empty) |
| rating | 0 |
| total_hours_volunteered | 0 |
| students_helped | 0 |
| created_at | 2025-11-28 15:04:54.749 |
| updated_at | 2025-11-29 13:06:16.375 |

---

## Table: students (2 records)

### Student 1: Joseph
| Column | Value |
|--------|-------|
| id | 3ebc72c2-c554-4642-874b-f005dd898492 |
| user_id | 796c5e5d-0293-43d9-bd59-118d2f3ea068 |
| full_name | Joseph |
| age | 40 |
| gender | male |
| phone_number | 111 |
| alternative_contact | (empty) |
| current_city | Gaza |
| current_country | Palestine |
| area | Northern |
| original_location | (empty) |
| cause | Gaza |
| fields_of_study | {Medicine} |
| topics_need_support | [{"status": "unassigned", "keyword": "pharma", "assignedTo": null}, {"status": "unassigned", "keyword": "neutrceutical", "assignedTo": null}, {"status": "unassigned", "keyword": "drugs", "assignedTo": null}] |
| original_university | ABC |
| current_university | (empty) |
| credits_remaining | 10 |
| has_transcripts | true |
| preferred_language | English |
| languages_spoken | {Arabic, English} |
| hours_per_week_needed | 20 |
| device_access_level | 3 |
| internet_access_level | 3 |
| materials_access_level | 3 |
| special_needs | (empty) |
| educational_background | (empty) |
| career_goals | (empty) |
| created_at | 2025-11-28 15:46:40.745 |
| updated_at | 2025-11-28 15:46:40.745 |

### Student 2: Rauf ur Rahim
| Column | Value |
|--------|-------|
| id | 6c6fef9e-7df0-489d-a01e-4b2d70c8ed39 |
| user_id | 0cf40154-f4ff-434e-8d4b-6649e7490aaf |
| full_name | Rauf ur Rahim |
| age | 31 |
| gender | male |
| phone_number | 3457770757 |
| alternative_contact | (empty) |
| current_city | Gaza |
| current_country | Palestine |
| area | Khan Younus |
| original_location | (empty) |
| cause | Gaza |
| fields_of_study | {Software Engineering, Mathematics} |
| topics_need_support | [{"status": "unassigned", "keyword": "calculus", "assignedTo": null}, {"status": "unassigned", "keyword": "python programming", "assignedTo": null}, {"status": "unassigned", "keyword": "artificial intelligence", "assignedTo": null}] |
| original_university | Iqra University |
| current_university | (empty) |
| credits_remaining | 4 |
| has_transcripts | true |
| preferred_language | English |
| languages_spoken | {English, Arabic} |
| hours_per_week_needed | 10 |
| device_access_level | 5 |
| internet_access_level | 2 |
| materials_access_level | 1 |
| special_needs | I need assistance in learning programming |
| educational_background | BS |
| career_goals | To improve my programming and mathematical skills |
| created_at | 2025-11-27 22:40:26.354 |
| updated_at | 2025-11-29 12:43:22.677 |

---

## Table: refresh_tokens (19 records)

| id | token | user_id | expires_at | created_at |
|----|-------|---------|------------|------------|
| 03749a47-f417-4860-ba33-aea881ce639e | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwY2Y0MDE1NC1mNGZmLTQzNGUtOGQ0Yi02NjQ5ZTc0OTBhYWYiLCJlbWFpbCI6InJ1cmFoaW05MkBnbWFpbC5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc2NDI4MzAzMiwiZXhwIjoxNzY0ODg3ODMyfQ.wi-k9GMh3sF4aP2tk4AqOVNevxXkXwMREtNKKOg2hkk | 0cf40154-f4ff-434e-8d4b-6649e7490aaf | 2025-12-04 22:37:12.252 | 2025-11-27 22:37:12.253 |
| a6715b67-7523-4d06-b7e7-e9cbb4a6fbf0 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIzNWRiZDk1NS1mM2JmLTRlYTItYWI0Yy1jMDhiMDM1OTI3ZDEiLCJlbWFpbCI6InJ1cmFoaW05M0BnbWFpbC5jb20iLCJyb2xlIjoidm9sdW50ZWVyIiwiaWF0IjoxNzY0MzEwMDMwLCJleHAiOjE3NjQ5MTQ4MzB9.vyuqLQ-TVGhPxcqhQsKXmCyyWjQ57EPNrJDhLPAnGhE | 35dbd955-f3bf-4ea2-ab4c-c08b035927d1 | 2025-12-05 06:07:10.562 | 2025-11-28 06:07:10.562 |
| 6ccb12ad-f089-4c44-a7d5-c1db42262455 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzExODgyLCJleHAiOjE3NjQ5MTY2ODJ9.ynb-6alkvsa0YziCUf0vbstvyFx5UShLrqpz831aUaU | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 06:38:02.261 | 2025-11-28 06:38:02.261 |
| 40a30116-3402-4450-a486-e0b62ec2c09e | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzEzMDM1LCJleHAiOjE3NjQ5MTc4MzV9.HiTvc2-fjM_0Vuw0fDvvWRxIN2D5OSWJhhZjbgQ-F1E | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 06:57:15.392 | 2025-11-28 06:57:15.393 |
| f31065c5-bfa2-4800-8d60-46deb31c2c8b | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzE0MTM0LCJleHAiOjE3NjQ5MTg5MzR9.-5zsXQKV9VPkvt2jDb7D2o_vkef2uhFnsP2hwra8_Wk | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 07:15:34.024 | 2025-11-28 07:15:34.024 |
| c6fc0746-ed34-431e-84e3-daae875eb755 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzIwMDA0LCJleHAiOjE3NjQ5MjQ4MDR9.uQYS92IWqQKfvFyW7nwf_dAI932YXoh0DXIALTyhpFg | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 08:53:24.444 | 2025-11-28 08:53:24.445 |
| 51556b77-a2ac-4110-8457-0cc2172b1c1e | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzIyNjM1LCJleHAiOjE3NjQ5Mjc0MzV9.LMOzsgWYPBkNt7PH6FEEod1F0p2LJBh21dcLJA3yaYU | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 09:37:15.827 | 2025-11-28 09:37:15.828 |
| aa99b20e-2e51-4cb9-872f-73f160de2c2a | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzI0NTA0LCJleHAiOjE3NjQ5MjkzMDR9.NlYDqBEwfUSsvqV6ffNUh3kvWiXcEWUp9GLic1Xbb6o | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 10:08:24.878 | 2025-11-28 10:08:24.879 |
| 2ef3d5f3-16fb-4ad3-88a6-fe7db66e7bfc | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzI1OTk1LCJleHAiOjE3NjQ5MzA3OTV9.J6CclplXR1tFxyxWbd_jKLFD9eBQAc3HmPLBeZuqj8M | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 10:33:15.009 | 2025-11-28 10:33:15.01 |
| e16b7230-5802-4efe-af6c-a97daf891020 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzQyMzcyLCJleHAiOjE3NjQ5NDcxNzJ9.JGf0Ho3lvb_0I-nbvzgdzI0rg7bBJynM0Ja3632CNeg | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 15:06:12.265 | 2025-11-28 15:06:12.265 |
| 5efaf389-1698-4f56-970d-72e08e84beb3 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzQ0ODE3LCJleHAiOjE3NjQ5NDk2MTd9.ByF-_o1DFfjkmugZ6uTfor03a8qDTRgkqtl1B6fg7L8 | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 15:46:57.694 | 2025-11-28 15:46:57.695 |
| d02c77d6-0bf1-444e-8f69-d1af9fe0e1ea | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0MzU4NzI5LCJleHAiOjE3NjQ5NjM1Mjl9.tkUfJDQhNm85SFrqYOFtpOlSMBYP2MrPi4GVauIbL08 | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-05 19:38:49.045 | 2025-11-28 19:38:49.046 |
| 4ab98c2f-1cd0-4f32-af87-a5f8a6d4a52d | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NDAyMjgyLCJleHAiOjE3NjUwMDcwODJ9.IA5rIPM3dFIvt4f5jhUX6rw8MUsbhdt93Du6RRIS-hY | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-06 07:44:42.713 | 2025-11-29 07:44:42.714 |
| 3c6880a3-8a16-483f-9f7e-deeb80d21d59 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NDA0MjAyLCJleHAiOjE3NjUwMDkwMDJ9.r6W30OcgkbFY9Y-Ksm0r0jINARaLd_opU8fJXuoq3eo | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-06 08:16:42.789 | 2025-11-29 08:16:42.79 |
| 434b3740-b6b1-4772-8bd3-19d538d52ac0 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NDEzMTQ3LCJleHAiOjE3NjUwMTc5NDd9.dMZBFtiqfA-E4xrQE9sPWLTMmOjLnuUT6Zs1J8K71Is | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-06 10:45:47.003 | 2025-11-29 10:45:47.004 |
| 6ea263cb-e422-4553-a6d0-3a02e093212b | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NDE5ODEzLCJleHAiOjE3NjUwMjQ2MTN9.xLobTLzihyW6cmTjni3GstHLO3rX_nX2-JAGuro9eoM | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-06 12:36:53.322 | 2025-11-29 12:36:53.323 |
| 79c65493-3587-4987-9337-037f45f65a42 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NDIwODUzLCJleHAiOjE3NjUwMjU2NTN9.Op-xTjYLV1A4tH_s1Ze29vyPDbn8T5zSzdojnkCN730 | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-06 12:54:13.441 | 2025-11-29 12:54:13.442 |
| 094249e2-84ba-4cbc-afbf-e2bd28a8a431 | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NDk2MTM2LCJleHAiOjE3NjUxMDA5MzZ9.ZE6TwKIu1Gnh_53Hgn9kHNSpDyLqCE63qjQM1WDEp74 | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-07 09:48:56.657 | 2025-11-30 09:48:56.658 |
| 18e6bb6b-19f8-4a9a-95f9-d02b61727c6a | eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI3NjIxZjEzNC04MzE3LTRiNTUtOGY3Yy1mOTM3OTQxY2ZiNjMiLCJlbWFpbCI6ImFkbWluQGFjYWRlbWljczQub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0Nzc2ODczLCJleHAiOjE3NjUzODE2NzN9.igdl41iLTVnOmo_3OLWkjfcrKGYyJ8YlfqMRL8Ug-BU | 7621f134-8317-4b55-8f7c-f937941cfb63 | 2025-12-10 15:47:53.555 | 2025-12-03 15:47:53.556 |

---

## Table: subject_assignments (2 records)

| id | student_id | subject_keyword | assigned_to_volunteer_id | assigned_by_admin_id | action | previous_volunteer_id | reason | created_at |
|----|------------|-----------------|--------------------------|----------------------|--------|----------------------|--------|------------|
| 798ec51d-c643-4db4-95f9-4257bd89e38d | 6c6fef9e-7df0-489d-a01e-4b2d70c8ed39 | artificial intelligence | a84a14a9-f426-49cd-a086-db995ff3e733 | 7621f134-8317-4b55-8f7c-f937941cfb63 | assigned | NULL | NULL | 2025-11-29 12:38:21.847 |
| 08278e70-dfca-4850-80b8-ae5701b008ff | 6c6fef9e-7df0-489d-a01e-4b2d70c8ed39 | artificial intelligence | NULL | 7621f134-8317-4b55-8f7c-f937941cfb63 | unassigned | a84a14a9-f426-49cd-a086-db995ff3e733 | NULL | 2025-11-29 12:43:22.681 |

---

## Table: match_triggers (5 records)

| id | trigger_type | entity_id | processed | matches_found | processed_at | created_at |
|----|--------------|-----------|-----------|---------------|--------------|------------|
| d3f97e0f-1dc8-4e3e-87fb-d41cb0ef5291 | new_student | 6c6fef9e-7df0-489d-a01e-4b2d70c8ed39 | false | 0 | NULL | 2025-11-27 22:40:26.359 |
| 3b06e6f2-b5da-4cb3-98bf-7588d8915eb7 | new_volunteer | a84a14a9-f426-49cd-a086-db995ff3e733 | false | 0 | NULL | 2025-11-28 06:10:52.557 |
| db75c5c6-1992-4d68-8209-9c61cdf795aa | new_volunteer | f7fbe127-f0fc-4b73-a8e6-44351f1ec49f | false | 0 | NULL | 2025-11-28 15:04:54.761 |
| 40c73ad9-d3c7-4f12-b934-79e2d888136f | new_volunteer | 7d621b9b-7420-4211-be2a-a6be833707de | false | 0 | NULL | 2025-11-28 15:43:55.117 |
| a95f18ee-235b-473b-a684-f4774d718e90 | new_student | 3ebc72c2-c554-4642-874b-f005dd898492 | false | 0 | NULL | 2025-11-28 15:46:40.75 |

---

## Table: embedding_cache (17 records)

| id | text | created_at | updated_at |
|----|------|------------|------------|
| e97f0049-a8ae-4b65-8bb3-517e95e67366 | c++ | 2025-11-28 15:02:21.869 | 2025-11-28 15:02:38.703 |
| 6e460846-0e70-462c-88a9-d6a22bde4d73 | java | 2025-11-28 15:02:21.872 | 2025-11-28 15:02:38.704 |
| 3fc6d214-e812-4906-8123-8c80fa5437e6 | calculus | 2025-11-28 15:02:21.874 | 2025-11-28 15:02:38.706 |
| d548a2e9-3692-4c85-9bac-0d8b3d1000cb | python programming | 2025-11-28 15:02:21.884 | 2025-11-28 15:02:38.708 |
| c43cc5c9-a517-4018-8141-dd608f433e4e | artificial intelligence | 2025-11-28 15:02:21.867 | 2025-11-28 15:02:38.711 |
| 834bde26-243e-4ac9-8766-db0c224e70eb | organic chemistry | 2025-11-28 15:19:55.314 | 2025-11-28 15:19:55.314 |
| 8d3e3a29-c976-485d-af38-2f13df64035b | geometry | 2025-11-28 15:19:55.319 | 2025-11-28 15:19:55.319 |
| 3855d9a1-f4cc-430b-bcf5-d4c79a7af375 | computer science | 2025-11-28 15:19:55.336 | 2025-11-28 15:19:55.336 |
| bf6cddb1-994a-43d3-a903-db1bde93bf63 | chemistry | 2025-11-28 15:19:55.346 | 2025-11-28 15:19:55.346 |
| 704564f8-4527-437b-b256-a8f1ba97cf01 | database | 2025-11-28 15:19:55.316 | 2025-11-28 15:19:55.316 |
| a40cbe2e-8564-47e9-a704-dcc135cc39bf | biology | 2025-11-28 15:19:55.349 | 2025-11-28 15:19:55.349 |
| 91114e11-fb59-4a72-9474-0e11decc1d37 | mathematics | 2025-11-28 15:19:55.343 | 2025-11-28 15:19:55.35 |
| b8ac36da-f56a-4362-b472-70aa9c9965d2 | machines | 2025-11-28 19:39:07.712 | 2025-11-28 19:39:07.712 |
| 99d3df6c-0c17-4d91-acf6-d2b20b53f59d | dam | 2025-11-28 19:39:07.714 | 2025-11-28 19:39:07.714 |
| e1639176-6516-4795-83db-563c8af501cc | pharma | 2025-11-28 19:39:07.588 | 2025-11-28 19:39:07.714 |
| ccc30327-b19a-48d4-b47e-d8ddc7b01628 | neutrceutical | 2025-11-28 19:39:07.591 | 2025-11-28 19:39:07.716 |
| d0073a16-5f4f-44bf-a26d-9d5d129c116d | drugs | 2025-11-28 19:39:07.597 | 2025-11-28 19:39:07.718 |

*Note: Each embedding_cache record also contains an "embedding" column with a 384-dimensional float array (vector) for semantic search. These are omitted for readability.*

---

## Empty Tables (0 records each)

### matches
| id | student_id | volunteer_id | assigned_subjects | primary_field_id | match_score | auto_suggested | match_reasons | status | rejection_reason | admin_id | admin_notes | email_sent_at | volunteer_responded_at | start_date | end_date | total_sessions | total_hours | created_at | updated_at |
|----|------------|--------------|-------------------|------------------|-------------|----------------|---------------|--------|------------------|----------|-------------|---------------|------------------------|------------|----------|----------------|-------------|------------|------------|
| (no data) |

### sessions
| id | match_id | scheduled_at | duration_minutes | status | subjects_covered | volunteer_notes | student_notes | student_attendance | volunteer_attendance | materials_shared | created_at | updated_at |
|----|----------|--------------|------------------|--------|------------------|-----------------|---------------|--------------------|----------------------|------------------|------------|------------|
| (no data) |

### feedback
| id | match_id | session_id | given_by | given_to | rating | knowledge_rating | teaching_rating | punctuality_rating | subjects_feedback | comments | created_at |
|----|----------|------------|----------|----------|--------|------------------|-----------------|--------------------|--------------------|----------|------------|
| (no data) |

### causes
| id | name | description | is_active | priority | region | created_by | created_at | updated_at |
|----|------|-------------|-----------|----------|--------|------------|------------|------------|
| (no data) |

### fields_of_study
| id | name | category | parent_field_id | related_fields | is_active | created_at |
|----|------|----------|-----------------|----------------|-----------|------------|
| (no data) |

### email_templates
| id | name | subject | body | variables | is_active | created_by | created_at | updated_at |
|----|------|---------|------|-----------|-----------|------------|------------|------------|
| (no data) |

### match_scores_cache
| id | student_id | volunteer_id | field_id | score | reasons | is_available | calculated_at | expires_at |
|----|------------|--------------|----------|-------|---------|--------------|---------------|------------|
| (no data) |
