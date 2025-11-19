#!/usr/bin/env python3
import sys
import json
import time
import re
import warnings
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# quiet noisy warnings
warnings.filterwarnings("ignore")

def clean_course_code(code):
    """Clean course code by removing common suffixes and spaces"""
    if not code:
        return ""
    # Remove Regular, Practical, Theory and trim spaces
    cleaned = re.sub(r'\s*(Regular|Practical|Theory|Lab|Tutorial)\s*', '', code, flags=re.IGNORECASE)
    # Remove extra spaces and normalize
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def find_course_title_from_attendance(course_code, attendance):
    """Find course title by matching course codes with attendance data"""
    if not course_code:
        return "Unnamed Course", "Theory"
    
    # Strategy 1: Exact match
    for course in attendance:
        if course["course_code"] == course_code:
            return course["course_title"], course["category"]
    
    # Strategy 2: Clean both and match
    clean_target = clean_course_code(course_code)
    for course in attendance:
        clean_att = clean_course_code(course["course_code"])
        if clean_att == clean_target:
            return course["course_title"], course["category"]
    
    # Strategy 3: Partial match (course code contains or is contained)
    for course in attendance:
        clean_att = clean_course_code(course["course_code"])
        if clean_target in clean_att or clean_att in clean_target:
            return course["course_title"], course["category"]
    
    # Strategy 4: Match by course code pattern (like 21CSC101J)
    pattern = r'\b\d{2}[A-Z]{2,4}\d{2,3}[A-Z]?\b'
    target_match = re.search(pattern, course_code)
    if target_match:
        target_pattern = target_match.group(0)
        for course in attendance:
            att_match = re.search(pattern, course["course_code"])
            if att_match and att_match.group(0) == target_pattern:
                return course["course_title"], course["category"]
    
    return "Unnamed Course", "Theory"

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing username or password"}))
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]

    if "@srmist.edu.in" not in username:
        username += "@srmist.edu.in"

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1366,768")
    chrome_options.page_load_strategy = "eager"

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:
        # ---------------- LOGIN ----------------
        driver.get("https://academia.srmist.edu.in/")
        wait = WebDriverWait(driver, 12)

        iframe = wait.until(EC.presence_of_element_located((By.ID, "signinFrame")))
        driver.switch_to.frame(iframe)

        username_input = wait.until(EC.element_to_be_clickable((By.ID, "login_id")))
        username_input.send_keys(username)
        username_input.send_keys(Keys.ENTER)

        driver.switch_to.default_content()
        time.sleep(2)

        iframe = wait.until(EC.presence_of_element_located((By.ID, "signinFrame")))
        driver.switch_to.frame(iframe)

        password_input = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@type='password']")))
        password_input.send_keys(password)
        password_input.send_keys(Keys.ENTER)

        driver.switch_to.default_content()
        time.sleep(3)

        # Quick login check
        if "signin" in driver.current_url.lower() or "login" in driver.current_url.lower():
            print(json.dumps({"error": "Login failed"}))
            sys.exit(1)

        # ---------------- LOAD ATTENDANCE PAGE ----------------
        attendance = []
        marks = []

        try:
            driver.get("https://academia.srmist.edu.in/#Page:My_Attendance")
            time.sleep(5)
            html_att = driver.page_source
            soup_att = BeautifulSoup(html_att, "html.parser")

            # ---------------- ATTENDANCE (DUAL MODE) ----------------
            table = soup_att.find("table", {"bgcolor": "#FAFAD2"})

            if table:
                rows = table.find_all("tr")[1:]  # skip header

                for row in rows:
                    cols = row.find_all("td")
                    texts = [td.get_text(strip=True) for td in cols]

                    # Skip junk rows
                    if not texts or len(texts) < 2:
                        continue

                    # Skip header rows
                    if any(skip in texts[0] for skip in ["Photo-ID", "Registration", "Name", "Roll"]):
                        continue

                    # ---------------- MODE 1: FULL ATTENDANCE AVAILABLE (9+ COLUMNS) ----------------
                    if len(cols) >= 9:
                        attendance.append({
                            "course_code": texts[0],
                            "course_title": texts[1],
                            "category": texts[2],
                            "faculty": texts[3],
                            "slot": texts[4],
                            "room": texts[5],
                            "hours_conducted": texts[6],
                            "hours_absent": texts[7],
                            "attendance_percent": texts[8]
                        })
                        continue

                    # ---------------- MODE 2: FROZEN ATTENDANCE (7 COLUMNS) ----------------
                    if len(cols) >= 7:
                        # attendance % is last column, inside <strong>
                        last_td = cols[-1]
                        strong = last_td.find("strong")
                        percent = strong.get_text(strip=True) if strong else texts[-1]

                        attendance.append({
                            "course_code": texts[0],
                            "course_title": texts[1],
                            "category": texts[2],
                            "faculty": texts[3],
                            "slot": texts[4],
                            "room": texts[5],
                            "attendance_percent": percent,
                            "hours_conducted": "",
                            "hours_absent": ""
                        })
        except Exception as e:
            print(f"Attendance error: {e}", file=sys.stderr)

        # ---------------- MARKS (WITH COURSE TITLES FROM ATTENDANCE) ----------------
        marks = []
        try:
            for inner_table in soup_att.find_all("table", attrs={"border": True}):
                parent_row = inner_table.find_parent("tr")
                course_code = None
                if parent_row:
                    code_tag = parent_row.find("td", bgcolor="#E6E6FA")
                    if code_tag:
                        text = code_tag.get_text(strip=True)
                        if not any(skip in text for skip in ["Photo-ID", "Registration", "Name"]):
                            course_code = text

                if course_code:
                    test_scores = []
                    for td in inner_table.find_all("td", bgcolor="#E6E6FA"):
                        strong = td.find("strong")
                        label = strong.get_text(strip=True) if strong else td.get_text(strip=True)
                        
                        br = td.find("br")
                        score_text = ""
                        if br:
                            nxt = br.next_sibling
                            score_text = nxt.strip() if nxt else ""
                        else:
                            next_td = td.find_next_sibling("td")
                            if next_td:
                                score_text = next_td.get_text(strip=True)

                        m = re.search(r"(\d+(\.\d+)?)", score_text)
                        score = m.group(1) if m else ""

                        if label and score:
                            lab_m = re.search(r"([A-Za-z0-9\-]+\/\d+)", label)
                            label_clean = lab_m.group(1) if lab_m else label
                            test_scores.append({"label": label_clean, "score": score})

                    if test_scores:
                        # Find course title using attendance data
                        course_title, category = find_course_title_from_attendance(course_code, attendance)
                        
                        marks.append({
                            "course_code": course_code, 
                            "course_title": course_title,
                            "category": category,
                            "tests": test_scores
                        })
        except Exception as e:
            print(f"Marks error: {e}", file=sys.stderr)

        # ---------------- LOAD TIME TABLE (COURSES) ----------------
        driver.get("https://academia.srmist.edu.in/#Page:My_Time_Table_2023_24")
        time.sleep(5)

        html_tt = driver.page_source
        soup_tt = BeautifulSoup(html_tt, "html.parser")

        courses = []
        total_credits = 0

        # Find the table with class "course_tbl"
        ttable = soup_tt.find("table", {"class": "course_tbl"})
        if ttable:
            for row in ttable.find_all("tr")[1:]:  # skip header
                cols = [td.get_text(strip=True) for td in row.find_all("td")]

                if len(cols) < 11:
                    continue

                try:
                    credit_val = int(cols[3])
                except:
                    credit_val = 0

                total_credits += credit_val

                courses.append({
                    "course_code": cols[1],
                    "course_title": cols[2],
                    "credits": credit_val,
                    "reg_type": cols[4],
                    "category": cols[5],
                    "course_type": cols[6],
                    "faculty": cols[7],
                    "slot": cols[8],
                    "room": cols[9],
                    "academic_year": cols[10]
                })

        # ---------------- PROFILE EXTRACTION ----------------
        profile = {
            "regno": "",
            "name": "",
            "program": "",
            "department": "",
            "specialization": "",
            "semester": ""
        }

        def extract(html, label):
            m = re.search(rf"{label}\s*</td>\s*<td>\s*<strong>(.*?)</strong>", html, re.I | re.S)
            return m.group(1).strip() if m else ""

        # use attendance page HTML (where profile reliably exists)
        html_profile = html_att if 'html_att' in locals() else html_tt

        profile["regno"] = extract(html_profile, "Registration Number:")
        profile["name"] = extract(html_profile, "Name:") or "Student"
        profile["program"] = extract(html_profile, "Program:")
        profile["department"] = extract(html_profile, "Department:")
        profile["specialization"] = extract(html_profile, "Specialization:")
        profile["semester"] = extract(html_profile, "Semester:")

        # ---------------- OUTPUT ----------------
        output = {
            "profile": profile,
            "attendance": attendance,
            "marks": marks,
            "courses": courses,
            "total_credits": total_credits
        }

        print(json.dumps(output, indent=2))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
    finally:
        driver.quit()

if __name__ == "__main__":
    main()