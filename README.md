# Data Standardization System

데이터 표준화 지원 시스템은 조직 내 데이터의 용어(Terminology), 단어(Vocabulary), 도메인(Domain)을  
체계적으로 관리하고 데이터 정의의 일관성을 유지하기 위한 **웹 기반 데이터 표준 관리 시스템**입니다.  

본 시스템은 데이터 모델링 및 데이터 거버넌스 환경에서 표준 용어 관리와 데이터 정의 관리를 지원합니다.

---

## System Architecture


Frontend (HTML / JavaScript)
│

Backend API (FastAPI)
│

Database (Postgre)


---

## Tech Stack

- **Backend** : Python, FastAPI  
- **Frontend** : HTML, JavaScript  
- **Database** : MariaDB  
- **Server** : Uvicorn  
- **Version Control** : GitHub  

---

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload
