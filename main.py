from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TerminologySaveRequest(BaseModel):
    logicWords: List[str]
    physicNm: str
    infoType: str
    definition: str

class VocabSaveRequest(BaseModel):
    standardNm: str      # VOCABULARY_STANDARD_KNM (PK)
    domainYn: str        # VOCABULARY_DOMAIN_YN
    abbrNm: str          # VOCABULARY_ABBREVIATION_ENM
    replaceWord: str     # VOCABULARY_ALTERNATIVE_NM
    fullNm: str          # VOCABULARY_ENTIRE_ENM
    definition: str      # VOCABULARY_DEFINITION_CON

class DomainSaveRequest(BaseModel):
    domainNm: str            # 도메인명 (PK 역할을 할 가능성이 높음)
    domainGroupNm: str       # 도메인그룹명
    domainTcd: str           # 도메인유형코드 (VC, NM 등)
    domainLen: str           # 도메인길이
    domainPrecisionLen: str  # 소수점 길이 (NM일 때)
    domainDefinitionCon: str # 도메인정의
    infoTypeNm: str          # 인포타입 명칭 (자동 생성된 값)


# --- 1. 검색 관련 API (기존 기능 완전 유지) ---

@app.get("/terminologys")
def get_terminologys(keyword: str = "", target: str = "logic"):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 타겟에 따른 쿼리 분기 유지
            column = "TERMINOLOGY_LOGIC_NM" if target == "logic" else "TERMINOLOGY_PHYSIC_NM"
            query = f"SELECT * FROM DSSS.TERMINOLOGY_INFO WHERE {column} LIKE %s LIMIT 1000"
            cursor.execute(query, (f"%{keyword}%",))
            return cursor.fetchall()
    finally:
        conn.close()

@app.get("/term_words")
def get_words(keyword: str = "", target: str = "logic"): # 기본값 logic
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if target == "logic":
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_STANDARD_KNM LIKE %s"
            elif target == "physic":
                # 물리명 검색 시에는 영문 약어(ABBREVIATION) 컬럼을 조회
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_ABBREVIATION_ENM LIKE %s"
            else:
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_STANDARD_KNM LIKE %s"
            
            cursor.execute(query + " LIMIT 1000", (f"%{keyword}%",))
            return cursor.fetchall()
    except Exception as e:
        print(f"Error in get_words: {e}")
        return []
    finally:
        conn.close()


@app.get("/words")
def get_words(keyword: str = "", target: str = "word"): # 기본값을 word로 변경
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 프론트엔드의 searchType(target) 값과 DB 컬럼을 정확히 매칭
            if target == "word":
                # 표준단어명 기준
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_STANDARD_KNM LIKE %s"
            elif target == "abbr":
                # 영문약어 기준
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_ABBREVIATION_ENM LIKE %s"
            elif target == "full":
                # 영어 전체명 기준
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_ENTIRE_ENM LIKE %s"
            else:
                # 예외 케이스 처리 (전체 검색 등)
                query = "SELECT * FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_STANDARD_KNM LIKE %s"
            
            cursor.execute(query + " LIMIT 1000", (f"%{keyword}%",))
            return cursor.fetchall()
    except Exception as e:
        print(f"Error in get_words: {e}")
        return []
    finally:
        conn.close()

@app.get("/domains")
def get_domains(keyword: str = "", target: str = "domain"):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            column = "DOMAIN_NM" if target == "domain" else "DOMAIN_GROUP_NM"
            query = f"SELECT * FROM DSSS.DOMAIN_INFO WHERE {column} LIKE %s LIMIT 1000"
            cursor.execute(query, (f"%{keyword}%",))
            return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

# --- 2. 등록/수정/삭제 관련 API ---

@app.get("/domain_list")
def get_domain_list():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT DISTINCT DOMAIN_GROUP_NM, DOMAIN_NM, DOMAIN_INFOTYPE_NM 
                FROM DSSS.DOMAIN_INFO ORDER BY DOMAIN_GROUP_NM, DOMAIN_NM
            """
            cursor.execute(query)
            return cursor.fetchall()
    finally:
        conn.close()

@app.post("/save_terminology")
def save_terminology(data: TerminologySaveRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            actual_words = [w.strip() for w in data.logicWords if w and w.strip()]
            if not actual_words:
                raise HTTPException(status_code=400, detail="최소 하나 이상의 논리 단어가 필요합니다.")
                
            combined_logic_nm = "".join(actual_words)
            last_word = actual_words[-1] 
            logics = [None] * 5
            for i in range(min(len(actual_words), 5)):
                logics[i] = actual_words[i]

            sql = """
                INSERT INTO DSSS.TERMINOLOGY_INFO (
                    TERMINOLOGY_PHYSIC_NM, DOMAIN_INFOTYPE_NM, TERMINOLOGY_LOGIC_NM,
                    TERMINOLOGY_LOGICVOCABULARY1_NM, TERMINOLOGY_LOGICVOCABULARY2_NM, TERMINOLOGY_LOGICVOCABULARY3_NM, 
                    TERMINOLOGY_LOGICVOCABULARY4_NM, TERMINOLOGY_LOGICVOCABULARY5_NM,
                    TERMINOLOGY_DOMAIN_NM, TERMINOLOGY_DEFINITION_CON, CREATE_DTM
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE
                    TERMINOLOGY_LOGIC_NM = VALUES(TERMINOLOGY_LOGIC_NM),
                    DOMAIN_INFOTYPE_NM = VALUES(DOMAIN_INFOTYPE_NM),
                    TERMINOLOGY_LOGICVOCABULARY1_NM = VALUES(TERMINOLOGY_LOGICVOCABULARY1_NM),
                    TERMINOLOGY_LOGICVOCABULARY2_NM = VALUES(TERMINOLOGY_LOGICVOCABULARY2_NM),
                    TERMINOLOGY_LOGICVOCABULARY3_NM = VALUES(TERMINOLOGY_LOGICVOCABULARY3_NM),
                    TERMINOLOGY_LOGICVOCABULARY4_NM = VALUES(TERMINOLOGY_LOGICVOCABULARY4_NM),
                    TERMINOLOGY_LOGICVOCABULARY5_NM = VALUES(TERMINOLOGY_LOGICVOCABULARY5_NM),
                    TERMINOLOGY_DOMAIN_NM = VALUES(TERMINOLOGY_DOMAIN_NM),
                    TERMINOLOGY_DEFINITION_CON = VALUES(TERMINOLOGY_DEFINITION_CON),
                    CREATE_DTM = NOW()
            """
            params = (data.physicNm, data.infoType, combined_logic_nm, *logics, last_word, data.definition)
            cursor.execute(sql, params)
            
            # rowcount 확인: 1이면 신규, 2이면 업데이트, 0이면 변경없음
            count = cursor.rowcount
            conn.commit()

            if count == 1:
                return {"status": "success", "type": "INSERT", "message": "신규 용어가 등록되었습니다."}
            elif count == 2:
                return {"status": "success", "type": "UPDATE", "message": "기존 용어 정보가 업데이트되었습니다."}
            else:
                return {"status": "success", "type": "NONE", "message": "변경사항이 없습니다."}
            
    except Exception as e:
        print(f"Error saving terminology: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/terminology_detail/{physic_nm}")
def get_terminology_detail(physic_nm: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT p.*, d.DOMAIN_GROUP_NM, d.DOMAIN_NM 
                FROM DSSS.TERMINOLOGY_INFO p
                LEFT JOIN DSSS.DOMAIN_INFO d ON p.DOMAIN_INFOTYPE_NM = d.DOMAIN_INFOTYPE_NM
                WHERE p.TERMINOLOGY_PHYSIC_NM = %s
            """
            cursor.execute(query, (physic_nm,))
            return cursor.fetchone()
    finally:
        conn.close()

@app.get("/terminology_list")
def get_terminology_list():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM DSSS.TERMINOLOGY_INFO ORDER BY CREATE_DTM DESC")
            return cursor.fetchall()
    finally:
        conn.close()

@app.delete("/delete_terminology/{physic_nm}")
def delete_terminology(physic_nm: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM DSSS.TERMINOLOGY_INFO WHERE TERMINOLOGY_PHYSIC_NM = %s", (physic_nm,))
            conn.commit()
            return {"status": "success"}
    finally:
        conn.close()


# --- 3. 단어(Vocab) 등록/수정/삭제 API ---

@app.post("/save_word")
def save_word(data: VocabSaveRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # ON DUPLICATE KEY UPDATE를 사용하여 존재하면 수정, 없으면 삽입
            sql = """
                INSERT INTO DSSS.VOCABULARY_INFO (
                    VOCABULARY_STANDARD_KNM, 
                    VOCABULARY_ABBREVIATION_ENM, 
                    VOCABULARY_ENTIRE_ENM, 
                    VOCABULARY_DEFINITION_CON,
                    VOCABULARY_DOMAIN_YN,
                    VOCABULARY_ALTERNATIVE_NM,
                    CREATE_DTM
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE
                    VOCABULARY_ABBREVIATION_ENM = VALUES(VOCABULARY_ABBREVIATION_ENM),
                    VOCABULARY_ENTIRE_ENM = VALUES(VOCABULARY_ENTIRE_ENM),
                    VOCABULARY_DEFINITION_CON = VALUES(VOCABULARY_DEFINITION_CON),
                    VOCABULARY_DOMAIN_YN = VALUES(VOCABULARY_DOMAIN_YN),
                    VOCABULARY_ALTERNATIVE_NM = VALUES(VOCABULARY_ALTERNATIVE_NM),
                    CREATE_DTM = NOW()
            """
            cursor.execute(sql, (
                data.standardNm,    # 단어표준한글명
                data.abbrNm,        # 단어약어영문명
                data.fullNm,        # 단어전체영문명
                data.definition,    # 단어정의내용
                data.domainYn,      # 단어도메인여부
                data.replaceWord    # 단어대체명 (스키마: VOCABULARY_ALTERNATIVE_NM)
            ))
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        print(f"Error saving word: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/delete_word/{standard_nm}")
def delete_word(standard_nm: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 단어표준한글명을 기준으로 삭제
            sql = "DELETE FROM DSSS.VOCABULARY_INFO WHERE VOCABULARY_STANDARD_KNM = %s"
            cursor.execute(sql, (standard_nm,))
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        print(f"Error deleting word: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# --- 4. 도메인(Domain) 등록/수정/삭제 API ---

@app.post("/save_domain")
def save_domain(data: DomainSaveRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 현재 도메인 그룹에 속한 데이터 개수 확인 (순번 계산)
            count_sql = "SELECT COUNT(*) FROM DSSS.DOMAIN_INFO WHERE DOMAIN_GROUP_NM = %s"
            cursor.execute(count_sql, (data.domainGroupNm,))
            current_count = cursor.fetchone()['COUNT(*)']
            
            # 순번 결정 (새로 추가될 경우 현재 개수 + 1)
            # 만약 ON DUPLICATE KEY UPDATE로 인해 '수정'되는 경우라면 정렬명 사용
            new_seq = current_count + 1
            
            # 정렬명(DOMAIN_SORT_NM) 생성 로직
            # 10 미만이면 앞에 0을 붙임
            seq_str = str(new_seq).zfill(2) if new_seq < 10 else str(new_seq)
            domain_sort_nm = f"{data.domainGroupNm}{seq_str}"

            # 데이터 타입 전처리
            precision = int(data.domainPrecisionLen) if data.domainPrecisionLen and data.domainTcd == 'NM' else None
            length = int(data.domainLen) if data.domainLen else 0

            # INSERT / UPDATE 실행
            sql = """
                INSERT INTO DSSS.DOMAIN_INFO (
                    DOMAIN_NM, 
                    DOMAIN_GROUP_NM, 
                    DOMAIN_TCD, 
                    DOMAIN_LEN, 
                    DOMAIN_PRECISION_LEN, 
                    DOMAIN_DEFINITION_CON,
                    DOMAIN_INFOTYPE_NM,
                    DOMAIN_SORT_NM,
                    CREATE_DTM
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE
                    DOMAIN_GROUP_NM = VALUES(DOMAIN_GROUP_NM),
                    DOMAIN_TCD = VALUES(DOMAIN_TCD),
                    DOMAIN_LEN = VALUES(DOMAIN_LEN),
                    DOMAIN_PRECISION_LEN = VALUES(DOMAIN_PRECISION_LEN),
                    DOMAIN_DEFINITION_CON = VALUES(DOMAIN_DEFINITION_CON),
                    DOMAIN_INFOTYPE_NM = VALUES(DOMAIN_INFOTYPE_NM),
                    -- 수정 시에는 정렬명을 유지
                    DOMAIN_SORT_NM = IF(DOMAIN_SORT_NM IS NULL OR DOMAIN_SORT_NM = '', VALUES(DOMAIN_SORT_NM), DOMAIN_SORT_NM),
                    CREATE_DTM = NOW()
            """
            cursor.execute(sql, (
                data.domainNm,
                data.domainGroupNm,
                data.domainTcd,
                length,
                precision,
                data.domainDefinitionCon,
                data.infoTypeNm,
                domain_sort_nm
            ))
            conn.commit()
            return {"status": "success", "sort_nm": domain_sort_nm}
    except Exception as e:
        print(f"Error saving domain: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/delete_domain/{domain_nm}")
def delete_domain(domain_nm: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 도메인명을 기준으로 삭제
            sql = "DELETE FROM DSSS.DOMAIN_INFO WHERE DOMAIN_NM = %s"
            cursor.execute(sql, (domain_nm,))
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        print(f"Error deleting domain: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)